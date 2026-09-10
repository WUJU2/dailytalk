/* =========================================================
 * DailyTalk · 单词大炮（记单词游戏）
 * 玩法：单词从上方下落 → 直接敲键盘补全缺失字母将其击落 →
 *       未击落的单词落地堆积，堆满 5 个游戏结束。
 * 依赖：js/words-data.js（window.DailyTalkWords）
 * ========================================================= */
(function () {
  "use strict";

  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };
  var BK = window.DailyTalkWords;

  /* ---------------- 存储 ---------------- */
  var LS_CFG = "dailytalk_words_cfg";
  var LS_WRONG = "dailytalk_words_wrong";
  var cfg = { book: "daily", diff: "normal", speed: "normal", hintZh: true, autoSpeak: true, sfx: true, showKb: false };
  var wrongBook = {}; /* word -> { zh, book, miss, ts } */

  function loadStore() {
    try { var c = JSON.parse(localStorage.getItem(LS_CFG) || "null"); if (c) cfg = Object.assign(cfg, c); } catch (e) { }
    try { wrongBook = JSON.parse(localStorage.getItem(LS_WRONG) || "{}") || {}; } catch (e) { wrongBook = {}; }
  }
  function saveCfg() { try { localStorage.setItem(LS_CFG, JSON.stringify(cfg)); } catch (e) { } }
  function saveWrong() { try { localStorage.setItem(LS_WRONG, JSON.stringify(wrongBook)); } catch (e) { } }

  /* ---------------- 工具 ---------------- */
  function rand(a, b) { return a + Math.random() * (b - a); }
  function shuffle(arr) { var a = arr.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function fmtTime(ms) {
    var s = Math.floor(ms / 1000);
    var m = Math.floor(s / 60); s = s % 60;
    return (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s;
  }

  var AC = null;
  function beep(kind) {
    if (!cfg.sfx) return;
    try {
      AC = AC || new (window.AudioContext || window.webkitAudioContext)();
      if (AC.state === "suspended") { try { AC.resume(); } catch (e) { } }
      var t = AC.currentTime;
      var o = AC.createOscillator(), g = AC.createGain();
      o.connect(g); g.connect(AC.destination);
      var seq = {
        hit:  [[880, 0.05, "square", 0.05]],
        kill: [[660, 0.06, "square", 0.06], [990, 0.09, "square", 0.06]],
        err:  [[180, 0.12, "sawtooth", 0.07]],
        miss: [[330, 0.18, "triangle", 0.08], [196, 0.22, "triangle", 0.08]],
        over: [[392, 0.16, "triangle", 0.08], [311, 0.16, "triangle", 0.08], [233, 0.3, "triangle", 0.09]],
        win:  [[523, 0.1, "square", 0.06], [659, 0.1, "square", 0.06], [784, 0.1, "square", 0.06], [1047, 0.22, "square", 0.07]],
        lv:   [[523, 0.07, "square", 0.05], [784, 0.1, "square", 0.05]]
      }[kind] || [[440, 0.08, "sine", 0.05]];
      var off = 0;
      seq.forEach(function (p) {
        o.frequency.setValueAtTime(p[0], t + off);
        g.gain.setValueAtTime(p[3], t + off);
        g.gain.exponentialRampToValueAtTime(0.0001, t + off + p[1]);
        off += p[1] * 0.9;
      });
      o.start(t); o.stop(t + off + 0.05);
    } catch (e) { }
  }

  function speak(word) {
    if (!cfg.autoSpeak || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(word);
      u.lang = "en-US"; u.rate = 0.85;
      var vs = window.speechSynthesis.getVoices().filter(function (v) { return v.lang && v.lang.toLowerCase().indexOf("en") === 0; });
      if (vs.length) u.voice = vs[0];
      window.speechSynthesis.speak(u);
    } catch (e) { }
  }

  /* ---------------- 游戏状态 ---------------- */
  var G = {
    running: false, paused: false, over: false,
    queue: [], falling: [], stack: [],
    target: null,
    score: 0, combo: 0, maxCombo: 0, level: 1, kills: 0,
    lettersOk: 0, lettersErr: 0,
    killedSet: {}, total: 0,
    elapsed: 0, spawnTimer: 0, sinceSpawn: 9999,
    uid: 0
  };

  var SPEED_BASE = { slow: 26, normal: 40, fast: 56 };
  var SPAWN_BASE = { slow: 6200, normal: 5000, fast: 4200 };
  var MAX_STACK = 5;

  var el = {};
  function cacheDom() {
    el.view = $("#view-words");
    el.setup = $("#wSetup"); el.game = $("#wGame");
    el.books = $("#wBooks"); el.diff = $("#wDiff"); el.speed = $("#wSpeed"); el.toggles = $("#wToggles");
    el.start = $("#btnWStart"); el.wrongEntry = $("#wWrongEntry");
    el.hud = { score: $("#wScore"), level: $("#wLevel"), kills: $("#wKills"), total: $("#wTotal"), time: $("#wTime"), combo: $("#wCombo"), left: $("#wLeft"), acc: $("#wAcc"), cov: $("#wCov2") };
    el.hint = $("#wHint"); el.targetInfo = $("#wTargetInfo");
    el.field = $("#wField"); el.stack = $("#wStack"); el.overlay = $("#wOverlay");
    el.next = $("#wNext"); el.cov = $("#wCov");
    el.kb = $("#wKb");
    el.btnPause = $("#btnWPause"); el.btnEnd = $("#btnWEnd"); el.btnKb = $("#btnWKb"); el.btnSound = $("#btnWSound");
  }

  /* ================= 设置页 ================= */
  function bookById(id) {
    for (var i = 0; i < BK.books.length; i++) if (BK.books[i].id === id) return BK.books[i];
    return BK.books[0];
  }

  function renderSetup() {
    /* 词书卡片 */
    el.books.innerHTML = BK.books.map(function (b) {
      var wrongN = 0;
      Object.keys(wrongBook).forEach(function (w) { if (wrongBook[w].book === b.id) wrongN++; });
      return '<button type="button" class="w-book' + (cfg.book === b.id ? " on" : "") + '" data-book="' + b.id + '">' +
        '<span class="w-book-ico">' + b.icon + '</span>' +
        '<span class="w-book-txt"><b>' + esc(b.name) + '</b><i>' + b.words.length + ' 词 · ' + esc(b.desc) + '</i></span>' +
        (wrongN ? '<span class="w-book-wrong">错词 ' + wrongN + '</span>' : "") +
        "</button>";
    }).join("");
    $$("#wBooks .w-book").forEach(function (btn) {
      btn.addEventListener("click", function () {
        cfg.book = btn.getAttribute("data-book"); saveCfg(); renderSetup();
      });
    });

    /* 难度 / 节奏 / 开关 */
    var diffOpts = [["easy", "😊 简单 · 1-2 个空"], ["normal", "😎 适中 · 2-3 个空"], ["hard", "😈 困难 · 3-4 个空"]];
    var speedOpts = [["slow", "🐢 慢速"], ["normal", "🚶 中速"], ["fast", "🐇 快速"]];
    el.diff.innerHTML = diffOpts.map(function (o) { return '<button type="button" class="w-chip' + (cfg.diff === o[0] ? " on" : "") + '" data-v="' + o[0] + '">' + o[1] + "</button>"; }).join("");
    el.speed.innerHTML = speedOpts.map(function (o) { return '<button type="button" class="w-chip' + (cfg.speed === o[0] ? " on" : "") + '" data-v="' + o[0] + '">' + o[1] + "</button>"; }).join("");
    $$("#wDiff .w-chip").forEach(function (b) { b.addEventListener("click", function () { cfg.diff = b.getAttribute("data-v"); saveCfg(); renderSetup(); }); });
    $$("#wSpeed .w-chip").forEach(function (b) { b.addEventListener("click", function () { cfg.speed = b.getAttribute("data-v"); saveCfg(); renderSetup(); }); });

    var tg = [["hintZh", "🈶 显示中文提示", "下落时显示中文释义"], ["autoSpeak", "🔊 击落自动发音", "读出单词帮助记忆"], ["sfx", "🎵 音效", "命中/失误提示音"], ["showKb", "⌨️ 触屏键盘", "手机上用手点字母"]];
    el.toggles.innerHTML = tg.map(function (o) { return '<button type="button" class="w-chip' + (cfg[o[0]] ? " on" : "") + '" data-v="' + o[0] + '">' + o[1] + "</button>"; }).join("");
    $$("#wToggles .w-chip").forEach(function (b) {
      b.addEventListener("click", function () {
        var k = b.getAttribute("data-v");
        cfg[k] = !cfg[k]; saveCfg(); renderSetup();
        if (k === "showKb") toggleKb();
      });
    });

    /* 错词本入口 */
    var keys = Object.keys(wrongBook);
    if (keys.length) {
      var list = keys.sort(function (a, b) { return wrongBook[b].ts - wrongBook[a].ts; }).slice(0, 40);
      el.wrongEntry.innerHTML =
        '<div class="w-wrong-head"><b>📕 错词本（' + keys.length + '）</b>' +
        '<span class="w-wrong-acts"><button type="button" class="w-mini" id="btnWrongCopy">📋 复制</button>' +
        '<button type="button" class="w-mini" id="btnWrongDl">💾 导出</button>' +
        '<button type="button" class="w-mini danger" id="btnWrongClear">🗑 清空</button></span></div>' +
        '<div class="w-wrong-list">' + list.map(function (w) {
          return '<span class="w-wrong-item" data-say="' + esc(w) + '">🔊 ' + esc(w) + '<i>' + esc(wrongBook[w].zh || "") + "</i></span>";
        }).join("") + "</div>" +
        '<p class="w-wrong-tip">开局时会优先把错词混入词库，优先消灭它们！</p>';
      $$(".w-wrong-item").forEach(function (s) { s.addEventListener("click", function () { speak(s.getAttribute("data-say")); }); });
      var cp = $("#btnWrongCopy"); if (cp) cp.addEventListener("click", exportWrong);
      var dl = $("#btnWrongDl"); if (dl) dl.addEventListener("click", exportWrong);
      var cl = $("#btnWrongClear");
      if (cl) cl.addEventListener("click", function () {
        wrongBook = {}; saveWrong(); renderSetup();
      });
    } else {
      el.wrongEntry.innerHTML = '<p class="w-wrong-tip">📕 错词本还是空的——打一局，拼错的单词会自动收进来。</p>';
    }
  }

  function exportWrong() {
    var keys = Object.keys(wrongBook);
    if (!keys.length) return;
    var text = keys.sort(function (a, b) { return wrongBook[b].ts - wrongBook[a].ts; })
      .map(function (w) { return w + "\t" + (wrongBook[w].zh || ""); }).join("\n");
    try {
      var blob = new Blob([text], { type: "text/plain;charset=utf-8" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "dailytalk-错词本.txt";
      document.body.appendChild(a); a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 400);
    } catch (e) { }
    try { navigator.clipboard && navigator.clipboard.writeText(text); } catch (e) { }
  }

  /* ================= 游戏流程 ================= */
  function startGame() {
    var book = bookById(cfg.book);
    var pool = shuffle(book.words.map(function (x) { return { w: x.w, zh: x.zh, book: book.id }; }));
    /* 错词优先混入队首 */
    var wrongs = shuffle(Object.keys(wrongBook).filter(function (w) { return wrongBook[w].book === book.id; }))
      .slice(0, 8)
      .map(function (w) { return { w: w, zh: wrongBook[w].zh, book: book.id, isWrong: true }; });
    G.queue = wrongs.concat(pool);
    G.falling = []; G.stack = []; G.target = null;
    G.score = 0; G.combo = 0; G.maxCombo = 0; G.level = 1; G.kills = 0;
    G.lettersOk = 0; G.lettersErr = 0;
    G.killedSet = {}; G.total = G.queue.length;
    G.elapsed = 0; G.spawnTimer = 0; G.sinceSpawn = 9999;
    G.running = true; G.paused = false; G.over = false;

    el.setup.hidden = true; el.game.hidden = false; el.overlay.hidden = true;
    el.field.innerHTML = '<div class="w-field-top" id="wFieldTop">单词下落区</div>';
    el.stack = document.createElement("div");
    el.stack.className = "w-stack"; el.stack.id = "wStack";
    el.field.appendChild(el.stack);
    el.stack.innerHTML = "";
    el.next.innerHTML = ""; el.hint.innerHTML = ""; el.targetInfo.innerHTML = "";
    toggleKb();
    updateHud(); renderNext(); renderStack();
    toastMsg("🎯 开火！直接敲键盘补全单词的缺失字母");
    requestAnimationFrame(loop);
  }

  function levelOf() { return Math.min(12, 1 + Math.floor(G.kills / 6)); }
  function fallSpeed() { return SPEED_BASE[cfg.speed] * (1 + (G.level - 1) * 0.16); }
  function spawnGap() { return Math.max(2300, SPAWN_BASE[cfg.speed] * Math.pow(0.93, G.level - 1)); }
  function maxConcurrent() { return Math.min(5, 2 + Math.ceil(G.level / 2)); }

  function spawnWord() {
    if (!G.queue.length) return;
    var data = G.queue.shift();
    var word = data.w;
    var idxs = [];
    for (var i = 1; i < word.length; i++) idxs.push(i); /* 首字母永远可见 */
    idxs = shuffle(idxs);
    var len = word.length;
    var k = cfg.diff === "easy" ? (len >= 6 ? 2 : 1) : cfg.diff === "hard" ? (len >= 8 ? 4 : 3) : (len >= 7 ? 3 : 2);
    k = Math.max(1, Math.min(k, len - 1));
    var missing = idxs.slice(0, k).sort(function (a, b) { return a - b; });

    var div = document.createElement("div");
    div.className = "w-word" + (data.isWrong ? " w-word-wrong" : "");
    var inner = "";
    for (var j = 0; j < len; j++) {
      if (missing.indexOf(j) >= 0) inner += '<span class="w-blank" data-i="' + j + '">_</span>';
      else inner += '<span class="w-fix">' + esc(word[j]) + "</span>";
    }
    div.innerHTML = inner;

    G.uid++;
    var obj = {
      id: G.uid, data: data, word: word, missing: missing, progress: 0,
      el: div, y: -50, speed: fallSpeed() * rand(0.85, 1.18), dead: false
    };
    el.field.insertBefore(div, el.stack);
    var fw = el.field.clientWidth, ww = div.offsetWidth || 140;
    div.style.left = Math.max(6, rand(6, fw - ww - 6)) + "px";
    div.style.top = "-50px";
    G.falling.push(obj);
    renderNext();
  }

  /* 渲染某个单词当前字母状态 */
  function paintWord(obj) {
    var html = "";
    for (var j = 0; j < obj.word.length; j++) {
      var mi = obj.missing.indexOf(j);
      if (mi < 0) html += '<span class="w-fix">' + esc(obj.word[j]) + "</span>";
      else if (mi < obj.progress) html += '<span class="w-blank done">' + esc(obj.word[j]) + "</span>";
      else if (mi === obj.progress && G.target === obj) html += '<span class="w-blank next">_</span>';
      else html += '<span class="w-blank">_</span>';
    }
    obj.el.innerHTML = html;
    obj.el.classList.toggle("w-word-target", G.target === obj);
  }

  function nextNeeded(obj) { return obj.progress < obj.missing.length ? obj.word[obj.missing[obj.progress]] : null; }

  function handleLetter(ch) {
    if (!G.running || G.paused || G.over) return;
    ch = ch.toLowerCase();
    if (!/^[a-z]$/.test(ch)) return;

    /* 锁定目标：无目标时选屏幕上最低的、下一缺字母匹配的单词 */
    if (!G.target || G.target.dead) {
      var cand = null;
      G.falling.forEach(function (o) {
        if (o.dead) return;
        if (nextNeeded(o) === ch && (!cand || o.y > cand.y)) cand = o;
      });
      if (!cand) { mistake(null); return; }
      G.target = cand;
    }
    var t = G.target;
    if (nextNeeded(t) === ch) {
      t.progress++;
      G.combo++; G.maxCombo = Math.max(G.maxCombo, G.combo);
      G.lettersOk++;
      G.score += 10 + Math.min(G.combo, 20);
      beep("hit");
      paintWord(t);
      if (t.progress >= t.missing.length) killWord(t);
      updateHud();
    } else {
      mistake(t);
    }
  }

  function mistake(obj) {
    G.combo = 0; G.lettersErr++;
    beep("err");
    el.field.classList.remove("w-shake");
    void el.field.offsetWidth;
    el.field.classList.add("w-shake");
    if (obj) paintWord(obj);
    updateHud();
  }

  function killWord(obj) {
    obj.dead = true;
    G.kills++;
    G.killedSet[obj.word] = 1;
    G.score += 30 + G.level * 10 + obj.word.length * 2;
    if (G.target === obj) G.target = null;
    obj.el.classList.add("w-boom");
    speak(obj.word);
    beep("kill");
    var fly = document.createElement("div");
    fly.className = "w-fly";
    fly.textContent = "+" + (30 + G.level * 10 + obj.word.length * 2);
    fly.style.left = obj.el.style.left; fly.style.top = obj.el.style.top;
    el.field.appendChild(fly);
    setTimeout(function () { fly.remove(); }, 750);
    setTimeout(function () { obj.el.remove(); }, 380);
    G.falling = G.falling.filter(function (o) { return o !== obj; });
    /* 升级 */
    var nl = levelOf();
    if (nl > G.level) { G.level = nl; beep("lv"); toastMsg("⭐ 等级 " + G.level + "！单词落得更快了"); }
    updateHud(); renderNext();
    checkWin();
  }

  function missWord(obj) {
    obj.dead = true;
    if (G.target === obj) G.target = null;
    G.falling = G.falling.filter(function (o) { return o !== obj; });
    obj.el.remove();
    G.combo = 0;
    G.stack.push(obj.data);
    recordWrong(obj.data);
    beep("miss");
    renderStack();
    updateHud();
    if (G.stack.length >= MAX_STACK) endGame(false);
  }

  function recordWrong(data) {
    var cur = wrongBook[data.w] || { zh: data.zh, book: data.book, miss: 0, ts: 0 };
    cur.miss++; cur.ts = Date.now(); cur.zh = data.zh || cur.zh; cur.book = data.book || cur.book;
    wrongBook[data.w] = cur;
    saveWrong();
  }

  function checkWin() {
    if (!G.queue.length && !G.falling.length && G.running) endGame(true);
  }

  function endGame(win, manual) {
    G.running = false; G.over = true;
    beep(win ? "win" : "over");
    if (window.speechSynthesis) { try { window.speechSynthesis.cancel(); } catch (e) { } }
    var acc = G.lettersOk + G.lettersErr ? Math.round(G.lettersOk / (G.lettersOk + G.lettersErr) * 100) : 0;
    var cov = Math.round(Object.keys(G.killedSet).length / Math.max(1, G.total) * 100);
    var sessionWrong = G.stack.map(function (d) { return d; });
    var title = win ? "词书通关！" : manual ? "本局结束" : "堆满了，游戏结束";
    el.overlay.hidden = false;
    el.overlay.innerHTML =
      '<div class="w-over' + (win ? " win" : "") + '">' +
      '<div class="w-over-ico">' + (win ? "🏆" : manual ? "⏹" : "💥") + "</div>" +
      "<h3>" + title + "</h3>" +
      '<div class="w-over-stats">' +
      "<div><b>" + G.score + "</b><span>分数</span></div>" +
      "<div><b>Lv." + G.level + "</b><span>等级</span></div>" +
      "<div><b>" + G.kills + "</b><span>击落</span></div>" +
      "<div><b>" + acc + "%</b><span>正确率</span></div>" +
      "<div><b>" + G.maxCombo + "</b><span>最高连击</span></div>" +
      "<div><b>" + fmtTime(G.elapsed) + "</b><span>用时</span></div>" +
      "</div>" +
      (sessionWrong.length
        ? '<div class="w-over-wrong"><b>📕 本局错词（自动加入错词本）</b><div>' +
          sessionWrong.map(function (d) { return '<span class="w-wrong-item" data-say="' + esc(d.w) + '">🔊 ' + esc(d.w) + "<i>" + esc(d.zh || "") + "</i></span>"; }).join("") +
          "</div></div>"
        : '<p class="w-over-clean">✨ 一局零失误，太强了！</p>') +
      '<div class="w-over-actions">' +
      '<button type="button" class="btn btn-primary" id="btnWRetry">↺ 再来一局</button>' +
      '<button type="button" class="btn btn-ghost" id="btnWBack">📖 换词书 / 返回</button>' +
      "</div></div>";
    var r = $("#btnWRetry"); if (r) r.addEventListener("click", startGame);
    var b = $("#btnWBack"); if (b) b.addEventListener("click", backToSetup);
    $$(".w-over .w-wrong-item").forEach(function (s) { s.addEventListener("click", function () { speak(s.getAttribute("data-say")); }); });
  }

  function backToSetup() {
    G.running = false; G.over = false;
    el.game.hidden = true; el.setup.hidden = false;
    clearField();
    renderSetup();
  }

  function clearField() {
    $$("#wField .w-word, #wField .w-fly").forEach(function (n) { n.remove(); });
  }

  /* ================= 主循环 ================= */
  var lastTs = 0;
  function loop(ts) {
    if (!G.running) { lastTs = 0; return; }
    if (!lastTs) lastTs = ts;
    var dt = Math.min(64, ts - lastTs);
    lastTs = ts;
    if (!G.paused) {
      G.elapsed += dt;
      /* 生成 */
      G.sinceSpawn += dt;
      if (G.sinceSpawn >= spawnGap() && G.falling.length < maxConcurrent() && G.queue.length) {
        G.sinceSpawn = 0;
        spawnWord();
      }
      /* 下落 */
      var stackH = el.stack.offsetHeight || 74;
      var floorY = el.field.clientHeight - stackH - 46;
      G.falling.slice().forEach(function (o) {
        o.y += (o.speed * dt) / 1000;
        o.el.style.top = o.y + "px";
        if (o.y >= floorY) missWord(o);
      });
      if (G.stack.length >= MAX_STACK) { requestAnimationFrame(loop); return; }
      if (!G.queue.length && !G.falling.length) { endGame(true); requestAnimationFrame(loop); return; }
    }
    requestAnimationFrame(loop);
  }

  /* ================= HUD / 侧栏 ================= */
  function updateHud() {
    if (!el.hud.score) return;
    el.hud.score.textContent = G.score;
    el.hud.level.textContent = "Lv." + G.level;
    el.hud.kills.textContent = G.kills;
    el.hud.total.textContent = G.total;
    el.hud.time.textContent = fmtTime(G.elapsed);
    el.hud.combo.textContent = G.combo + (G.combo >= 5 ? " 🔥" : "");
    var done = G.kills + G.stack.length;
    el.hud.left.textContent = Math.max(0, G.total - done);
    var tot = G.lettersOk + G.lettersErr;
    el.hud.acc.textContent = tot ? Math.round(G.lettersOk / tot * 100) + "%" : "--";
    el.hud.cov.textContent = Math.round(Object.keys(G.killedSet).length / Math.max(1, G.total) * 100) + "%";
    /* 目标提示 */
    if (G.target && !G.target.dead) {
      var zh = cfg.hintZh && G.target.data.zh ? " · " + G.target.data.zh : "";
      el.targetInfo.innerHTML = "🎯 正在击落：<b>" + esc(G.target.word) + "</b>" + esc(zh);
      el.hint.innerHTML = cfg.hintZh && G.target.data.zh ? "🈶 " + esc(G.target.data.zh) : "&nbsp;";
    } else {
      el.targetInfo.innerHTML = G.running && !G.paused ? "🎯 按下某个单词缺失的首字母即可锁定它" : "&nbsp;";
      el.hint.innerHTML = "&nbsp;";
    }
  }

  function renderNext() {
    if (!el.next) return;
    var items = G.queue.slice(0, 3);
    el.next.innerHTML = items.length
      ? items.map(function (d) { return '<div class="w-next-item"><b>' + esc(d.w[0].toUpperCase()) + "____</b><i>" + (cfg.hintZh ? esc(d.zh || "") : "?") + "</i></div>"; }).join("")
      : '<p class="w-next-empty">最后一词！</p>';
    var cov = Math.round(Object.keys(G.killedSet).length / Math.max(1, G.total) * 100);
    el.cov.innerHTML = "📖 覆盖率 <b>" + cov + "%</b> · 已击落 " + Object.keys(G.killedSet).length + "/" + G.total;
  }

  function renderStack() {
    if (!el.stack) return;
    var chips = "";
    for (var i = 0; i < MAX_STACK; i++) {
      var d = G.stack[i];
      chips += d ? '<span class="w-stack-chip" data-say="' + esc(d.w) + '">📚 ' + esc(d.w) + "</span>"
        : '<span class="w-stack-slot"></span>';
    }
    el.stack.innerHTML = chips;
    $$(".w-stack-chip").forEach(function (s) { s.addEventListener("click", function () { speak(s.getAttribute("data-say")); }); });
  }

  /* ================= 暂停 / 结束 ================= */
  function togglePause(force) {
    if (!G.running) return;
    G.paused = force != null ? force : !G.paused;
    if (G.paused) {
      el.overlay.hidden = false;
      el.overlay.innerHTML = '<div class="w-over pause"><div class="w-over-ico">⏸</div><h3>已暂停</h3><p class="w-pause-tip">游戏已暂停，点击「继续」接着玩</p><div class="w-over-actions"><button type="button" class="btn btn-primary" id="btnWResume">▶ 继续</button><button type="button" class="btn btn-ghost" id="btnWQuit">✖ 结束本局</button></div></div>';
      var r = $("#btnWResume"); if (r) r.addEventListener("click", function () { togglePause(false); });
      var q = $("#btnWQuit"); if (q) q.addEventListener("click", function () { G.paused = false; endGame(false, true); });
    } else {
      el.overlay.hidden = true; el.overlay.innerHTML = "";
      lastTs = 0;
    }
    if (el.btnPause) el.btnPause.textContent = G.paused ? "▶ 继续" : "⏸ 暂停";
  }

  /* ================= 触屏键盘 ================= */
  function buildKb() {
    if (!el.kb || el.kb.dataset.built) return;
    var rows = ["qwertyuiop", "asdfghjkl", "zxcvbnm"];
    var html = rows.map(function (r) {
      return '<div class="w-kb-row">' + r.split("").map(function (c) { return '<button type="button" class="w-key" data-k="' + c + '">' + c.toUpperCase() + "</button>"; }).join("") + "</div>";
    }).join("");
    html += '<div class="w-kb-row"><button type="button" class="w-key wide" data-k="Backspace">⌫ 删除</button><button type="button" class="w-key wide" data-k="Esc">✋ 放弃(Esc)</button></div>';
    el.kb.innerHTML = html;
    el.kb.dataset.built = "1";
    $$(".w-key").forEach(function (k) {
      k.addEventListener("click", function () {
        var v = k.getAttribute("data-k");
        if (v === "Backspace") handleBackspace();
        else if (v === "Esc") handleEsc();
        else handleLetter(v);
      });
    });
  }
  function toggleKb() {
    if (!el.kb) return;
    buildKb();
    var touch = ("ontouchstart" in window) || (window.matchMedia && window.matchMedia("(pointer: coarse)").matches);
    el.kb.hidden = !(cfg.showKb || (touch && G.running));
  }

  /* ================= 输入 ================= */
  function handleBackspace() {
    if (!G.running || G.paused) return;
    if (G.target && G.target.progress > 0) {
      G.target.progress--;
      paintWord(G.target);
    }
  }
  function handleEsc() {
    if (!G.running || G.paused) return;
    if (G.target) { G.target.progress = 0; paintWord(G.target); G.target = null; updateHud(); }
  }

  function onKeydown(e) {
    if (stateView() !== "words") return;
    var tag = (e.target && e.target.tagName || "").toLowerCase();
    if (tag === "input" || tag === "textarea") return;
    if (!G.running || G.paused || G.over) return;
    if (/^[a-zA-Z]$/.test(e.key)) { handleLetter(e.key); e.preventDefault(); }
    else if (e.key === "Backspace") { handleBackspace(); e.preventDefault(); }
    else if (e.key === "Escape") { handleEsc(); }
  }
  function stateView() {
    return (window.DailyTalkViewState && window.DailyTalkViewState()) || "";
  }

  /* ================= 对外接口 ================= */
  window.DailyTalkWordsGame = {
    onShow: function () { renderSetup(); },
    onHide: function () { if (G.running && !G.paused) togglePause(true); },
    /* 测试/调试钩子 */
    debug: { state: function () { return G; }, letter: handleLetter }
  };

  /* ================= 启动 ================= */
  function init() {
    cacheDom();
    loadStore();
    renderSetup();
    toggleKb();
    if (el.start) el.start.addEventListener("click", startGame);
    if (el.btnPause) el.btnPause.addEventListener("click", function () { togglePause(); });
    if (el.btnEnd) el.btnEnd.addEventListener("click", function () { if (G.running) endGame(false, true); else backToSetup(); });
    if (el.btnKb) el.btnKb.addEventListener("click", function () { cfg.showKb = !cfg.showKb; saveCfg(); toggleKb(); });
    if (el.btnSound) el.btnSound.addEventListener("click", function () {
      cfg.autoSpeak = !cfg.autoSpeak; saveCfg();
      el.btnSound.textContent = cfg.autoSpeak ? "🔊 发音开" : "🔇 发音关";
    });
    document.addEventListener("keydown", onKeydown);
    window.addEventListener("blur", function () { if (G.running && !G.paused) togglePause(true); });
    if (el.btnSound) el.btnSound.textContent = cfg.autoSpeak ? "🔊 发音开" : "🔇 发音关";
  }

  function toastMsg(msg) {
    var t = $("#toast");
    if (!t) return;
    t.textContent = msg; t.hidden = false;
    clearTimeout(toastMsg._t);
    toastMsg._t = setTimeout(function () { t.hidden = true; }, 2200);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
