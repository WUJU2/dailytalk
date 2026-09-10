/* =========================================================
 * DailyTalk 主应用
 * 外教互动 + 场景对练 + 口语评分 + 纠错 + 学习报告
 * ========================================================= */
(function () {
  "use strict";

  /* ---------------- 工具 ---------------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function pad2(n) { return (n < 10 ? "0" : "") + n; }
  function fmtDate(d) { return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate()); }
  function dayKey(ts) { var d = new Date(ts); return fmtDate(d); }
  function fmtTime(ts) { var d = new Date(ts); return pad2(d.getHours()) + ":" + pad2(d.getMinutes()); }
  function fmtDur(sec) {
    sec = Math.round(sec || 0);
    if (sec < 60) return sec + " 秒";
    var m = Math.floor(sec / 60); var s = sec % 60;
    return m + " 分" + (s ? " " + s + " 秒" : "");
  }

  var LS_HIST = "dailytalk_hist_v1";
  var LS_SET = "dailytalk_settings_v1";

  var DATA = window.DailyTalkData;
  var CORRECT = window.DailyTalkCorrect;
  if (!DATA || !CORRECT) { alert("资源加载失败，请刷新页面。"); return; }

  /* ---------------- 全局状态 ---------------- */
  var settings = loadSettings();
  var state = {
    view: "dashboard",
    session: null,       // 当前对话会话
    listening: false,
    thinking: false,
    levelFilter: 0
  };

  function loadSettings() {
    try {
      var raw = JSON.parse(localStorage.getItem(LS_SET) || "{}");
      return {
        level: raw.level || "intermediate",
        autoSpeak: raw.autoSpeak !== false,
        showHint: raw.showHint !== false,
        rate: raw.rate || 0.9,
        goalMin: raw.goalMin || 15
      };
    } catch (e) { return { level: "intermediate", autoSpeak: true, showHint: true, rate: 0.9, goalMin: 15 }; }
  }
  function saveSettings() { try { localStorage.setItem(LS_SET, JSON.stringify(settings)); } catch (e) {} }

  function loadHist() {
    try { return JSON.parse(localStorage.getItem(LS_HIST) || "[]"); } catch (e) { return []; }
  }
  function saveHist(h) { try { localStorage.setItem(LS_HIST, JSON.stringify(h)); } catch (e) {} }
  var history = loadHist();

  function toast(msg, ms) {
    var el = $("#toast");
    if (!el) return;
    el.textContent = msg;
    el.hidden = false;
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { el.hidden = true; }, ms || 2600);
  }

  /* ---------------- 视图切换 ---------------- */
  function switchView(name) {
    state.view = name;
    $$(".nav-item[data-view]").forEach(function (b) { b.classList.toggle("active", b.getAttribute("data-view") === name); });
    $$(".view").forEach(function (v) { v.classList.toggle("active", v.id === "view-" + name); });
    if (name === "dashboard") renderDashboard();
    if (name === "scenarios") renderScenarioGrid();
    if (name === "report") renderReport();
    if (name === "tutor") renderTutorSide();
    window.scrollTo(0, 0);
  }

  /* ---------------- 语音合成 TTS ---------------- */
  var voiceCache = [];
  function loadVoices() {
    if (window.speechSynthesis) { voiceCache = window.speechSynthesis.getVoices(); }
  }
  if (window.speechSynthesis) {
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }
  function pickVoice() {
    var en = voiceCache.filter(function (v) { return v.lang && v.lang.toLowerCase().indexOf("en") === 0; });
    if (!en.length) return null;
    var fav = en.filter(function (v) { return /google us english|samantha|zira|aria|jenny|susan/i.test(v.name); });
    return (fav[0] || en[0]);
  }
  function speak(text, cb, opts) {
    if (!window.speechSynthesis || !text) { if (cb) cb(); return; }
    opts = opts || {};
    window.speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(text);
    var v = pickVoice();
    if (v) u.voice = v;
    u.lang = "en-US";
    var base = parseFloat(settings.rate) || 0.9;
    if (opts.slow) base = Math.max(0.6, base - 0.18);
    if (settings.level === "beginner" && !opts.slow) base = Math.min(base, 0.85);
    u.rate = opts.rate || base;
    u.pitch = 1;
    if (cb) u.onend = cb;
    setTutorStatus("talking");
    u.onerror = function () { setTutorStatus("idle"); if (cb) cb(); };
    try { window.speechSynthesis.speak(u); } catch (e) { setTutorStatus("idle"); if (cb) cb(); }
  }
  function stopSpeak() { if (window.speechSynthesis) window.speechSynthesis.cancel(); }

  /* ---------------- 语音识别 ---------------- */
  var SR = (window.SpeechRecognition || window.webkitSpeechRecognition);
  var recognizer = null;
  var rec = { startTs: 0, finals: [], interim: "", lastFinalTs: 0 };

  function micSupported() { return !!SR; }

  function resetMicUI() {
    state.listening = false;
    var b = $("#btnMic");
    if (b) { b.classList.remove("rec"); b.textContent = "🎤"; b.title = "点击开始录音"; }
    var ls = $("#liveSpeech"); if (ls) ls.hidden = true;
    var hint = $("#micHint"); if (hint) hint.textContent = "点击 🎤 开始语音 → 说完自动识别发送（推荐 Chrome / Edge）。也可直接打字练习。";
    setMicStatus("idle");
  }

  function setMicStatus(kind) {
    var dot = $("#dotMic"), txt = $("#chipMicText");
    if (!dot || !txt) return;
    if (!micSupported()) { dot.className = "dot dot-idle"; txt.textContent = "语音：本环境不支持"; return; }
    if (kind === "rec") { dot.className = "dot dot-rec"; txt.textContent = "正在聆听…"; }
    else if (kind === "ok") { dot.className = "dot dot-ok"; txt.textContent = "语音就绪"; }
    else { dot.className = "dot dot-idle"; txt.textContent = "语音待命"; }
  }

  /* 识别结束后统一收尾：有内容则发送 */
  function handleRecognitionFinal() {
    var b = $("#btnMic");
    if (b) { b.classList.remove("rec"); b.textContent = "🎤"; b.title = "点击开始录音"; }
    var ls = $("#liveSpeech"); if (ls) ls.hidden = true;
    var finText = rec.finals.map(function (f) { return f.text; }).join(" ").trim();
    if (finText) {
      var dur = rec.lastFinalTs > rec.startTs ? (rec.lastFinalTs - rec.startTs) / 1000 : null;
      var conf = rec.finals.length ? rec.finals.reduce(function (s, f) { return s + f.conf; }, 0) / rec.finals.length : null;
      resetMicUI();
      sendUserMessage(finText, { speech: true, conf: conf, dur: dur });
    } else {
      resetMicUI();
      toast("没有识别到内容，试试靠近麦克风再开口。");
    }
  }

  function startMic() {
    if (!micSupported()) { toast("当前浏览器不支持语音识别，请用 Chrome / Edge 打开，或直接打字练习。", 3600); return; }
    if (!recognizer) {
      try {
        recognizer = new SR();
        recognizer.lang = "en-US";
        recognizer.continuous = false;
        recognizer.interimResults = true;
        recognizer.maxAlternatives = 1;
      } catch (e) { toast("无法初始化语音识别。"); return; }
    }
    rec.finals = [];
    rec.interim = "";
    rec.startTs = Date.now();
    rec.lastFinalTs = 0;

    recognizer.onresult = function (ev) {
      var interim = "";
      for (var i = ev.resultIndex; i < ev.results.length; i++) {
        var r = ev.results[i];
        var txt = r[0].transcript || "";
        if (r.isFinal) {
          rec.finals.push({ text: txt, conf: r[0].confidence || 0 });
          rec.lastFinalTs = Date.now();
        } else interim += txt;
      }
      rec.interim = interim;
      var ls = $("#liveSpeech");
      if (ls) {
        ls.hidden = false;
        ls.innerHTML = esc(interim || rec.finals.map(function (f) { return f.text; }).join(" "));
      }
    };
    recognizer.onerror = function (ev) {
      if (ev.error === "not-allowed" || ev.error === "service-not-allowed") {
        toast("麦克风权限被拒绝：请在浏览器地址栏允许使用麦克风。", 4200);
      } else if (ev.error === "no-speech") {
        toast("没有听到声音，请再试一次（麦克风已关闭）。");
      } else if (ev.error === "network") {
        toast("语音识别需要网络（Chrome 在线服务），请检查网络后重试。");
      }
    };
    recognizer.onend = function () {
      if (!state.listening) return; // 手动停止时由 stopMic 统一收尾
      state.listening = false;
      handleRecognitionFinal();
    };
    try {
      state.listening = true;
      var b = $("#btnMic");
      if (b) { b.classList.add("rec"); b.title = "点击停止"; }
      setMicStatus("rec");
      recognizer.start();
    } catch (e) { state.listening = false; resetMicUI(); }
  }

  function stopMic() {
    state.listening = false;
    var b = $("#btnMic");
    if (b) { b.classList.remove("rec"); b.textContent = "🎤"; }
    setMicStatus("ok");
    if (recognizer) { try { recognizer.stop(); } catch (e) {} }
    handleRecognitionFinal();
  }

  /* ---------------- 会话与评分 ---------------- */
  var GEN_ACKS = ["Got it!", "Okay!", "Alright!", "Perfect!", "Great!", "Sure!", "Sounds good!", "Nice!", "Good!"];
  var ACK_ITEM = ["{i} — great pick!", "Ah, {i}, nice choice!", "{i}? Sure thing!", "One {i}, coming up!"];
  var LEVEL_NAME = { beginner: "入门", intermediate: "进阶", advanced: "高手" };

  function newSession(modeId) {
    var sc = null;
    if (modeId && modeId !== "free") {
      sc = DATA.scenarios.filter(function (s) { return s.id === modeId; })[0] || null;
    }
    state.session = {
      id: Date.now(),
      mode: sc ? sc.id : "free",
      title: sc ? sc.title : "Free Talk",
      zh: sc ? sc.zh : "自由对话",
      icon: sc ? sc.icon : "💬",
      level: settings.level,
      sc: sc || null,
      startTs: Date.now(),
      stepIdx: -1,
      answerCount: 0,
      prompts: 0,
      finished: false,
      userCount: 0,
      dims: { grammar: [], vocab: [], flu: [], pron: [] },
      errPool: []       // [{text,fix,type,note,count}]
    };
    return state.session;
  }

  function currentSession() {
    if (!state.session || state.session.finished) {
      return newSession("free");
    }
    return state.session;
  }

  function matchMenu(text) {
    var s = state.session && state.session.sc;
    if (!s || !s.menu || !s.menu.length) return null;
    var low = text.toLowerCase();
    var found = null;
    s.menu.forEach(function (item) {
      if (!found && low.indexOf(item.toLowerCase()) >= 0) found = item;
    });
    return found;
  }

  function hasVocab(text) {
    var s = state.session && state.session.sc;
    if (!s) return false;
    var low = text.toLowerCase();
    for (var i = 0; i < s.vocab.length; i++) {
      if (low.indexOf(s.vocab[i].toLowerCase()) >= 0) return true;
    }
    return false;
  }

  function wordCount(text) { return (text || "").trim().split(/\s+/).filter(Boolean).length; }

  function scoreGrammar(a) { return clamp(100 - a.count * 9, 25, 100); }
  function scoreVocab(text, a, sc) {
    var wc = a.wordCount;
    var base;
    if (wc <= 2) base = 46; else if (wc <= 4) base = 68; else if (wc <= 10) base = 84; else if (wc <= 16) base = 90; else base = 82;
    var words = text.toLowerCase().match(/[a-z']+/g) || [];
    var uniq = {};
    words.forEach(function (w) { uniq[w] = 1; });
    var ratio = words.length ? Object.keys(uniq).length / words.length : 0;
    if (ratio >= 0.72) base += 5; else if (ratio >= 0.55) base += 2;
    if (sc) {
      var hit = 0;
      sc.vocab.forEach(function (v) { if (text.toLowerCase().indexOf(v.toLowerCase()) >= 0) hit++; });
      base += Math.min(hit, 5) * 2;
    }
    return clamp(base, 30, 98);
  }
  function scoreFluency(wc, dur) {
    if (!dur || dur <= 0.4 || wc < 3) return null;
    var wpm = wc / (dur / 60000);
    if (wpm < 50) return 46;
    if (wpm < 70) return 60;
    if (wpm < 90) return 76;
    if (wpm < 120) return 88;
    if (wpm < 150) return 96;
    if (wpm < 190) return 92;
    return 84;
  }
  function scorePron(conf) {
    if (conf == null) return null;
    return clamp(Math.round(conf * 100), 35, 99);
  }
  function overallOf(d) {
    /* 加权平均（发音缺失时自动归一） */
    var w = { grammar: 0.34, vocab: 0.26, flu: 0.2, pron: 0.2 };
    var sum = 0, wsum = 0;
    ["grammar", "vocab", "flu", "pron"].forEach(function (k) {
      if (d[k] != null) { sum += d[k] * w[k]; wsum += w[k]; }
    });
    return wsum ? Math.round(sum / wsum) : 0;
  }

  function analyzeMessage(text, meta) {
    var a = CORRECT.analyze(text);
    var sc = state.session && state.session.sc;
    var d = {
      grammar: scoreGrammar(a),
      vocab: scoreVocab(text, a, sc),
      flu: scoreFluency(a.wordCount, meta.dur),
      pron: scorePron(meta.conf)
    };
    /* 录音但未识别到置信度/时长 -> 补一个偏中性发音参考 */
    if (meta.speech && d.pron == null) d.pron = 74;
    var overall = overallOf(d);
    return { analysis: a, dims: d, overall: overall };
  }

  function poolError(session, err) {
    for (var i = 0; i < session.errPool.length; i++) {
      var e = session.errPool[i];
      if (e.text === err.text && e.fix === err.fix) { e.count++; return; }
    }
    session.errPool.push({ text: err.text, fix: err.fix, type: err.type, note: err.note, count: 1 });
  }

  /* ---------------- 对话引擎 ---------------- */
  function isInterjection(text) {
    var low = text.toLowerCase();
    if (/\b(say it again|say again|repeat|again|one more time|pardon)\b/.test(low)) return "again";
    if (/\b(slow|slower|speak slowly|too fast)\b/.test(low)) return "slow";
    if (/\b(what do you mean|mean\?|meaning|i don't understand|didn't catch|how do you say|translate|what is .{0,20} meaning)\b/.test(low)) return "confuse";
    if (/\b(who are you|your name|what's your name|what is your name)\b/.test(low)) return "whoami";
    if (/\b(help|how to answer|i don't know what to say|what should i say)\b/.test(low)) return "help";
    return null;
  }

  function askCurrentStep(extraPrefix) {
    var s = state.session;
    var steps = s.sc.steps;
    if (s.stepIdx >= steps.length) return false;
    var step = steps[s.stepIdx];
    var qText = (extraPrefix ? extraPrefix + " " : "") + step.q;
    tutorSay(qText, step.h || "", { chips: step.chips || [] });
    return true;
  }

  function advanceAndAsk(ackText) {
    var s = state.session;
    s.stepIdx++;
    if (ackText) tutorSay(ackText, "", { silent: true });
    if (s.stepIdx < s.sc.steps.length) {
      var step = s.sc.steps[s.stepIdx];
      tutorSay(step.q, step.h || "", { chips: step.chips || [] });
      return false;
    }
    /* 场景结束 */
    finishScenario();
    return true;
  }

  function finishScenario() {
    var s = state.session;
    s.finished = true;
    if (s.sc) {
      tutorSay(s.sc.outro, "🎉 场景完成！点击「结束并评分」查看成绩。", { silent: false });
    }
    var sugg = $("#suggBar"); if (sugg) sugg.hidden = true;
    var hint = $("#micHint"); if (hint) hint.textContent = "场景已完成，点击右上「结束并评分」查看本课成绩～";
  }

  function handleScripted(text) {
    var s = state.session;
    var sc = s.sc;
    var steps = sc.steps;
    var inter = isInterjection(text);

    if (inter === "again") {
      var lastStep = steps[Math.min(Math.max(s.stepIdx, 0), steps.length - 1)];
      tutorSay(lastStep.q, (lastStep.h || ""), { chips: lastStep.chips, replay: true });
      return;
    }
    if (inter === "slow") {
      var st2 = steps[Math.min(Math.max(s.stepIdx, 0), steps.length - 1)];
      tutorSay("Of course! I'll say it slowly: " + st2.q, st2.h || "", { chips: st2.chips, slow: true });
      return;
    }
    if (inter === "confuse") {
      var st3 = steps[Math.min(Math.max(s.stepIdx, 0), steps.length - 1)];
      tutorSay("Good question! This means: " + (st3.h || st3.q) + " 😊 Now let's try again — " + st3.q, "", { chips: st3.chips });
      return;
    }
    if (inter === "whoami") {
      tutorSay("I'm Emma, your friendly American English tutor! I'm here to help you practice daily English. Now back to our conversation — " + steps[Math.min(Math.max(s.stepIdx, 0), steps.length - 1)].q, "");
      return;
    }
    if (inter === "help") {
      var st4 = steps[Math.min(Math.max(s.stepIdx, 0), steps.length - 1)];
      tutorSay("No worries! For this question, you can say something like: " + (st4.chips && st4.chips[0] ? st4.chips[0] : "a short answer in English") + ". Try it — I'm listening! 👂", "");
      return;
    }

    /* 正常作答处理 */
    var wc = wordCount(text);
    var item = matchMenu(text);
    var vhit = hasVocab(text);
    var goodEnough = wc >= 3 || item || vhit;

    if (!goodEnough && s.prompts < 1 && wc < 2) {
      s.prompts++;
      var curStep = steps[Math.min(Math.max(s.stepIdx, 0), steps.length - 1)];
      tutorSay("Let me help you. You can try saying: " + (curStep.chips && curStep.chips[0] ? curStep.chips[0] : "anything in English!") + " — give it a shot! 😊",
        curStep.h || "", { chips: curStep.chips, slow: true });
      return;
    }

    s.prompts = 0;
    s.answerCount++;
    var ack;
    if (item) {
      ack = pick(ACK_ITEM).replace("{i}", item);
    } else {
      ack = pick(GEN_ACKS);
    }
    advanceAndAsk(ack);
  }

  function handleFree(text) {
    var s = state.session;
    var res = DATA.chatReply(text, s.answerCount);
    s.answerCount++;
    if (res.over) {
      s.finished = true;
      tutorSay(res.say, "", {});
      setTimeout(function () { finishAndScore(true); }, 1600);
      return;
    }
    tutorSay(res.say, "", {});
  }

  function tutorTurn(text) {
    var s = state.session;
    if (!s) s = currentSession();
    if (s.sc) handleScripted(text);
    else handleFree(text);
  }

  /* ---------------- 渲染：消息气泡 ---------------- */
  function setTutorStatus(kind, text) {
    var stT = $("#tutorStatusText");
    var ava = $("#tutorAvatar");
    if (!stT) return;
    if (kind === "talking") {
      stT.textContent = text || "正在说话…";
      if (ava) ava.classList.add("talking");
    } else if (kind === "listening") {
      stT.textContent = text || "正在聆听你…";
      if (ava) ava.classList.remove("talking");
    } else {
      stT.textContent = text || "等待中";
      if (ava) ava.classList.remove("talking");
    }
  }

  function tutorSay(text, hint, opts) {
    opts = opts || {};
    var thread = $("#chatThread");
    if (!thread) return;

    var wrap = document.createElement("div");
    wrap.className = "msg tutor";
    var ava = document.createElement("div");
    ava.className = "msg-ava"; ava.textContent = "E";
    var bubble = document.createElement("div");
    bubble.className = "bubble";
    var en = document.createElement("div");
    en.className = "bubble-en";
    en.textContent = text;
    bubble.appendChild(en);
    if (hint && settings.showHint) {
      var hh = document.createElement("span");
      hh.className = "bubble-hint"; hh.textContent = "💡 " + hint;
      bubble.appendChild(hh);
    }
    var meta = document.createElement("div");
    meta.className = "bubble-meta";
    var rb = document.createElement("button");
    rb.className = "replay-btn"; rb.type = "button";
    rb.textContent = "🔊 重听" + (opts.slow ? "（慢速）" : "");
    rb.addEventListener("click", function () { speak(text, null, { slow: !!opts.slow }); });
    meta.appendChild(rb);
    if (hint) {
      var ch = document.createElement("button");
      ch.className = "replay-btn"; ch.type = "button"; ch.textContent = "🈶 中文";
      ch.addEventListener("click", function () {
        var hs = bubble.querySelector(".bubble-hint");
        if (hs) { hs.remove(); }
        else {
          var nh = document.createElement("span");
          nh.className = "bubble-hint"; nh.textContent = "💡 " + hint;
          bubble.appendChild(nh);
        }
      });
      meta.appendChild(ch);
    }
    bubble.appendChild(meta);
    wrap.appendChild(ava);
    wrap.appendChild(bubble);
    thread.appendChild(wrap);
    thread.scrollTop = thread.scrollHeight;

    if (settings.autoSpeak && !opts.silent) {
      setTutorStatus("talking");
      speak(text, function () { setTutorStatus("listening", "轮到你啦，请开口或打字…"); }, { slow: !!opts.slow });
    } else {
      setTutorStatus("listening", "轮到你啦，请开口或打字…");
    }

    if (opts.chips && opts.chips.length) showChips(opts.chips);
    else { var sb = $("#suggBar"); if (sb) sb.hidden = true; }
  }

  function showChips(chips) {
    var bar = $("#suggBar"), row = $("#suggChips");
    if (!bar || !row) return;
    bar.hidden = false;
    row.innerHTML = "";
    chips.forEach(function (c) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "sugg-chip"; b.textContent = c;
      b.addEventListener("click", function () {
        var inp = $("#msgInput");
        if (inp) { inp.value = c; inp.focus(); }
        speak(c, null, { slow: true });
      });
      var sp = document.createElement("button");
      sp.type = "button"; sp.className = "sugg-chip listen"; sp.textContent = "🔊";
      sp.title = "慢速示范发音";
      sp.addEventListener("click", function () { speak(c, null, { slow: true }); });
      var chipWrap = document.createElement("span");
      chipWrap.style.display = "inline-flex"; chipWrap.style.alignItems = "center"; chipWrap.style.gap = "4px";
      chipWrap.appendChild(b); chipWrap.appendChild(sp);
      row.appendChild(chipWrap);
    });
  }

  function userBubble(msg) {
    var thread = $("#chatThread");
    if (!thread) return;
    var wrap = document.createElement("div");
    wrap.className = "msg user";
    var ava = document.createElement("div");
    ava.className = "msg-ava"; ava.textContent = "我";
    var bubble = document.createElement("div");
    bubble.className = "bubble";
    var en = document.createElement("div");
    en.className = "bubble-en"; en.textContent = msg.text;
    bubble.appendChild(en);

    var meta = document.createElement("div");
    meta.className = "bubble-meta";
    var chipTxt = [];
    if (msg.dims.grammar != null) chipTxt.push("语法 " + msg.dims.grammar);
    if (msg.dims.vocab != null) chipTxt.push("词汇 " + msg.dims.vocab);
    if (msg.dims.flu != null) chipTxt.push("流利 " + msg.dims.flu);
    if (msg.dims.pron != null) chipTxt.push("发音 " + msg.dims.pron + "※");
    chipTxt.forEach(function (t) {
      var c = document.createElement("span");
      c.className = "meta-chip"; c.textContent = t;
      meta.appendChild(c);
    });
    if (msg.analysis && msg.analysis.count > 0) {
      var eb = document.createElement("span");
      eb.className = "meta-chip"; eb.style.background = "rgba(255,255,255,.24)";
      eb.textContent = "⚠ 发现 " + msg.analysis.count + " 处问题";
      meta.appendChild(eb);
    }
    bubble.appendChild(meta);

    /* 纠错卡 */
    if (msg.analysis && (msg.analysis.errors.length || msg.analysis.tips.length)) {
      var total = msg.analysis.errors.concat(msg.analysis.tips);
      var shown = total.slice(0, 3);
      var more = total.slice(3);
      var card = document.createElement("div");
      card.className = "fix-card";
      var head = document.createElement("div");
      head.className = "fix-head";
      head.textContent = "✏️ 纠错：" + (msg.analysis.errors.length ? "发现 " + msg.analysis.errors.length + " 处错误" : "表达不错") + (msg.analysis.corrected && msg.analysis.corrected.toLowerCase() !== msg.text.toLowerCase() ? " · 参考改法：" + msg.analysis.corrected : "");
      card.appendChild(head);
      shown.forEach(function (e) {
        var row = document.createElement("div");
        row.className = "fix-row";
        var s1 = document.createElement("s"); s1.className = "fix-orig"; s1.textContent = e.text;
        var arrow = document.createElement("span"); arrow.className = "fix-arrow"; arrow.textContent = "→";
        var s2 = document.createElement("span"); s2.className = "fix-new"; s2.textContent = e.fix;
        row.appendChild(s1); row.appendChild(arrow); row.appendChild(s2);
        var note = document.createElement("span"); note.className = "fix-note"; note.textContent = "[" + e.type + "] " + e.note;
        row.appendChild(note);
        card.appendChild(row);
      });
      if (more.length) {
        var moreBox = document.createElement("div");
        moreBox.hidden = true;
        more.forEach(function (e) {
          var row = document.createElement("div");
          row.className = "fix-row";
          var s1 = document.createElement("s"); s1.className = "fix-orig"; s1.textContent = e.text;
          var arrow = document.createElement("span"); arrow.className = "fix-arrow"; arrow.textContent = "→";
          var s2 = document.createElement("span"); s2.className = "fix-new"; s2.textContent = e.fix;
          row.appendChild(s1); row.appendChild(arrow); row.appendChild(s2);
          var note = document.createElement("span"); note.className = "fix-note"; note.textContent = "[" + e.type + "] " + e.note;
          row.appendChild(note);
          moreBox.appendChild(row);
        });
        card.appendChild(moreBox);
        var btn = document.createElement("button");
        btn.type = "button"; btn.className = "link-btn"; btn.textContent = "查看全部 " + more.length + " 处 ↕";
        btn.style.marginTop = "4px";
        btn.addEventListener("click", function () {
          moreBox.hidden = !moreBox.hidden;
          btn.textContent = moreBox.hidden ? "查看全部 " + more.length + " 处 ↕" : "收起 ↑";
        });
        card.appendChild(btn);
      }
      bubble.appendChild(card);
    }
    wrap.appendChild(ava);
    wrap.appendChild(bubble);
    thread.appendChild(wrap);
    thread.scrollTop = thread.scrollHeight;
  }

  /* ---------------- 发送用户消息 ---------------- */
  function sendUserMessage(text, meta) {
    text = (text || "").trim();
    if (!text) return;
    if (state.thinking) { toast("外教正在说话，请稍等…"); return; }
    if (state.session && state.session.finished) {
      toast("本次对话已结束：请点「结束并评分」查看成绩，或点「新开对话」继续练习。");
      return;
    }
    meta = meta || { speech: false, conf: null, dur: null };
    var s = currentSession();
    var res = analyzeMessage(text, meta);
    var msg = {
      text: text,
      analysis: res.analysis,
      dims: res.dims,
      overall: res.overall,
      ts: Date.now(),
      speech: meta.speech
    };
    s.userCount++;
    s.dims.grammar.push(res.dims.grammar);
    s.dims.vocab.push(res.dims.vocab);
    if (res.dims.flu != null) s.dims.flu.push(res.dims.flu);
    if (res.dims.pron != null) s.dims.pron.push(res.dims.pron);
    (res.analysis.errors || []).forEach(function (e) { poolError(s, e); });

    userBubble(msg);
    setTutorStatus("thinking", "思考中…");
    var inp = $("#msgInput"); if (inp) inp.value = "";

    state.thinking = true;
    setTimeout(function () {
      state.thinking = false;
      tutorTurn(text);
    }, 650 + Math.random() * 500);
  }

  /* ---------------- 结束与评分 ---------------- */
  function avgDim(arr) {
    if (!arr || !arr.length) return null;
    return Math.round(arr.reduce(function (a, b) { return a + b; }, 0) / arr.length);
  }

  function finishAndScore(silent) {
    var s = state.session;
    if (!s || s.userCount === 0) {
      toast("还没有说过话，先说一句再评分吧～");
      return;
    }
    var dimsAvg = {
      grammar: avgDim(s.dims.grammar),
      vocab: avgDim(s.dims.vocab),
      flu: avgDim(s.dims.flu),
      pron: avgDim(s.dims.pron)
    };
    var overall = overallOf(dimsAvg);
    var durSec = Math.round((Date.now() - s.startTs) / 1000);

    var record = {
      ts: Date.now(),
      day: dayKey(Date.now()),
      mode: s.mode, title: s.title, zh: s.zh, icon: s.icon,
      durSec: durSec, userCount: s.userCount,
      overall: overall, dims: dimsAvg,
      errors: s.errPool.slice(0, 30)
    };
    history.push(record);
    if (history.length > 200) history = history.slice(-200);
    saveHist(history);

    var finishedFlag = s.finished;
    state.session = null;
    var sugg = $("#suggBar"); if (sugg) sugg.hidden = true;

    if (!silent) openScoreModal(record, finishedFlag);
    renderDashboard();
    setTutorStatus("idle", "已保存本次成绩");
  }

  function openScoreModal(rec, scenarioDone) {
    var modal = $("#scoreModal");
    if (!modal) return;
    modal.hidden = false;
    var val = $("#scoreVal");
    if (val) val.textContent = rec.overall;
    var circle = $("#scoreCircle");
    if (circle) circle.style.setProperty("--p", rec.overall);

    var dimNames = { grammar: "语法", vocab: "词汇", flu: "流利度", pron: "发音" };
    var cls = { grammar: "g", vocab: "b", flu: "o", pron: "p" };
    var colors = { g: "#16a34a", b: "#4f6df5", o: "#f59e0b", p: "#a855f7" };
    var dimsWrap = $("#dimsBars");
    dimsWrap.innerHTML = "";
    ["grammar", "vocab", "flu", "pron"].forEach(function (k) {
      var v = rec.dims[k];
      var row = document.createElement("div");
      row.className = "dim-row";
      var name = document.createElement("span");
      name.className = "dim-name";
      name.textContent = dimNames[k] + (k === "pron" && v == null ? "（未测）" : "");
      var bar = document.createElement("div");
      bar.className = "dim-bar";
      var fill = document.createElement("div");
      fill.className = "dim-fill " + cls[k];
      fill.style.width = "0%";
      fill.style.background = colors[cls[k]];
      bar.appendChild(fill);
      var vv = document.createElement("span");
      vv.className = "dim-val";
      vv.textContent = v == null ? "--" : v;
      row.appendChild(name); row.appendChild(bar); row.appendChild(vv);
      dimsWrap.appendChild(row);
      setTimeout(function () { fill.style.width = (v == null ? 0 : v) + "%"; }, 60);
    });

    var errBox = $("#modalErrors");
    errBox.innerHTML = "";
    if (rec.errors && rec.errors.length) {
      rec.errors.slice(0, 14).forEach(function (e) {
        var item = document.createElement("div");
        item.className = "err-item";
        var line = document.createElement("div");
        line.className = "e-line";
        var s1 = document.createElement("s"); s1.className = "fix-orig"; s1.textContent = e.text;
        var arrow = document.createElement("span"); arrow.className = "fix-arrow"; arrow.textContent = "→";
        var s2 = document.createElement("span"); s2.className = "fix-new"; s2.textContent = e.fix;
        line.appendChild(s1); line.appendChild(arrow); line.appendChild(s2);
        var badge = document.createElement("span");
        badge.className = "err-badge"; badge.textContent = e.type;
        line.appendChild(badge);
        var cnt = document.createElement("span");
        cnt.className = "err-count"; cnt.textContent = e.count > 1 ? "×" + e.count : "";
        line.appendChild(cnt);
        item.appendChild(line);
        var note = document.createElement("div");
        note.className = "err-note"; note.textContent = e.note;
        item.appendChild(note);
        errBox.appendChild(item);
      });
      if (rec.errors.length > 14) {
        var more = document.createElement("p");
        more.className = "empty-hint"; more.textContent = "…等共 " + rec.errors.length + " 条，详见「学习报告-错误本」。";
        errBox.appendChild(more);
      }
    } else {
      var ok = document.createElement("p");
      ok.className = "empty-hint";
      ok.textContent = "🎉 太棒了，没有明显语法错误！继续保持！";
      errBox.appendChild(ok);
    }
    var noteP = document.createElement("p");
    noteP.className = "err-note";
    noteP.style.marginTop = "6px";
    noteP.textContent = "发音分为识别置信度参考值※，打字输入不产生发音分。";
    errBox.appendChild(noteP);
  }

  function closeModal(id) { var m = $("#" + id); if (m) m.hidden = true; }

  /* 从目标弹窗读取并保存 */
  function saveGoalFromModal() {
    var inp = $("#goalInput");
    var n = parseInt(inp ? inp.value : "", 10);
    if (isNaN(n) || n < 1) { toast("请输入 1–480 之间的分钟数"); if (inp) { inp.focus(); inp.select(); } return; }
    if (n > 480) n = 480;
    settings.goalMin = n; saveSettings(); renderDashboard();
    toast("每日目标已设为 " + n + " 分钟");
    closeModal("goalModal");
  }

  /* ---------------- 工作台 ---------------- */
  function todayStats() {
    var today = dayKey(Date.now());
    var todaySec = 0, todayCount = 0, allScore = [], scoreCnt = 0;
    history.forEach(function (h) {
      if (h.day === today) { todaySec += (h.durSec || 0); todayCount++; }
      if (h.overall != null) { allScore.push(h.overall); scoreCnt++; }
    });
    return {
      todayMin: Math.round(todaySec / 60),
      todayCount: todayCount,
      avg: scoreCnt ? Math.round(allScore.reduce(function (a, b) { return a + b; }, 0) / scoreCnt) : null,
      streak: calcStreak()
    };
  }
  function calcStreak() {
    var days = {};
    history.forEach(function (h) { days[h.day] = 1; });
    var dayArr = Object.keys(days).sort();
    if (!dayArr.length) return 0;
    var cursor = new Date();
    var curKey = fmtDate(cursor);
    if (!days[curKey]) {
      /* 若今天没练，从昨天开始回溯 */
      cursor.setDate(cursor.getDate() - 1);
      curKey = fmtDate(cursor);
      if (!days[curKey]) return 0;
    }
    var streak = 0;
    while (days[curKey]) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
      curKey = fmtDate(cursor);
    }
    return streak;
  }

  function greeting() {
    var h = new Date().getHours();
    if (h < 6) return "夜深了";
    if (h < 12) return "早上好";
    if (h < 14) return "中午好";
    if (h < 18) return "下午好";
    return "晚上好";
  }

  function renderDashboard() {
    var t = todayStats();
    var n = $("#statToday"); if (n) n.innerHTML = t.todayMin + '<span class="stat-unit"> 分钟</span>';
    var s = $("#statStreak"); if (s) s.innerHTML = t.streak + '<span class="stat-unit"> 天</span>';
    var sn = $("#statSessions"); if (sn) sn.innerHTML = history.length + '<span class="stat-unit"> 次</span>';
    var a = $("#statAvg"); if (a) a.textContent = t.avg == null ? "--" : t.avg;
    var g = $("#dashGreet"); if (g) g.textContent = greeting() + "！今天也要开口说英语哦 👋";
    $("#chipDate").textContent = "📅 " + (new Date().getMonth() + 1) + "月" + new Date().getDate() + "日";
    $("#chipGoal").textContent = "🎯 " + t.todayMin + "/" + settings.goalMin + " 分钟";

    /* 目标环 */
    var pct = clamp(Math.round(t.todayMin / settings.goalMin * 100), 0, 100);
    var ring = $("#goalRing");
    var C = 2 * Math.PI * 52;
    if (ring) {
      ring.style.strokeDasharray = C;
      ring.style.strokeDashoffset = C - C * pct / 100;
      ring.style.stroke = pct >= 100 ? "#16a34a" : (pct >= 50 ? "#f59e0b" : "#4f6df5");
    }
    var gp = $("#goalPct"); if (gp) gp.textContent = pct + "%";
    var gt = $("#goalText"); if (gt) gt.textContent = t.todayMin + " / " + settings.goalMin + " 分钟";

    /* 推荐场景（前 4 个 + 自由对话） */
    var grid = $("#dashScenarios");
    grid.innerHTML = "";
    var cards = [{ id: "free", icon: "💬", title: "Free Talk", zh: "自由对话", level: 0 }]
      .concat(DATA.scenarios.slice(0, 3).map(function (s) { return { id: s.id, icon: s.icon, title: s.title, zh: s.zh, level: s.level }; }));
    cards.forEach(function (c) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "sc-card";
      b.innerHTML = '<span class="sc-ico">' + c.icon + '</span><div><h4>' + esc(c.title) + '</h4><p>' + esc(c.zh) + '</p></div>';
      b.addEventListener("click", function () { startFromScenario(c.id); });
      grid.appendChild(b);
    });

    /* 最近记录 */
    var his = $("#dashHistory");
    his.innerHTML = "";
    var recent = history.slice(-6).reverse();
    if (!recent.length) {
      his.innerHTML = '<p class="empty-hint">还没有练习记录，去和外教聊两句吧！</p>';
    } else {
      recent.forEach(function (h) {
        var row = document.createElement("div");
        row.className = "his-row";
        row.innerHTML = '<span class="his-ico">' + h.icon + '</span>' +
          '<div class="his-main"><b>' + esc(h.title) + '</b><span>' + esc(h.zh) + " · " + fmtTime(h.ts) + " · " + h.userCount + " 句 · " + fmtDur(h.durSec) + "</span></div>" +
          '<span class="his-score" style="color:' + (h.overall >= 85 ? "#16a34a" : h.overall >= 70 ? "#d97706" : "#dc2626") + '">' + h.overall + "</span>";
        his.appendChild(row);
      });
    }
  }

  /* ---------------- 场景页 ---------------- */
  function scenarioCardHTML(sc) {
    var lv = sc.level;
    var lvName = lv === 1 ? "入门" : lv === 2 ? "进阶" : "挑战";
    var badgeCls = "lv" + lv;
    return '<span class="sc-ico">' + sc.icon + '</span>' +
      '<div><h4>' + esc(sc.title) + ' <span style="color:var(--sub);font-weight:400">' + esc(sc.zh) + '</span></h4>' +
      '<p>' + esc(sc.desc) + '</p>' +
      '<div class="sc-foot">' + sc.tags.map(function (t) { return '<span class="mini">' + esc(t) + "</span>"; }).join("") + "</div></div>" +
      '<span class="sc-badge ' + badgeCls + '">' + lvName + "</span>";
  }

  function renderScenarioGrid() {
    var grid = $("#scenarioGrid");
    grid.innerHTML = "";
    var list = DATA.scenarios.filter(function (s) {
      return state.levelFilter === 0 || s.level === state.levelFilter;
    });
    if (!list.length) {
      grid.innerHTML = '<p class="empty-hint">该难度下暂无场景，试试其它难度～</p>';
      return;
    }
    list.forEach(function (sc) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "sc-card wide-card";
      b.innerHTML = scenarioCardHTML(sc);
      b.addEventListener("click", function () { startFromScenario(sc.id); });
      grid.appendChild(b);
    });
  }

  function startFromScenario(id) {
    if (state.session && state.session.userCount > 0 && !state.session.finished) {
      toast("已丢弃上一段未评分对话，开始新练习。");
    }
    newSession(id);
    switchView("tutor");
    renderTutorSide();
    var thread = $("#chatThread");
    if (thread) thread.innerHTML = "";
    var s = state.session;
    var first = s.sc ? s.sc.steps[0] : null;
    if (s.sc) {
      s.stepIdx = 0;
      var intro = "👋 Hi! I'm Emma, your English tutor. Today let's practice: " + s.sc.title + ". Ready? Let's begin!";
      tutorSay(intro, "", { silent: true });
      var step = s.sc.steps[0];
      tutorSay(step.q, step.h || "", { chips: step.chips || [] });
    } else {
      s.stepIdx = 0;
      var opener = pick(DATA.free.openers);
      tutorSay(opener, "自由话题：想到什么聊什么，放松开口就好 😊", { chips: [] });
    }
  }

  /* ---------------- 外教侧栏 / 配置 ---------------- */
  function renderTutorSide() {
    var sel = $("#cfgScenario");
    var cur = state.session && state.session.sc ? state.session.sc.id : (state.session ? "free" : "free");
    sel.innerHTML = "";
    var opt = document.createElement("option");
    opt.value = "free"; opt.textContent = "💬 自由对话";
    sel.appendChild(opt);
    DATA.scenarios.forEach(function (sc) {
      var o = document.createElement("option");
      o.value = sc.id; o.textContent = sc.icon + " " + sc.zh;
      sel.appendChild(o);
    });
    sel.value = cur;

    $("#cfgLevel").value = settings.level;
    $("#optSpeak").checked = settings.autoSpeak;
    $("#optHint").checked = settings.showHint;
    $("#cfgRate").value = String(settings.rate);

    var sc = state.session && state.session.sc;
    var title = $("#curScenarioTitle"), desc = $("#curScenarioDesc"), chips = $("#vocabChips"), bank = $("#phraseBank");
    if (sc) {
      title.textContent = sc.icon + " " + sc.title + " · " + sc.zh;
      desc.textContent = sc.desc;
      chips.innerHTML = sc.vocab.slice(0, 10).map(function (v) { return '<span class="vocab-chip">' + esc(v) + "</span>"; }).join("");
      bank.innerHTML = sc.bank.slice(0, 5).map(function (b) {
        return '<li><span class="bank-en">' + esc(b.en) + '</span><span class="bank-zh">' + esc(b.zh) + '</span>' +
          '<button type="button" class="speak-sm" data-line="' + esc(b.en) + '" title="播放">🔊</button></li>';
      }).join("");
      $$(".speak-sm", bank).forEach(function (b) {
        b.addEventListener("click", function () { speak(b.getAttribute("data-line"), null, { slow: true }); });
      });
    } else {
      title.textContent = "💬 自由对话";
      desc.textContent = "与外教随意聊天：天气、美食、工作、爱好都可以，想到什么说什么。";
      chips.innerHTML = '<span class="vocab-chip">daily talk</span><span class="vocab-chip">hobby</span><span class="vocab-chip">food</span><span class="vocab-chip">travel</span>';
      bank.innerHTML = "";
    }
  }

  /* ---------------- 学习报告 ---------------- */
  function renderReport() {
    var t = todayStats();
    var avgEl = $("#rAvg"); if (avgEl) avgEl.textContent = t.avg == null ? "--" : t.avg;
    $("#rSessions").textContent = history.length;
    var errTotal = 0;
    history.forEach(function (h) { errTotal += h.errors ? h.errors.reduce(function (a, e) { return a + e.count; }, 0) : 0; });
    $("#rErrors").textContent = errTotal;
    $("#rStreak").innerHTML = t.streak + '<span class="stat-unit"> 天</span>';

    renderTrend();
    renderRadar();
    renderErrBars();
    renderErrBook();
  }

  function renderTrend() {
    var box = $("#trendChart");
    if (!box) return;
    var recent = history.slice(-12);
    if (recent.length < 2) {
      box.innerHTML = '<p class="empty-hint">完成两次以上练习后，这里会出现你的评分曲线。</p>';
      return;
    }
    var W = 560, H = 200, pad = 24;
    var min = Math.min.apply(null, recent.map(function (h) { return h.overall; }));
    var max = Math.max.apply(null, recent.map(function (h) { return h.overall; }));
    var lo = Math.max(0, Math.floor((min - 6) / 10) * 10), hi = Math.min(100, Math.ceil((max + 6) / 10) * 10);
    if (hi - lo < 20) { lo = Math.max(0, lo - 10); hi = Math.min(100, hi + 10); }
    var x = function (i) { return pad + i * (W - 2 * pad) / (recent.length - 1); };
    var y = function (v) { return H - pad - (v - lo) / (hi - lo) * (H - 2 * pad); };
    var pts = recent.map(function (h, i) { return x(i) + "," + y(h.overall); });

    var gridHtml = "";
    for (var g = 0; g <= 4; g++) {
      var gv = lo + (hi - lo) * g / 4;
      var gy = H - pad - g * (H - 2 * pad) / 4;
      gridHtml += '<line x1="' + pad + '" y1="' + gy + '" x2="' + (W - pad) + '" y2="' + gy + '" stroke="#eef1f8" stroke-width="1"/>';
      gridHtml += '<text x="' + (pad - 6) + '" y="' + (gy + 4) + '" font-size="10" fill="#9aa3b5" text-anchor="end">' + Math.round(gv) + "</text>";
    }
    var labels = recent.map(function (h) {
      var d = new Date(h.ts);
      return (d.getMonth() + 1) + "/" + d.getDate();
    });
    var labelHtml = labels.map(function (l, i) {
      return '<text x="' + x(i) + '" y="' + (H - 6) + '" font-size="10" fill="#9aa3b5" text-anchor="middle">' + l + "</text>";
    }).join("");
    var dots = recent.map(function (h, i) {
      return '<circle cx="' + x(i) + '" cy="' + y(h.overall) + '" r="4" fill="#4f6df5"><title>' + h.title + " " + h.overall + "</title></circle>" +
        '<text x="' + x(i) + '" y="' + (y(h.overall) - 9) + '" font-size="10" font-weight="bold" fill="#4f6df5" text-anchor="middle">' + h.overall + "</text>";
    }).join("");

    box.innerHTML = '<svg viewBox="0 0 ' + W + " " + H + '" style="width:100%;height:auto" role="img" aria-label="评分趋势折线图">' +
      gridHtml + labelHtml +
      '<polyline points="' + pts.join(" ") + '" fill="none" stroke="#4f6df5" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>' +
      dots + "</svg>";
  }

  function renderRadar() {
    var cv = $("#radar");
    if (!cv) return;
    var ctx = cv.getContext("2d");
    var note = $("#radarNote");
    var last = history[history.length - 1];
    if (!last) { ctx.clearRect(0, 0, 300, 300); note.textContent = "暂无数据"; return; }
    var labels = ["语法", "词汇", "流利度", "发音"];
    var keys = ["grammar", "vocab", "flu", "pron"];
    var avail = keys.filter(function (k) { return last.dims[k] != null; });
    var useKeys = avail.length ? avail : keys;
    var useLabels = useKeys.map(function (k) { return labels[keys.indexOf(k)]; });
    var vals = useKeys.map(function (k) { return last.dims[k] == null ? 0 : last.dims[k]; });
    var cx = 150, cy = 145, R = 92;
    ctx.clearRect(0, 0, 300, 300);
    var n = useKeys.length;
    /* 背景网格 */
    for (var ring = 1; ring <= 4; ring++) {
      ctx.beginPath();
      for (var i = 0; i <= n; i++) {
        var ang = -Math.PI / 2 + i * 2 * Math.PI / n;
        var rr = R * ring / 4;
        var px = cx + Math.cos(ang) * rr, py = cy + Math.sin(ang) * rr;
        i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
      }
      ctx.strokeStyle = "#e3e8f2"; ctx.lineWidth = 1; ctx.stroke();
    }
    /* 轴线与标签 */
    ctx.font = "12px sans-serif"; ctx.fillStyle = "#5c6577"; ctx.textAlign = "center";
    for (var j = 0; j < n; j++) {
      var a2 = -Math.PI / 2 + j * 2 * Math.PI / n;
      ctx.beginPath(); ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(a2) * R, cy + Math.sin(a2) * R);
      ctx.strokeStyle = "#e3e8f2"; ctx.stroke();
      var lx = cx + Math.cos(a2) * (R + 18), ly = cy + Math.sin(a2) * (R + 14);
      ctx.fillText(useLabels[j], lx, ly + 4);
    }
    /* 数据多边形 */
    ctx.beginPath();
    for (var k = 0; k < n; k++) {
      var ang3 = -Math.PI / 2 + k * 2 * Math.PI / n;
      var val = vals[k] / 100 * R;
      var px2 = cx + Math.cos(ang3) * val, py2 = cy + Math.sin(ang3) * val;
      k ? ctx.lineTo(px2, py2) : ctx.moveTo(px2, py2);
    }
    ctx.closePath();
    ctx.fillStyle = "rgba(79,109,245,.18)"; ctx.fill();
    ctx.strokeStyle = "#4f6df5"; ctx.lineWidth = 2.2; ctx.stroke();
    /* 顶点数值 */
    ctx.fillStyle = "#4f6df5"; ctx.font = "bold 11px sans-serif";
    for (var m = 0; m < n; m++) {
      var a4 = -Math.PI / 2 + m * 2 * Math.PI / n;
      var rr2 = vals[m] / 100 * R;
      var px3 = cx + Math.cos(a4) * rr2, py3 = cy + Math.sin(a4) * rr2;
      ctx.fillText(vals[m], px3, py3 - 5);
    }
    note.textContent = last.title + " · " + fmtTime(last.ts) + " · 综合 " + last.overall + (last.dims.pron == null ? "（该次无语音数据）" : "");
  }

  function renderErrBars() {
    var box = $("#errBars");
    if (!box) return;
    var cat = {};
    history.forEach(function (h) {
      (h.errors || []).forEach(function (e) { cat[e.type] = (cat[e.type] || 0) + e.count; });
    });
    var arr = Object.keys(cat).map(function (k) { return { type: k, n: cat[k] }; })
      .sort(function (a, b) { return b.n - a.n; }).slice(0, 6);
    if (!arr.length) { box.innerHTML = '<p class="empty-hint">暂无数据。练习中系统会自动记录你的错误类型。</p>'; return; }
    var maxN = arr[0].n;
    box.innerHTML = arr.map(function (e) {
      var w = Math.max(6, Math.round(e.n / maxN * 100));
      return '<div class="eb-row"><span class="eb-label">' + esc(e.type) + '</span>' +
        '<span class="eb-bar"><span class="eb-fill" style="width:' + w + '%"></span></span>' +
        '<span class="eb-num">' + e.n + "</span></div>";
    }).join("");
  }

  function renderErrBook() {
    var box = $("#reportErrors");
    if (!box) return;
    var pool = {};
    history.forEach(function (h) {
      (h.errors || []).forEach(function (e) {
        var key = e.text + "|" + e.fix;
        if (!pool[key]) pool[key] = { text: e.text, fix: e.fix, type: e.type, note: e.note, count: 0 };
        pool[key].count += e.count;
      });
    });
    var arr = Object.keys(pool).map(function (k) { return pool[k]; })
      .sort(function (a, b) { return b.count - a.count; }).slice(0, 8);
    if (!arr.length) { box.innerHTML = '<p class="empty-hint">暂无数据。</p>'; return; }
    box.innerHTML = arr.map(function (e) {
      return '<div class="err-item"><div class="e-line">' +
        '<s class="fix-orig">' + esc(e.text) + '</s><span class="fix-arrow">→</span>' +
        '<span class="fix-new">' + esc(e.fix) + '</span>' +
        '<span class="err-badge">' + esc(e.type) + '</span>' +
        '<span class="err-count">犯过 ' + e.count + " 次</span></div>" +
        '<div class="err-note">' + esc(e.note) + "</div></div>";
    }).join("");
  }

  /* ---------------- 绑定事件 ---------------- */
  function bindEvents() {
    $$(".nav-item[data-view]").forEach(function (b) {
      b.addEventListener("click", function () { switchView(b.getAttribute("data-view")); });
    });
    var qc = $("#btnQuickChat");
    if (qc) qc.addEventListener("click", function () { startFromScenario("free"); });
    var qs = $("#btnQuickStart");
    if (qs) qs.addEventListener("click", function () { startFromScenario("free"); });

    var sc = $("#cfgScenario");
    if (sc) sc.addEventListener("change", function () {
      var v = sc.value;
      if (!state.session || state.session.userCount === 0 || state.session.finished) {
        startFromScenario(v);
      } else {
        toast("请先「结束并评分」当前对话，再切换场景。");
        sc.value = state.session.sc ? state.session.sc.id : "free";
      }
    });
    var lv = $("#cfgLevel");
    if (lv) lv.addEventListener("change", function () {
      settings.level = lv.value;
      if (settings.level === "beginner") { $("#optHint").checked = true; settings.showHint = true; }
      saveSettings();
      toast("难度已切换为「" + LEVEL_NAME[settings.level] + "」");
    });
    var sp = $("#optSpeak");
    if (sp) sp.addEventListener("change", function () { settings.autoSpeak = sp.checked; saveSettings(); });
    var hp = $("#optHint");
    if (hp) hp.addEventListener("change", function () { settings.showHint = hp.checked; saveSettings(); });
    var rt = $("#cfgRate");
    if (rt) rt.addEventListener("change", function () { settings.rate = parseFloat(rt.value); saveSettings(); });

    var nc = $("#btnNewChat");
    if (nc) nc.addEventListener("click", function () {
      stopSpeak();
      var v = ($("#cfgScenario") || {}).value || "free";
      if (state.session && state.session.userCount > 0 && !state.session.finished) {
        toast("已开始新对话（未保存上一段）。");
      }
      startFromScenario(v);
    });
    var fn = $("#btnFinish");
    if (fn) fn.addEventListener("click", function () { finishAndScore(false); });

    var mic = $("#btnMic");
    if (mic) mic.addEventListener("click", function () {
      if (state.listening) stopMic();
      else startMic();
    });
    var send = $("#btnSend");
    if (send) send.addEventListener("click", function (ev) {
      ev.preventDefault();
      var inp = $("#msgInput");
      if (!inp) return;
      var v = inp.value.trim();
      if (!v) { toast("先输入点什么吧～"); return; }
      sendUserMessage(v, { speech: false, conf: null, dur: null });
    });
    var inp = $("#msgInput");
    if (inp) inp.addEventListener("keydown", function (ev) {
      if (ev.key === "Enter" && !ev.shiftKey) {
        ev.preventDefault();
        var v = inp.value.trim();
        if (v) sendUserMessage(v, { speech: false, conf: null, dur: null });
      }
    });

    /* 场景筛选 */
    $$(".filter-row .tag").forEach(function (tg) {
      tg.addEventListener("click", function () {
        $$(".filter-row .tag").forEach(function (x) { x.classList.remove("tag-on"); });
        tg.classList.add("tag-on");
        state.levelFilter = parseInt(tg.getAttribute("data-lvl"), 10) || 0;
        renderScenarioGrid();
      });
    });

    /* 弹窗 */
    var bx = $("#btnCloseScore"); if (bx) bx.addEventListener("click", function () { closeModal("scoreModal"); });
    var ag = $("#btnAgain");
    if (ag) ag.addEventListener("click", function () {
      closeModal("scoreModal");
      var v = ($("#cfgScenario") || {}).value || "free";
      startFromScenario(v);
    });
    var vr = $("#btnViewReport");
    if (vr) vr.addEventListener("click", function () {
      closeModal("scoreModal");
      switchView("report");
    });

    var su = $("#btnStartUse");
    if (su) su.addEventListener("click", function () {
      try { localStorage.setItem("dailytalk_intro", "1"); } catch (e) {}
      closeModal("firstRun");
      startFromScenario("free");
    });
    var gd = $("#btnGuide");
    if (gd) gd.addEventListener("click", function () { closeModal("firstRun"); closeModal("guideModal"); var gm = $("#guideModal"); if (gm) gm.hidden = false; });
    var gdc = $("#btnGuideClose");
    if (gdc) gdc.addEventListener("click", function () {
      try { localStorage.setItem("dailytalk_intro", "1"); } catch (e) {}
      closeModal("guideModal");
    });

    var cg = $("#btnSetGoal");
    if (cg) cg.addEventListener("click", function () {
      var inp = $("#goalInput");
      if (inp) inp.value = settings.goalMin;
      var modal = $("#goalModal");
      if (modal) modal.hidden = false;
    });
    var gmc = $("#btnGoalClose");
    if (gmc) gmc.addEventListener("click", function () { closeModal("goalModal"); });
    var gms = $("#btnGoalSave");
    if (gms) gms.addEventListener("click", saveGoalFromModal);
    var gmInp = $("#goalInput");
    if (gmInp) gmInp.addEventListener("keydown", function (ev) {
      if (ev.key === "Enter") { ev.preventDefault(); saveGoalFromModal(); }
    });
    $$("#goalPresets .goal-opt").forEach(function (o) {
      o.addEventListener("click", function () {
        settings.goalMin = parseInt(o.getAttribute("data-min"), 10) || 15;
        saveSettings(); renderDashboard();
        toast("每日目标已设为 " + settings.goalMin + " 分钟");
        closeModal("goalModal");
      });
    });

    /* 文本链接跳转（如「查看全部 →」） */
    $$("[data-goto]").forEach(function (el) {
      el.addEventListener("click", function () { switchView(el.getAttribute("data-goto")); });
    });

    /* 点击弹窗遮罩（深色区域）关闭 */
    $$(".modal-mask").forEach(function (mask) {
      mask.addEventListener("click", function (ev) {
        if (ev.target !== mask) return;
        closeModal(mask.id);
        if (mask.id === "firstRun" || mask.id === "guideModal") {
          try { localStorage.setItem("dailytalk_intro", "1"); } catch (e) {}
        }
      });
    });

    var cd = $("#btnClearData");
    if (cd) cd.addEventListener("click", function () {
      if (cd._armed) {
        cd._armed = false;
        cd.textContent = "清除本地数据";
        cd.classList.remove("btn-danger");
        history = [];
        saveHist(history);
        renderReport();
        renderDashboard();
        toast("本地数据已清除");
      } else {
        cd._armed = true;
        cd.textContent = "⚠ 再点一次确认清除";
        cd.classList.add("btn-danger");
        setTimeout(function () {
          if (cd._armed) { cd._armed = false; cd.textContent = "清除本地数据"; cd.classList.remove("btn-danger"); }
        }, 4000);
      }
    });
  }

  var started = false;
  function init() {
    if (started) return;
    started = true;
    bindEvents();
    switchView("dashboard");
    renderTutorSide();
    if (!micSupported()) {
      setMicStatus("idle");
      var txt = $("#chipMicText");
      if (txt) txt.textContent = "语音：请用 Chrome/Edge";
      var h = $("#micHint");
      if (h) h.textContent = "当前浏览器不支持语音识别：请改用 Chrome 或 Edge 打开本页获得语音评分；现在也可以直接打字练习（仍含语法/词汇评分）。";
    } else {
      setMicStatus("ok");
    }
    /* 首次使用引导 */
    try {
      if (!localStorage.getItem("dailytalk_intro")) {
        var fr = $("#firstRun");
        if (fr) fr.hidden = false;
      }
    } catch (e) {}
    setInterval(function () {
      /* 顶栏日期/目标实时刷新 */
      var d = $("#chipDate");
      if (d) d.textContent = "📅 " + (new Date().getMonth() + 1) + "月" + new Date().getDate() + "日";
    }, 30000);
    /* 支持 #tutor / #scenarios / #report 直达 */
    var hash = (location.hash || "").replace("#", "");
    if (hash === "tutor") { startFromScenario("free"); }
    else if (hash === "scenarios" || hash === "report") { switchView(hash); }
  }

  document.addEventListener("DOMContentLoaded", init);
  if (document.readyState !== "loading") { init(); }
})();
