/* =========================================================
 * DailyTalk · 面试特训模块（独立引擎）
 * 复用 DailyTalkCorrect 纠错引擎，自带 TTS / 语音识别 / 评分
 * 目标岗位：国际学校 本科招生行政岗
 * ========================================================= */
(function () {
  "use strict";

  var D = window.DailyTalkInterviewData;
  var C = window.DailyTalkCorrect;
  if (!D || !C) return;

  /* ---------------- 工具 ---------------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }
  function pad2(n) { return (n < 10 ? "0" : "") + n; }
  function fmtTime(ts) { var d = new Date(ts); return pad2(d.getMonth() + 1) + "月" + pad2(d.getDate()) + "日 " + pad2(d.getHours()) + ":" + pad2(d.getMinutes()); }

  function toast(msg, ms) {
    var el = document.getElementById("toast");
    if (!el) return;
    el.textContent = msg;
    el.hidden = false;
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { el.hidden = true; }, ms || 2600);
  }

  /* ---------------- 存储 ---------------- */
  var LS_REC = "dailytalk_interview_v1";
  var LS_LANG = "dailytalk_interview_lang_v1";

  function loadRecords() {
    try { var a = JSON.parse(localStorage.getItem(LS_REC) || "[]"); return Array.isArray(a) ? a : []; } catch (e) { return []; }
  }
  function saveRecords() {
    try { localStorage.setItem(LS_REC, JSON.stringify(records.slice(-200))); } catch (e) { }
  }
  var records = loadRecords();

  var state = {
    lang: (function () { try { return localStorage.getItem(LS_LANG) === "zh" ? "zh" : "en"; } catch (e) { return "en"; } })(),
    tab: "bank",
    openCat: null,
    practice: null,
    filter: 0
  };

  function setLang(l) {
    state.lang = l;
    try { localStorage.setItem(LS_LANG, l); } catch (e) { }
  }

  /* ---------------- 语音合成 ---------------- */
  var voices = [];
  function loadVoices() { if (window.speechSynthesis) voices = window.speechSynthesis.getVoices(); }
  if (window.speechSynthesis) { loadVoices(); window.speechSynthesis.onvoiceschanged = loadVoices; }

  function pickVoice(lang) {
    if (!voices.length) loadVoices();
    var pre = lang === "zh" ? "zh" : "en";
    var list = voices.filter(function (v) { return v.lang && v.lang.toLowerCase().indexOf(pre) === 0; });
    if (!list.length) return null;
    if (pre === "en") {
      var fav = list.filter(function (v) { return /google us english|samantha|aria|jenny|zira/i.test(v.name); });
      return fav[0] || list[0];
    }
    var favZh = list.filter(function (v) { return /huihui|xiaoxiao|yaoyao|tingting|kangkang|google 普通话/i.test(v.name); });
    return favZh[0] || list[0];
  }

  function speak(text, lang, cb) {
    if (!window.speechSynthesis || !text) { if (cb) cb(); return; }
    window.speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(text);
    var v = pickVoice(lang || state.lang);
    if (v) u.voice = v;
    u.lang = (lang === "zh" || (!lang && state.lang === "zh")) ? "zh-CN" : "en-US";
    u.rate = u.lang === "zh-CN" ? 1 : 0.92;
    u.pitch = 1;
    if (cb) u.onend = cb;
    try { window.speechSynthesis.speak(u); } catch (e) { if (cb) cb(); }
  }
  function stopSpeak() { if (window.speechSynthesis) window.speechSynthesis.cancel(); }

  /* ---------------- 语音识别 ---------------- */
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  var recog = null;
  var rec = { finals: [], interim: "", startTs: 0, lastFinalTs: 0 };
  var listening = false;

  /* 语音识别结束后的统一处理：写入文本框并自动提交评分 */
  function handleSpeechDone(data) {
    if (!state.practice) return;
    if (data && data.text) {
      var tx = $("#ivText");
      if (tx) tx.value = data.text;
      state.practice.lastMeta = { speech: true, conf: data.conf, dur: data.dur };
      submitAnswer();
    } else {
      toast("没有识别到内容，试试靠近麦克风再说一次。");
    }
  }

  function micOK() { return !!SR; }

  function micLabel() {
    var b = $("#ivMic");
    if (!b) return;
    b.classList.toggle("rec", listening);
    b.textContent = listening ? "■" : "🎤";
  }

  function collect() {
    var t = rec.finals.map(function (f) { return f.text; }).join(" ").trim();
    var conf = rec.finals.length ? rec.finals.reduce(function (s, f) { return s + f.conf; }, 0) / rec.finals.length : null;
    var dur = rec.lastFinalTs > rec.startTs ? (rec.lastFinalTs - rec.startTs) / 1000 : null;
    return { text: t, conf: conf, dur: dur, speech: true };
  }

  function stopRec() {
    listening = false;
    micLabel();
    if (recog) { try { recog.stop(); } catch (e) { } }
  }

  function startRec() {
    if (!SR) { toast("当前浏览器不支持语音识别，请用 Chrome / Edge，或直接打字作答。"); return; }
    stopSpeak();
    if (listening) { stopRec(); return; }
    recog = new SR();
    recog.lang = state.lang === "zh" ? "zh-CN" : "en-US";
    recog.interimResults = true;
    recog.continuous = false;
    rec.finals = []; rec.interim = ""; rec.startTs = Date.now(); rec.lastFinalTs = 0;
    var live = $("#ivLive");
    if (live) { live.hidden = false; live.textContent = "正在聆听…"; }

    recog.onresult = function (e) {
      var interim = "";
      for (var i = e.resultIndex; i < e.results.length; i++) {
        var r = e.results[i];
        if (r.isFinal) {
          rec.finals.push({ text: r[0].transcript, conf: (r[0].confidence || 0.8) });
          rec.lastFinalTs = Date.now();
        } else { interim += r[0].transcript; }
      }
      rec.interim = interim;
      var box = $("#ivLive");
      if (box) {
        var shown = rec.finals.map(function (f) { return f.text; }).join(" ");
        box.textContent = (shown + " " + interim).trim() || "正在聆听…";
      }
    };
    recog.onerror = function (ev) {
      listening = false; micLabel();
      if (ev && ev.error === "not-allowed") toast("麦克风权限被拒绝：请在地址栏允许麦克风后重试。");
      else if (ev && ev.error === "no-speech") toast("没有听到声音，请靠近麦克风再说一次。");
    };
    recog.onend = function () {
      listening = false; micLabel();
      var box = $("#ivLive"); if (box) box.hidden = true;
      handleSpeechDone(collect());
    };
    try { recog.start(); listening = true; micLabel(); }
    catch (e) { toast("无法启动麦克风，请稍后重试。"); }
  }

  /* ---------------- 得分点识别（支持同义表达，避免「换个说法就不算」） ---------------- */
  var SYN = {
    "introduce": ["my name is", "i am ", "i'm ", "let me introduce"],
    "experience": ["worked as", "worked for", "worked in", "years of", "background", "used to"],
    "admissions": ["admission", "application process", "enrolment", "enrollment", "recruitment", "apply"],
    "bilingual": ["both english and chinese", "english and chinese", "two languages", "both languages"],
    "international school": ["your school", "our school", "international"],
    "detail": ["attention to detail", "careful", "accuracy", "accurate", "organized"],
    "team": ["team", "colleagues", "group", "together"],
    "curriculum": ["curriculum", "programme", "program", "courses", "ib", "a-level", "ap "],
    "students": ["students", "pupils", "learners"],
    "values": ["values", "philosophy", "mission", "culture"],
    "reputation": ["reputation", "well known", "recognised", "recognized", "famous"],
    "grow": ["grow", "develop", "learn", "improve myself"],
    "communication": ["communication", "communicate", "talk to", "speak with"],
    "pressure": ["pressure", "stress", "busy", "peak season", "high season"],
    "multitask": ["multitask", "at the same time", "several tasks", "many tasks"],
    "improve": ["improve", "working on", "learning to", "getting better"],
    "marketing": ["marketing", "promotion", "promote", "publicity"],
    "campaign": ["campaign", "activity", "event", "activities"],
    "info session": ["info session", "information session", "presentation", "roadshow", "briefing"],
    "open day": ["open day", "open house", "campus day"],
    "materials": ["materials", "brochure", "leaflet", "handout"],
    "follow up": ["follow up", "follow-up", "get back to", "contact them again", "call back"],
    "system": ["system", "platform", "database", "crm", "records"],
    "interests": ["interests", "what they like", "hobbies", "their needs"],
    "goals": ["goals", "plans", "aim", "target", "dream"],
    "faculty": ["faculty", "teachers", "teaching staff", "professors"],
    "university offers": ["university offers", "admissions results", "graduates", "universities"],
    "campus visit": ["campus visit", "visit the campus", "come to the campus", "tour"],
    "fit": ["fit", "suitable", "match", "right for"],
    "deadline": ["deadline", "due date", "cut-off", "closing date", "end of"],
    "verify": ["verify", "double-check", "double check", "confirm", "check again"],
    "documents": ["documents", "paperwork", "files", "materials"],
    "reminder": ["reminder", "remind", "alert", "notification"],
    "accuracy": ["accuracy", "accurate", "correct", "no mistakes"],
    "itinerary": ["itinerary", "schedule", "agenda", "arrangement"],
    "welcome": ["welcome", "glad to", "happy to", "pleasure"],
    "schedule": ["schedule", "timetable", "plan", "agenda"],
    "campus tour": ["campus tour", "show you around", "tour the campus", "walk around"],
    "interpret": ["interpret", "translation", "translate", "interpreter"],
    "arrange": ["arrange", "organise", "organize", "set up", "make an appointment"],
    "polite": ["polite", "politely", "courteous", "respectful"],
    "appointment": ["appointment", "book a time", "schedule a meeting", "arrange a time"],
    "explain": ["explain", "tell them", "let them know", "clarify"],
    "listen": ["listen", "hear them out", "let them finish", "their concern"],
    "notes": ["notes", "note down", "write down", "record", "take down"],
    "guest list": ["guest list", "name list", "list of guests", "attendees"],
    "meeting room": ["meeting room", "conference room", "venue", "room"],
    "interpretation": ["interpretation", "interpreter", "translation", "translate"],
    "refreshments": ["refreshments", "tea", "coffee", "snacks", "water"],
    "contact": ["contact", "phone number", "emergency", "reach"],
    "tuition": ["tuition", "fee", "fees", "cost", "price"],
    "scholarship": ["scholarship", "financial aid", "grant", "funding"],
    "policy": ["policy", "rules", "regulations", "guidelines", "official"],
    "confirm": ["confirm", "check with", "verify", "make sure"],
    "accurate": ["accurate", "correct", "exact", "right figure"],
    "record": ["record", "log", "note down", "write down", "keep a note"],
    "call back": ["call back", "call you back", "get back to you", "return the call"],
    "apologize": ["apologise", "apologize", "sorry", "regret"],
    "patience": ["patience", "patient", "thank you for waiting"],
    "check": ["check", "look into", "find out", "see"],
    "timeline": ["timeline", "when", "by when", "time frame", "timeframe"],
    "update": ["update", "keep them informed", "let them know", "inform"],
    "assure": ["assure", "make sure", "promise", "reassure"],
    "confidential": ["confidential", "private", "secret", "not share"],
    "personal information": ["personal information", "personal data", "student data", "privacy"],
    "authorised": ["authorised", "authorized", "permission", "allowed", "approved"],
    "data entry": ["data entry", "enter data", "input", "type in", "record data"],
    "format": ["format", "same way", "standard", "consistent"],
    "duplicates": ["duplicates", "duplicate", "repeated records", "clean up"],
    "backup": ["backup", "back up", "save a copy"],
    "procedure": ["procedure", "process", "policy", "steps"],
    "colleague": ["colleague", "co-worker", "coworker", "teammate", "team member"],
    "status": ["status", "progress", "stage", "where they are"],
    "report": ["report", "summary", "statistics", "figures"],
    "support": ["support", "help", "assist", "back up the team"],
    "understand": ["understand", "know", "aware", "realise", "realize"],
    "ready": ["ready", "prepared", "willing", "happy to"],
    "prioritise": ["prioritise", "prioritize", "priority", "most important first"],
    "overtime": ["overtime", "extra hours", "work late", "long hours"],
    "travel": ["travel", "business trip", "trip", "go abroad"],
    "situation": ["situation", "once", "one time", "there was"],
    "task": ["task", "job", "responsibility", "goal"],
    "action": ["action", "i did", "i made", "i organised", "i organized", "i set up"],
    "result": ["result", "in the end", "finally", "we finished", "as a result"],
    "divide": ["divide", "split", "share the work", "divided"],
    "review": ["review", "go over", "check together", "reflect"],
    "visa": ["visa", "documents for travel", "passport"],
    "flights": ["flights", "flight", "air ticket", "tickets", "hotel"],
    "handover": ["handover", "hand over", "pass on", "take over", "hand over my tasks"],
    "communicate": ["communicate", "communication", "talk", "message", "keep in touch"],
    "progress": ["progress", "update", "status", "how far"],
    "responsible": ["responsible", "in charge", "accountable", "own it"],
    "solve": ["solve", "fix", "deal with", "sort out", "handle"],
    "confidentiality": ["confidentiality", "confidential", "secrecy", "privacy"],
    "personal data": ["personal data", "personal information", "student data"],
    "privacy": ["privacy", "private", "personal"],
    "least access": ["least access", "only the files i need", "restricted access", "limited access"],
    "lock": ["lock", "lock my screen", "log out", "secure"],
    "responsibility": ["responsibility", "duty", "my job", "obligation"],
    "cannot": ["cannot", "can't", "not able to", "not allowed"],
    "official channel": ["official channel", "official way", "website", "official process"],
    "firm": ["firm", "clear", "not change my mind", "strict"],
    "culture": ["culture", "cultural", "different background", "from abroad"],
    "example": ["for example", "once", "one time", "for instance"],
    "simple English": ["simple english", "plain english", "easy words", "slowly"],
    "patient": ["patient", "patience", "take my time"],
    "misunderstanding": ["misunderstanding", "misunderstand", "confusion", "avoid problems"],
    "enquiry": ["enquiry", "inquiry", "ask", "contact us", "question"],
    "application": ["application", "apply", "form"],
    "interview": ["interview", "assessment", "test"],
    "offer": ["offer", "admission letter", "result", "acceptance"],
    "enrolment": ["enrolment", "enrollment", "register", "registration", "sign up"],
    "reason": ["reason", "because", "why", "purpose"],
    "options": ["options", "alternatives", "other choices", "another way"],
    "respect": ["respect", "understand their", "value their"],
    "department": ["department", "office", "team", "colleague"],
    "campaign": ["campaign", "activity", "event"]
  };

  var SYN_ZH = {
    "自我介绍": ["我叫", "我的名字", "姓"],
    "学历或专业": ["专业", "毕业", "大学", "本科", "硕士"],
    "行政或招生经验": ["行政", "招生", "助理", "经验", "经历", "做过"],
    "中英文沟通": ["中英文", "英文", "英语", "双语", "沟通"],
    "细致": ["细致", "细心", "注意细节", "认真"],
    "团队": ["团队", "同事", "配合", "协作"],
    "课程体系": ["课程", "体系", "IB", "AP", "A-Level"],
    "国际化": ["国际化", "国际", "外籍", "多元"],
    "学生构成": ["学生", "生源", "来自"],
    "办学理念": ["理念", "全人", "培养", "宗旨"],
    "口碑": ["口碑", "声誉", "评价", "认可"],
    "成长": ["成长", "提升", "学习", "发展"],
    "沟通": ["沟通", "交流", "表达"],
    "有条理": ["条理", "计划", "安排", "有序"],
    "抗压": ["抗压", "压力", "忙", "紧张", "旺季"],
    "多任务": ["多任务", "同时", "几件事", "并行"],
    "改进": ["改进", "提升", "正在学", "调整"],
    "清单": ["清单", "列表", "checklist", "逐项"],
    "宣传": ["宣传", "推广", "品牌", "推介"],
    "推广渠道": ["渠道", "线上", "线下", "公众号", "社交媒体"],
    "宣讲会": ["宣讲会", "说明会", "讲座", "路演"],
    "开放日": ["开放日", "校园日", "参观日"],
    "物料": ["物料", "手册", "资料", "宣传品"],
    "跟进": ["跟进", "回访", "联系", "追踪"],
    "系统记录": ["系统", "平台", "记录", "录入"],
    "了解需求": ["了解", "需求", "兴趣", "情况"],
    "目标": ["目标", "打算", "规划", "想去"],
    "课程": ["课程", "体系", "IB", "AP", "A-Level"],
    "师资": ["师资", "老师", "教师", "教学"],
    "升学成果": ["升学", "录取", "大学", "offer"],
    "来校参观": ["参观", "来访", "到校", "看看校园"],
    "匹配": ["匹配", "适合", "符合", "契合"],
    "截止日期": ["截止", "deadline", "期限", "时间节点"],
    "核对": ["核对", "复核", "检查", "确认"],
    "材料": ["材料", "文件", "资料", "证明"],
    "提醒": ["提醒", "通知", "闹钟", "提示"],
    "准确性": ["准确", "正确", "不出错", "无误"],
    "提前确认行程": ["提前", "确认", "行程", "安排"],
    "迎接问候": ["迎接", "问候", "接待", "欢迎"],
    "介绍安排": ["介绍", "安排", "日程", "流程"],
    "陪同参观": ["陪同", "参观", "带领", "引导"],
    "翻译": ["翻译", "口译", "英文讲解", "interpret"],
    "后续跟进": ["后续", "跟进", "回访", "邮件"],
    "礼貌接待": ["礼貌", "热情", "客气", "友好"],
    "预约": ["预约", "约", "时间", "安排"],
    "说明": ["说明", "解释", "告知", "讲清"],
    "倾听": ["倾听", "听", "了解诉求", "听完"],
    "记录": ["记录", "记下", "登记", "留痕"],
    "安排": ["安排", "协调", "组织", "准备"],
    "来宾名单": ["名单", "来宾", "人员", "嘉宾"],
    "日程": ["日程", "行程", "安排", "时间表"],
    "会议室": ["会议室", "场地", "会场", "教室"],
    "展示材料": ["展示", "材料", "PPT", "资料"],
    "茶歇": ["茶歇", "茶水", "点心", "饮品"],
    "应急联系人": ["应急", "联系人", "紧急", "备用"],
    "学费": ["学费", "费用", "收费", "多少钱"],
    "奖学金": ["奖学金", "助学金", "资助", "减免"],
    "政策口径": ["政策", "口径", "规定", "官方"],
    "核实": ["核实", "确认", "查证", "问一下"],
    "准确": ["准确", "正确", "精确", "具体"],
    "回电": ["回电", "回电话", "回复", "联系您"],
    "道歉": ["道歉", "抱歉", "对不起", "不好意思"],
    "耐心": ["耐心", "等待", "体谅"],
    "核查": ["核查", "查询", "查", "核实"],
    "时间节点": ["时间", "节点", "几点", "多久"],
    "同步进展": ["同步", "进展", "反馈", "告知"],
    "安心": ["安心", "放心", "踏实"],
    "口径统一": ["统一", "一致", "口径", "标准"],
    "保密": ["保密", "不外传", "隐私", "机密"],
    "个人信息": ["个人信息", "资料", "隐私", "学生信息"],
    "授权": ["授权", "权限", "允许", "获批"],
    "通话记录": ["通话记录", "记录", "留痕", "登记"],
    "录入": ["录入", "输入", "登记", "填写"],
    "格式统一": ["格式", "统一", "规范", "标准"],
    "及时更新": ["及时", "更新", "实时", "当天"],
    "去重": ["去重", "重复", "清理", "多余"],
    "备份": ["备份", "存档", "保存副本"],
    "修正": ["修正", "改", "纠正", "更正"],
    "按流程": ["流程", "规定", "程序", "规范"],
    "委婉": ["委婉", "礼貌", "私下", "善意"],
    "避免再犯": ["避免", "防止", "不再", "下次"],
    "实时更新": ["实时", "及时", "随时", "更新"],
    "状态": ["状态", "进度", "阶段", "情况"],
    "报表": ["报表", "统计", "汇总", "数据"],
    "节点": ["节点", "时间点", "截止", "里程碑"],
    "数据统计": ["统计", "数据", "分析", "汇总"],
    "支持决策": ["决策", "支持", "参考", "判断"],
    "理解": ["理解", "明白", "清楚", "知道"],
    "做好准备": ["准备", "可以", "愿意", "接受"],
    "排优先级": ["优先级", "重要", "先做", "排序"],
    "计划": ["计划", "安排", "规划", "提前"],
    "加班": ["加班", "晚走", "多干", "延长"],
    "出差": ["出差", "外派", "跑外地", "外出"],
    "经历": ["经历", "做过", "有一次", "曾经"],
    "情境": ["当时", "有一次", "情况", "背景"],
    "任务": ["任务", "工作", "目标", "要求"],
    "行动": ["我做了", "我负责", "我组织", "我安排"],
    "结果": ["结果", "最后", "完成", "效果"],
    "分工": ["分工", "分配", "各自", "协作"],
    "复盘": ["复盘", "总结", "回顾", "改进"],
    "确认": ["确认", "确定", "核实", "问清"],
    "签证": ["签证", "护照", "出境"],
    "机票": ["机票", "航班", "住宿", "酒店"],
    "行程": ["行程", "日程", "安排", "路线"],
    "工作交接": ["交接", "交给", "移交", "代办"],
    "同步进度": ["同步", "进度", "沟通", "告知"],
    "补位": ["补位", "帮忙", "顶上", "分担"],
    "责任心": ["责任", "负责", "担当"],
    "先解决": ["先解决", "先处理", "先应对", "冷静"],
    "最小权限": ["权限", "只查看", "必要", "限制"],
    "锁屏": ["锁屏", "关屏", "离开", "注销"],
    "责任": ["责任", "职责", "义务"],
    "规定": ["规定", "制度", "要求", "政策"],
    "官方渠道": ["官方", "渠道", "官网", "正式"],
    "立场明确": ["明确", "不能", "拒绝", "坚决"],
    "跨文化": ["跨文化", "不同文化", "外国人", "外籍"],
    "具体例子": ["有一次", "例如", "举例", "当时"],
    "简单表达": ["简单", "放慢", "通俗", "容易懂"],
    "确认理解": ["确认", "理解一致", "复述", "问清"],
    "避免误会": ["避免", "误会", "误解", "歧义"],
    "咨询": ["咨询", "联系", "询问", "打电话"],
    "申请": ["申请", "报名", "提交"],
    "面试": ["面试", "测评", "考核"],
    "审核": ["审核", "评估", "审批"],
    "录取通知": ["录取", "通知", "offer", "结果"],
    "注册": ["注册", "入学", "缴费", "报到"],
    "政策": ["政策", "规定", "制度"],
    "原因": ["原因", "因为", "出发点", "考虑"],
    "替代方案": ["替代", "其他", "别的办法", "方案"],
    "尊重": ["尊重", "理解", "体谅"],
    "对应部门": ["部门", "办公室", "负责", "上级"]
  };

  function stripWord(w) {
    return w.replace(/s$/, "");
  }

  function hitEn(low, key) {
    var k = String(key).toLowerCase();
    if (low.indexOf(k) >= 0) return true;
    /* 单复数容错 */
    if (k.indexOf(" ") < 0 && k.length > 4 && low.indexOf(stripWord(k)) >= 0) return true;
    var alts = SYN[k];
    if (alts) { for (var i = 0; i < alts.length; i++) { if (low.indexOf(alts[i]) >= 0) return true; } }
    return false;
  }

  function hitZh(text, key) {
    if (text.indexOf(key) >= 0) return true;
    var alts = SYN_ZH[key];
    if (alts) { for (var i = 0; i < alts.length; i++) { if (text.indexOf(alts[i]) >= 0) return true; } }
    return false;
  }

  /* ---------------- 评分 ---------------- */
  function weighted(dims, w) {
    var sum = 0, ws = 0;
    Object.keys(w).forEach(function (k) {
      if (dims[k] != null) { sum += dims[k] * w[k]; ws += w[k]; }
    });
    return ws ? Math.round(sum / ws) : 0;
  }

  function fluencyEn(wc, dur) {
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

  function scoreEn(text, meta, keys) {
    var a = C.analyze(text);
    var low = text.toLowerCase();
    var hit = [], miss = [];
    (keys || []).forEach(function (k) {
      if (hitEn(low, k)) hit.push(k); else miss.push(k);
    });
    var grammar = clamp(100 - a.count * 9, 25, 100);
    var wc = a.wordCount;
    var kwScore = keys && keys.length ? Math.round(hit.length / keys.length * 100) : 80;
    /* 篇幅充分度：面试回答太短会明显吃亏 */
    var lenScore = wc <= 5 ? 45 : wc <= 12 ? 64 : wc <= 22 ? 80 : wc <= 60 ? 92 : 86;
    /* 表达自然且篇幅够，说明内容本身是完整的，给一个合理下限 */
    if (wc >= 25 && a.count === 0 && kwScore < 55) kwScore = 55;
    var coverage = Math.round(kwScore * 0.62 + lenScore * 0.38);
    var flu = fluencyEn(wc, meta && meta.dur);
    var pron = (meta && meta.conf != null) ? clamp(Math.round(meta.conf * 100), 35, 99) : null;
    if (meta && meta.speech && pron == null) pron = 74;
    var dims = { grammar: grammar, coverage: coverage, flu: flu, pron: pron };
    return {
      lang: "en", dims: dims,
      overall: weighted(dims, { grammar: 0.3, coverage: 0.34, flu: 0.18, pron: 0.18 }),
      errors: a.errors || [], tips: a.tips || [], corrected: a.corrected,
      hit: hit, miss: miss, wc: wc
    };
  }

  function scoreZh(text, keysZh) {
    var t = String(text || "");
    var hit = [], miss = [];
    (keysZh || []).forEach(function (k) {
      if (hitZh(t, k)) hit.push(k); else miss.push(k);
    });
    var kwScore = keysZh && keysZh.length ? Math.round(hit.length / keysZh.length * 100) : 80;
    var len = t.length;
    var lenScore = len < 20 ? 45 : len < 40 ? 66 : len < 90 ? 84 : len < 220 ? 92 : 85;
    if (len >= 70 && kwScore < 55) kwScore = 55;
    var coverage = Math.round(kwScore * 0.62 + lenScore * 0.38);
    var structure = len < 25 ? 52 : len < 60 ? 72 : len < 140 ? 86 : 92;
    var flu = /[，。！？；、]/.test(t) ? 88 : 74;
    if (len > 160) flu = Math.min(96, flu + 5);
    var dims = { coverage: coverage, structure: structure, flu: clamp(flu, 30, 98) };
    return {
      lang: "zh", dims: dims,
      overall: weighted(dims, { coverage: 0.5, structure: 0.28, flu: 0.22 }),
      hit: hit, miss: miss, len: len
    };
  }

  function analyzeAnswer(text, meta, keys, keysZh) {
    return state.lang === "en" ? scoreEn(text, meta, keys) : scoreZh(text, keysZh);
  }

  /* ---------------- 题目工具 ---------------- */
  function allQuestions() {
    var out = [];
    D.categories.forEach(function (cat) {
      cat.questions.forEach(function (q, i) { out.push({ cat: cat, q: q, idx: i }); });
    });
    return out;
  }
  function findCat(id) {
    for (var i = 0; i < D.categories.length; i++) if (D.categories[i].id === id) return D.categories[i];
    return null;
  }
  function findScenario(id) {
    for (var i = 0; i < D.scenarios.length; i++) if (D.scenarios[i].id === id) return D.scenarios[i];
    return null;
  }
  function totalUnits() { return allQuestions().length + D.scenarios.reduce(function (s, x) { return s + x.turns.length; }, 0); }
  function practicedUnits() {
    var set = {};
    records.forEach(function (r) {
      if (!r.qid) return;
      if (r.qid.indexOf("mock") === 0) return;   /* 模拟面试的临时编号不计入题量 */
      set[r.qid] = 1;
    });
    return Object.keys(set).length;
  }
  function stats() {
    if (!records.length) return { n: 0, avg: null, best: null };
    var sum = 0, best = 0;
    records.forEach(function (r) { sum += r.overall || 0; best = Math.max(best, r.overall || 0); });
    return { n: records.length, avg: Math.round(sum / records.length), best: best };
  }
  function dimAvgOf(rs, keys) {
    var out = {};
    keys.forEach(function (k) {
      var vals = rs.map(function (r) { return r.dims && r.dims[k]; }).filter(function (v) { return v != null; });
      out[k] = vals.length ? Math.round(vals.reduce(function (a, b) { return a + b; }, 0) / vals.length) : null;
    });
    return out;
  }

  /* ---------------- 视图骨架 ---------------- */
  function langTag() { return state.lang === "en" ? "英文作答" : "中文作答"; }

  function renderStats() {
    var box = $("#ivStats");
    if (!box) return;
    var s = stats();
    var done = practicedUnits(), total = totalUnits();
    box.innerHTML =
      '<div class="stat-card"><div class="stat-ico">🎯</div><div><p class="stat-num">' + (s.avg == null ? "--" : s.avg) + '</p><p class="stat-label">平均得分</p></div></div>' +
      '<div class="stat-card"><div class="stat-ico">🏅</div><div><p class="stat-num">' + (s.best == null ? "--" : s.best) + '</p><p class="stat-label">最佳单题</p></div></div>' +
      '<div class="stat-card"><div class="stat-ico">🧪</div><div><p class="stat-num">' + s.n + '<span class="stat-unit"> 次</span></p><p class="stat-label">练习次数</p></div></div>' +
      '<div class="stat-card"><div class="stat-ico">📚</div><div><p class="stat-num">' + done + '<span class="stat-unit"> / ' + total + '</span></p><p class="stat-label">已练题目</p></div></div>';
  }

  function renderPosition() {
    var box = $("#ivPosition");
    if (!box) return;
    var p = D.position;
    var duties = p.duties.map(function (d) { return '<span class="iv-jd-chip">' + d.icon + " " + esc(d.text) + "</span>"; }).join("");
    var quals = p.qualities.map(function (d) { return '<span class="iv-jd-chip iv-jd-chip-q">' + d.icon + " " + esc(d.text) + "</span>"; }).join("");
    box.innerHTML =
      '<div class="iv-jd-head">' +
        '<div><h3>🎯 ' + esc(p.title) + '</h3><p class="iv-jd-en">' + esc(p.titleEn) + "</p></div>" +
        '<div class="iv-lang-switch" role="group" aria-label="作答语言">' +
          '<button type="button" class="iv-lang-btn' + (state.lang === "en" ? " on" : "") + '" data-lang="en">英文作答</button>' +
          '<button type="button" class="iv-lang-btn' + (state.lang === "zh" ? " on" : "") + '" data-lang="zh">中文作答</button>' +
        "</div>" +
      "</div>" +
      '<p class="iv-jd-sum">' + esc(p.summary) + "</p>" +
      '<div class="iv-jd-row"><b>岗位职责</b>' + duties + "</div>" +
      '<div class="iv-jd-row"><b>硬性要求</b>' + quals + "</div>";
  }

  /* ---------------- Tab：题库 ---------------- */
  function renderBank() {
    var body = $("#ivBody");
    if (!body) return;
    var html = '<div class="iv-cat-grid">';
    D.categories.forEach(function (cat) {
      var done = cat.questions.filter(function (q) {
        return records.some(function (r) { return r.qid === q.id; });
      }).length;
      var open = state.openCat === cat.id;
      html += '<div class="iv-cat-card' + (open ? " open" : "") + '" data-cat="' + cat.id + '">' +
        '<div class="iv-cat-head">' +
          '<span class="iv-cat-ico">' + cat.icon + "</span>" +
          '<div class="iv-cat-txt"><b>' + esc(cat.name) + '</b><span>' + esc(cat.nameEn) + "</span></div>" +
          '<span class="iv-cat-badge">' + done + "/" + cat.questions.length + "</span>" +
          '<span class="iv-cat-caret">▾</span>' +
        "</div>" +
        '<p class="iv-cat-desc">' + esc(cat.desc) + "</p>" +
        '<div class="iv-q-list">';
      cat.questions.forEach(function (q, i) {
        var practiced = records.some(function (r) { return r.qid === q.id; });
        html += '<button type="button" class="iv-q-item' + (practiced ? " done" : "") + '" data-cat="' + cat.id + '" data-qi="' + i + '">' +
          '<span class="iv-q-no">' + (i + 1) + "</span>" +
          '<span class="iv-q-txt">' + esc(state.lang === "en" ? q.q : q.qzh) + "</span>" +
          (practiced ? '<span class="iv-q-done">✓</span>' : '<span class="iv-q-go">练习 →</span>') +
        "</button>";
      });
      html += "</div></div>";
    });
    html += "</div>";
    body.innerHTML = html;
  }

  /* ---------------- Tab：情景模拟 ---------------- */
  function renderScenarioList() {
    var body = $("#ivBody");
    if (!body) return;
    var html = '<p class="iv-tip">每个情景 3 轮对话，你扮演招生行政人员，逐轮作答并即时获得评分与参考话术。</p><div class="iv-sc-grid">';
    D.scenarios.forEach(function (sc) {
      var doneCount = sc.turns.filter(function (t, i) {
        return records.some(function (r) { return r.qid === "sc:" + sc.id + ":" + i; });
      }).length;
      html += '<div class="iv-sc-card" data-sc="' + sc.id + '">' +
        '<div class="iv-sc-top"><span class="iv-sc-ico">' + sc.icon + "</span><div><b>" + esc(sc.title) + '</b><span class="iv-sc-en">' + esc(sc.titleEn) + "</span></div></div>" +
        '<p class="iv-sc-desc">' + esc(sc.desc) + "</p>" +
        '<div class="iv-sc-foot"><span class="iv-sc-prog">' + doneCount + "/" + sc.turns.length + " 轮已练</span>" +
        '<button type="button" class="btn btn-primary btn-sm" data-start-sc="' + sc.id + '">开始模拟</button></div>' +
        "</div>";
    });
    html += "</div>";
    body.innerHTML = html;
  }

  /* ---------------- Tab：全真模拟 ---------------- */
  function renderMock() {
    var body = $("#ivBody");
    if (!body) return;
    var mocks = records.filter(function (r) { return r.mode === "mock"; }).slice(-5).reverse();
    var listHTML = mocks.length ? mocks.map(function (r) {
      return '<div class="iv-hist-item"><span class="iv-hist-title">' + esc(r.title || "全真模拟面试") + '</span>' +
        '<span class="iv-hist-meta">' + fmtTime(r.ts) + " · " + (r.lang === "zh" ? "中文" : "英文") + '</span>' +
        '<span class="iv-hist-score">' + r.overall + "</span></div>";
    }).join("") : '<p class="empty-hint">还没有模拟记录，点上面的按钮开始第一场吧。</p>';

    body.innerHTML =
      '<div class="card iv-mock-card">' +
        '<h3>🧪 全真模拟面试</h3>' +
        '<p class="iv-mock-desc">系统会从 8 个考察维度中随机抽取 <b>6 道题</b>（含自我介绍），连续作答；结束后给出综合评分、各维度表现与参考答案回顾。</p>' +
        '<ul class="iv-mock-list">' +
          "<li>⏱️ 约 12–15 分钟，建议全程用<b>语音</b>作答，更接近真实面试</li>" +
          "<li>🎯 覆盖：自我介绍 / 招生宣传 / 接待 / 热线 / 平台 / 抗压 / 团队保密 / 双语</li>" +
          "<li>📄 结束后可回看每题参考答案，方便整理自己的话术</li>" +
        "</ul>" +
        '<div class="iv-mock-actions">' +
          '<button type="button" class="btn btn-primary btn-lg" id="ivStartMock">▶ 开始全真模拟面试</button>' +
          '<button type="button" class="btn btn-ghost" id="ivResetRec">清除面试练习记录</button>' +
        "</div>" +
      "</div>" +
      '<div class="card"><div class="card-head"><h3>🕑 最近模拟记录</h3></div>' + listHTML + "</div>";
  }

  /* ---------------- Tab：术语与句式 ---------------- */
  function renderVocab() {
    var body = $("#ivBody");
    if (!body) return;
    var v = D.vocab.map(function (w) {
      return '<div class="iv-vocab-row"><div class="iv-vocab-en">' + esc(w.en) +
        '<button type="button" class="iv-mini-say" data-say="' + esc(w.en) + '" title="朗读">🔊</button></div>' +
        '<div class="iv-vocab-zh">' + esc(w.zh) + '</div>' +
        '<div class="iv-vocab-ex">' + esc(w.ex) + "</div></div>";
    }).join("");
    var p = D.phrases.map(function (w) {
      return '<div class="iv-phrase-row"><div class="iv-phrase-en">' + esc(w.en) +
        '<button type="button" class="iv-mini-say" data-say="' + esc(w.en) + '" title="朗读">🔊</button></div>' +
        '<div class="iv-phrase-zh">' + esc(w.zh) + "</div></div>";
    }).join("");
    body.innerHTML =
      '<div class="card"><div class="card-head"><h3>📚 招生岗位高频术语</h3><span class="iv-hint-inline">点 🔊 跟读</span></div>' +
        '<div class="iv-vocab-grid">' + v + "</div></div>" +
      '<div class="card"><div class="card-head"><h3>💬 万能句式（可直接背）</h3><span class="iv-hint-inline">点 🔊 跟读</span></div>' +
        '<div class="iv-phrase-grid">' + p + "</div></div>";
  }

  /* ---------------- 练习面板 ---------------- */
  function practiceQuestion() {
    var pr = state.practice;
    if (!pr) return null;
    if (pr.kind === "single" || pr.kind === "mock") {
      var item = pr.list[pr.idx];
      return item;
    }
    return null;
  }

  function renderPractice() {
    var body = $("#ivBody");
    var pr = state.practice;
    if (!body || !pr) return;

    var head = "", question = "", hintLine = "", subLine = "", prog = "";

    if (pr.kind === "single" || pr.kind === "mock") {
      var item = pr.list[pr.idx];
      var cat = item.cat, q = item.q;
      prog = pr.kind === "mock"
        ? "模拟面试 " + (pr.idx + 1) + " / " + pr.list.length
        : (cat.icon + " " + cat.name);
      question = state.lang === "en" ? q.q : q.qzh;
      subLine = state.lang === "en" ? q.qzh : q.q;
      hintLine = q.hint;
      head = '<div class="iv-pr-head"><div><span class="iv-pr-prog">' + esc(prog) + '</span>' +
        '<span class="iv-pr-lang">' + langTag() + '</span></div>' +
        '<button type="button" class="btn btn-ghost btn-sm" id="ivExit">✕ 退出</button></div>';
    } else {
      var sc = findScenario(pr.scId);
      var turn = sc.turns[pr.idx];
      prog = sc.icon + " " + sc.title + " · 第 " + (pr.idx + 1) + " / " + sc.turns.length + " 轮";
      question = state.lang === "en" ? turn.en : turn.zh;
      subLine = state.lang === "en" ? turn.zh : turn.en;
      hintLine = turn.hint;
      head = '<div class="iv-pr-head"><div><span class="iv-pr-prog">' + esc(prog) + '</span>' +
        '<span class="iv-pr-lang">' + langTag() + '</span></div>' +
        '<button type="button" class="btn btn-ghost btn-sm" id="ivExit">✕ 退出</button></div>';
    }

    var qLabel = pr.kind === "single" || pr.kind === "mock"
      ? (state.lang === "en" ? "面试官提问" : "面试官提问（中文）")
      : (state.lang === "en" ? "对方说" : "对方说（中文）");

    body.innerHTML =
      '<div class="card iv-practice">' +
        head +
        '<div class="iv-q-block">' +
          '<div class="iv-q-label">' + esc(qLabel) + ' <button type="button" class="iv-mini-say" id="ivSayQ" title="朗读">🔊</button></div>' +
          '<p class="iv-q-main">' + esc(question) + "</p>" +
          '<p class="iv-q-sub">' + esc(subLine) + "</p>" +
        "</div>" +
        '<div class="iv-hint-box"><b>💡 作答提示</b><span>' + esc(hintLine) + "</span></div>" +
        '<div class="iv-answer">' +
          '<div class="iv-live" id="ivLive" hidden></div>' +
          '<div class="iv-input-row">' +
            '<button type="button" class="mic-btn" id="ivMic" title="点击开始语音作答">🎤</button>' +
            '<textarea id="ivText" rows="3" placeholder="' + (state.lang === "en" ? "用英文作答，或点 🎤 语音说…（建议 3–6 句）" : "用中文作答，或点 🎤 语音说…（建议 80–150 字）") + '"></textarea>' +
          "</div>" +
          '<div class="iv-actions">' +
            '<button type="button" class="btn btn-ghost btn-sm" id="ivShowRef">先看参考话术</button>' +
            '<button type="button" class="btn btn-primary" id="ivSubmit">提交作答</button>' +
          "</div>" +
        "</div>" +
        '<div class="iv-feedback" id="ivFeedback" hidden></div>' +
      "</div>";

    bindPractice();
    setTimeout(function () { speak(question, state.lang); }, 220);
  }

  function bindPractice() {
    var mic = $("#ivMic"); if (mic) mic.addEventListener("click", startRec);
    var sub = $("#ivSubmit"); if (sub) sub.addEventListener("click", submitAnswer);
    var ex = $("#ivExit"); if (ex) ex.addEventListener("click", function () { stopRec(); stopSpeak(); state.practice = null; render(); });
    var sq = $("#ivSayQ"); if (sq) sq.addEventListener("click", function () { speak(currentQuestionText(), state.lang); });
    var sr = $("#ivShowRef"); if (sr) sr.addEventListener("click", function () { revealReference(); });
    var tx = $("#ivText");
    if (tx) tx.addEventListener("keydown", function (ev) {
      if (ev.key === "Enter" && (ev.ctrlKey || ev.metaKey)) { ev.preventDefault(); submitAnswer(); }
    });
  }

  function currentQuestionText() {
    var pr = state.practice;
    if (!pr) return "";
    if (pr.kind === "single" || pr.kind === "mock") {
      var q = pr.list[pr.idx].q;
      return state.lang === "en" ? q.q : q.qzh;
    }
    var sc = findScenario(pr.scId);
    var t = sc.turns[pr.idx];
    return state.lang === "en" ? t.en : t.zh;
  }
  function currentKeys() {
    var pr = state.practice;
    if (!pr) return { keys: [], keysZh: [] };
    if (pr.kind === "single" || pr.kind === "mock") {
      var q = pr.list[pr.idx].q;
      return { keys: q.keys || [], keysZh: q.keysZh || [] };
    }
    var t = findScenario(pr.scId).turns[pr.idx];
    return { keys: t.keys || [], keysZh: t.keysZh || [] };
  }
  function currentReference() {
    var pr = state.practice;
    if (!pr) return { main: "", other: "" };
    var obj;
    if (pr.kind === "single" || pr.kind === "mock") obj = pr.list[pr.idx].q;
    else obj = findScenario(pr.scId).turns[pr.idx];
    var en = obj.answer || obj.sample || "";
    var zh = obj.answerZh || obj.sampleZh || "";
    return { en: en, zh: zh, main: state.lang === "en" ? en : zh, other: state.lang === "en" ? zh : en };
  }

  function submitAnswer() {
    var tx = $("#ivText");
    var text = (tx && tx.value || "").trim();
    if (!text) { toast("先说点什么或写点什么，再提交吧～"); return; }
    stopRec(); stopSpeak();
    var pr = state.practice;
    var ks = currentKeys();
    var res = analyzeAnswer(text, pr.lastMeta || { speech: false, conf: null, dur: null }, ks.keys, ks.keysZh);
    pr.lastMeta = null;
    pr.results = pr.results || [];
    pr.results.push({ text: text, res: res, qid: pr.qid() });
    pr.last = res;
    pr.lastText = text;
    renderFeedback(res, text);
  }

  function qidOf() {
    var pr = state.practice;
    if (!pr) return "";
    if (pr.kind === "single" || pr.kind === "mock") return pr.list[pr.idx].q.id;
    return "sc:" + pr.scId + ":" + pr.idx;
  }

  function titleOf() {
    var pr = state.practice;
    if (!pr) return "";
    if (pr.kind === "single") return pr.list[pr.idx].cat.icon + " " + pr.list[pr.idx].cat.name;
    if (pr.kind === "mock") return "🧪 全真模拟面试";
    return findScenario(pr.scId).icon + " " + findScenario(pr.scId).title;
  }

  function renderFeedback(res, text) {
    var fb = $("#ivFeedback");
    if (!fb) return;
    var ks = currentKeys();
    var keys = state.lang === "en" ? ks.keys : ks.keysZh;
    var dimNames = res.lang === "en"
      ? { grammar: "语法", coverage: "内容覆盖", flu: "流利度", pron: "发音" }
      : { coverage: "要点覆盖", structure: "结构完整", flu: "表达流畅" };
    var dimKeys = res.lang === "en" ? ["grammar", "coverage", "flu", "pron"] : ["coverage", "structure", "flu"];

    var bars = dimKeys.map(function (k) {
      var v = res.dims[k];
      return '<div class="dim-row"><span class="dim-name">' + dimNames[k] + (v == null ? "（未测）" : "") + "</span>" +
        '<div class="dim-bar"><div class="dim-fill" style="width:' + (v == null ? 0 : v) + "%;background:" + (v == null ? "#cbd5e1" : "#4f6df5") + '"></div></div>' +
        '<span class="dim-val">' + (v == null ? "--" : v) + "</span></div>";
    }).join("");

    var hitHTML = (res.hit || []).map(function (k) { return '<span class="iv-kw hit">✓ ' + esc(k) + "</span>"; }).join("");
    var missHTML = (res.miss || []).map(function (k) { return '<span class="iv-kw miss">+ ' + esc(k) + "</span>"; }).join("");

    var errHTML = "";
    if (res.lang === "en") {
      if (res.errors && res.errors.length) {
        errHTML = res.errors.map(function (e) {
          return '<div class="err-item"><div class="e-line"><s class="fix-orig">' + esc(e.text) + "</s>" +
            '<span class="fix-arrow">→</span><span class="fix-new">' + esc(e.fix) + "</span>" +
            '<span class="err-badge">' + esc(e.type) + "</span></div>" +
            '<div class="err-note">' + esc(e.note) + "</div></div>";
        }).join("");
      } else {
        errHTML = '<p class="empty-hint">🎉 没有发现明显语法错误，表达很稳！</p>';
      }
    } else {
      errHTML = '<p class="empty-hint">中文作答不跑英文语法纠错，重点看「要点覆盖」与「结构完整」。</p>';
    }

    var advices = [];
    if (res.lang === "en") {
      if (res.wc < 15) advices.push("回答偏短（" + res.wc + " 词）。面试官希望听到完整句和例子，建议展开到 3–6 句、30 词以上。");
      else if (res.wc > 90) advices.push("回答较长（" + res.wc + " 词）。面试中建议控制在 60–90 秒内，抓住重点。");
      if ((res.miss || []).length) advices.push("还有 " + res.miss.length + " 个得分点没提到：" + res.miss.slice(0, 4).join(" / ") + "，补上会更完整。");
      if ((res.errors || []).length) advices.push("先修正上面的语法问题，再复述一遍，印象分会明显提高。");
    } else {
      if (res.len < 60) advices.push("回答偏短（" + res.len + " 字）。建议补充一个具体做法或例子，讲到 80–150 字。");
      if ((res.miss || []).length) advices.push("以下要点还没覆盖：" + res.miss.slice(0, 4).join(" / ") + "。");
      advices.push("中文回答也建议按「结论 → 做法 → 例子」三段式，面试官更容易抓重点。");
    }

    var ref = currentReference();
    fb.hidden = false;
    fb.innerHTML =
      '<div class="iv-fb-top">' +
        '<div class="score-circle iv-score-circle" style="--p:' + res.overall + '"><b>' + res.overall + "</b><span>本题得分</span></div>" +
        '<div class="dims-wrap">' + bars + "</div>" +
      "</div>" +
      '<div class="iv-fb-block"><h4>🔑 得分点覆盖</h4><div class="iv-kw-wrap">' + (hitHTML + missHTML || '<span class="empty-hint">本题无关键词要求</span>') + "</div>" +
        '<p class="iv-kw-note">绿色为已覆盖，灰色为建议补充。</p></div>' +
      '<div class="iv-fb-block"><h4>✏️ 表达反馈</h4>' + errHTML +
        (advices.length ? '<ul class="iv-advice">' + advices.map(function (a) { return "<li>" + esc(a) + "</li>"; }).join("") + "</ul>" : "") +
      "</div>" +
      '<div class="iv-fb-block iv-ref-block"><h4>📄 参考话术（' + (state.lang === "en" ? "英文" : "中文") + '）' +
        '<button type="button" class="iv-mini-say" id="ivSayRef" title="朗读参考话术">🔊</button></h4>' +
        '<p class="iv-ref-main">' + esc(ref.main) + "</p>" +
        '<details class="iv-ref-other"><summary>查看另一种语言版本</summary><p>' + esc(ref.other) + "</p></details>" +
      "</div>" +
      '<div class="iv-fb-actions">' +
        '<button type="button" class="btn btn-ghost" id="ivRetry">↺ 再说一次</button>' +
        nextButtonHTML() +
      "</div>";

    var sr = $("#ivSayRef"); if (sr) sr.addEventListener("click", function () { speak(ref.main, state.lang); });
    var rt = $("#ivRetry"); if (rt) rt.addEventListener("click", function () {
      fb.hidden = true;
      var tx = $("#ivText"); if (tx) { tx.value = ""; tx.focus(); }
    });
    var nx = $("#ivNext");
    if (nx) nx.addEventListener("click", nextStep);

    saveRecord(res);
    renderStats();
    var live = $("#ivLive"); if (live) live.hidden = true;
    fb.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function nextButtonHTML() {
    var pr = state.practice;
    if (pr.kind === "single") return '<button type="button" class="btn btn-primary" id="ivNext">下一题 →</button>';
    if (pr.kind === "scenario") {
      var sc = findScenario(pr.scId);
      return pr.idx + 1 < sc.turns.length
        ? '<button type="button" class="btn btn-primary" id="ivNext">下一轮 →</button>'
        : '<button type="button" class="btn btn-primary" id="ivNext">完成情景 ✓</button>';
    }
    return pr.idx + 1 < pr.list.length
      ? '<button type="button" class="btn btn-primary" id="ivNext">下一题 →</button>'
      : '<button type="button" class="btn btn-primary" id="ivNext">结束并看总评 →</button>';
  }

  function saveRecord(res) {
    var pr = state.practice;
    if (!pr) return;
    var rec = {
      ts: Date.now(), mode: pr.kind, title: titleOf(), qid: qidOf(),
      lang: res.lang, overall: res.overall, dims: res.dims,
      hit: (res.hit || []).length, miss: (res.miss || []).length
    };
    records.push(rec);
    if (records.length > 200) records = records.slice(-200);
    saveRecords();
  }

  function revealReference() {
    var ref = currentReference();
    var fb = $("#ivFeedback");
    if (!fb) return;
    fb.hidden = false;
    fb.innerHTML = '<div class="iv-fb-block iv-ref-block"><h4>📄 参考话术（先看再答，效果更好）' +
      '<button type="button" class="iv-mini-say" id="ivSayRef2" title="朗读">🔊</button></h4>' +
      '<p class="iv-ref-main">' + esc(ref.main) + "</p>" +
      '<details class="iv-ref-other"><summary>查看另一种语言版本</summary><p>' + esc(ref.other) + "</p></details>" +
      '<p class="iv-kw-note">看过参考话术后，用自己的话说一遍——面试要的是自然表达，不是背稿。</p></div>';
    var s = $("#ivSayRef2"); if (s) s.addEventListener("click", function () { speak(ref.main, state.lang); });
  }

  function nextStep() {
    var pr = state.practice;
    if (!pr) { render(); return; }
    if (pr.kind === "single") {
      var list = pr.list;
      if (pr.idx + 1 < list.length) { pr.idx++; pr.results = []; renderPractice(); }
      else { state.practice = null; render(); toast("本组题目已练完，换一组继续吧！"); }
      return;
    }
    if (pr.kind === "scenario") {
      var sc = findScenario(pr.scId);
      if (pr.idx + 1 < sc.turns.length) { pr.idx++; renderPractice(); }
      else { state.practice = null; render(); toast("情景模拟完成！" + sc.title + " 已记录成绩。"); }
      return;
    }
    /* mock */
    if (pr.idx + 1 < pr.list.length) { pr.idx++; renderPractice(); }
    else { renderMockSummary(pr); }
  }

  /* ---------------- 模拟面试总评 ---------------- */
  function renderMockSummary(pr) {
    var body = $("#ivBody");
    var rs = pr.results || [];
    var overalls = rs.map(function (x) { return x.res.overall; });
    var avg = overalls.length ? Math.round(overalls.reduce(function (a, b) { return a + b; }, 0) / overalls.length) : 0;
    var dims = dimAvgOf(rs.map(function (x) { return { dims: x.res.dims }; }), state.lang === "en" ? ["grammar", "coverage", "flu", "pron"] : ["coverage", "structure", "flu"]);
    var dimNames = state.lang === "en"
      ? { grammar: "语法", coverage: "内容覆盖", flu: "流利度", pron: "发音" }
      : { coverage: "要点覆盖", structure: "结构完整", flu: "表达流畅" };

    var bars = Object.keys(dims).map(function (k) {
      var v = dims[k];
      return '<div class="dim-row"><span class="dim-name">' + dimNames[k] + "</span>" +
        '<div class="dim-bar"><div class="dim-fill" style="width:' + (v || 0) + "%;background:#4f6df5\"></div></div>" +
        '<span class="dim-val">' + (v == null ? "--" : v) + "</span></div>";
    }).join("");

    var weak = Object.keys(dims).filter(function (k) { return dims[k] != null; })
      .sort(function (a, b) { return dims[a] - dims[b]; }).slice(0, 2)
      .map(function (k) { return dimNames[k] + "（" + dims[k] + "）"; }).join("、");

    var review = rs.map(function (x, i) {
      var item = pr.list[i];
      var q = item.q;
      return '<div class="iv-review-item"><div class="iv-review-q"><b>Q' + (i + 1) + "</b>" + esc(state.lang === "en" ? q.q : q.qzh) +
        '<span class="iv-review-score">' + x.res.overall + "</span></div>" +
        '<p class="iv-review-a">' + esc(state.lang === "en" ? q.answer : q.answerZh) + "</p>" +
        ((x.res.miss || []).length ? '<p class="iv-review-miss">未覆盖：' + esc(x.res.miss.join(" / ")) + "</p>" : '<p class="iv-review-miss ok">要点全部覆盖 ✓</p>') +
        "</div>";
    }).join("");

    records.push({
      ts: Date.now(), mode: "mock", title: "🧪 全真模拟面试（总评）", qid: "mock-summary",
      lang: state.lang, overall: avg, dims: dims, hit: 0, miss: 0
    });
    saveRecords();

    body.innerHTML =
      '<div class="card iv-summary">' +
        '<h3>🧪 模拟面试总评</h3>' +
        '<div class="iv-fb-top">' +
          '<div class="score-circle iv-score-circle" style="--p:' + avg + '"><b>' + avg + "</b><span>综合得分</span></div>" +
          '<div class="dims-wrap">' + bars + "</div>" +
        "</div>" +
        '<div class="iv-sum-tips">' +
          "<p>📌 共完成 <b>" + rs.length + "</b> 题，语言：" + langTag() + "。</p>" +
          (weak ? "<p>⚠️ 相对薄弱：<b>" + esc(weak) + "</b>，建议针对这两项再练一轮。</p>" : "") +
          "<p>💡 建议把每题的参考答案改写成<b>你自己的版本</b>（换成真实经历与数字），面试时会自然得多。</p>" +
        "</div>" +
        '<div class="iv-fb-actions"><button type="button" class="btn btn-primary" id="ivMockAgain">↺ 再来一场</button>' +
        '<button type="button" class="btn btn-ghost" id="ivMockBack">返回题库</button></div>' +
      "</div>" +
      '<div class="card"><div class="card-head"><h3>📄 逐题回顾与参考答案</h3></div>' + review + "</div>";

    state.practice = null;
    var ag = $("#ivMockAgain");
    if (ag) ag.addEventListener("click", startMock);
    var bk = $("#ivMockBack");
    if (bk) bk.addEventListener("click", function () { state.tab = "bank"; render(); });
    renderStats();
  }

  /* ---------------- 启动练习 ---------------- */
  function startSingle(catId, qi) {
    var cat = findCat(catId);
    if (!cat) return;
    state.practice = {
      kind: "single",
      list: cat.questions.map(function (q, i) { return { cat: cat, q: q, idx: i }; }),
      idx: qi || 0,
      qid: function () { return this.list[this.idx].q.id; }
    };
    render();
  }

  function startScenario(id) {
    var sc = findScenario(id);
    if (!sc) return;
    state.practice = { kind: "scenario", scId: id, idx: 0, qid: function () { return "sc:" + this.scId + ":" + this.idx; } };
    render();
  }

  function startMock() {
    var picks = [];
    /* 自我介绍必考 */
    picks.push({ cat: D.categories[0], q: D.categories[0].questions[0], idx: 0 });
    var rest = [];
    D.categories.forEach(function (cat) {
      cat.questions.forEach(function (q, i) {
        if (cat.id === "intro" && i === 0) return;
        rest.push({ cat: cat, q: q, idx: i });
      });
    });
    /* 洗牌 */
    for (var i = rest.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = rest[i]; rest[i] = rest[j]; rest[j] = t;
    }
    /* 每个分类最多 1 题，凑够 6 题 */
    var usedCat = { intro: 1 };
    rest.forEach(function (item) {
      if (picks.length >= 6) return;
      if (usedCat[item.cat.id]) return;
      usedCat[item.cat.id] = 1;
      picks.push(item);
    });
    rest.forEach(function (item) {
      if (picks.length >= 6) return;
      if (picks.indexOf(item) < 0) picks.push(item);
    });
    state.practice = {
      kind: "mock", list: picks.slice(0, 6), idx: 0, results: [],
      qid: function () { return "mock:" + this.idx; }
    };
    render();
  }

  /* ---------------- 主渲染 ---------------- */
  function render() {
    renderPosition();
    renderStats();
    $$("#ivTabs .iv-tab").forEach(function (b) {
      b.classList.toggle("on", b.getAttribute("data-tab") === state.tab);
    });
    if (state.practice) { renderPractice(); return; }
    if (state.tab === "bank") renderBank();
    else if (state.tab === "scenario") renderScenarioList();
    else if (state.tab === "mock") renderMock();
    else renderVocab();
  }

  /* ---------------- 事件绑定（一次性） ---------------- */
  var bound = false;
  function bind() {
    if (bound) return;
    bound = true;

    var host = $("#view-interview");
    if (!host) return;

    host.addEventListener("click", function (ev) {
      var t = ev.target;
      var langBtn = t.closest ? t.closest(".iv-lang-btn") : null;
      if (langBtn) { setLang(langBtn.getAttribute("data-lang")); render(); return; }

      var tabBtn = t.closest ? t.closest("#ivTabs .iv-tab") : null;
      if (tabBtn) { stopSpeak(); stopRec(); state.practice = null; state.tab = tabBtn.getAttribute("data-tab"); render(); return; }

      var say = t.closest ? t.closest("[data-say]") : null;
      if (say) { speak(say.getAttribute("data-say"), "en"); return; }

      var catHead = t.closest ? t.closest(".iv-cat-head") : null;
      if (catHead) {
        var card = catHead.closest(".iv-cat-card");
        var id = card.getAttribute("data-cat");
        state.openCat = (state.openCat === id) ? null : id;
        renderBank();
        return;
      }

      var qItem = t.closest ? t.closest(".iv-q-item") : null;
      if (qItem) { startSingle(qItem.getAttribute("data-cat"), parseInt(qItem.getAttribute("data-qi"), 10) || 0); return; }

      var scBtn = t.closest ? t.closest("[data-start-sc]") : null;
      if (scBtn) { startScenario(scBtn.getAttribute("data-start-sc")); return; }

      var scCard = t.closest ? t.closest(".iv-sc-card") : null;
      if (scCard) { startScenario(scCard.getAttribute("data-sc")); return; }

      if (t.id === "ivStartMock") { startMock(); return; }

      if (t.id === "ivResetRec") {
        if (t._armed) {
          t._armed = false;
          records = []; saveRecords(); render();
          toast("面试练习记录已清除");
        } else {
          t._armed = true;
          t.textContent = "⚠ 再点一次确认清除";
          t.classList.add("btn-danger");
          setTimeout(function () { if (t._armed) { t._armed = false; t.textContent = "清除面试练习记录"; t.classList.remove("btn-danger"); } }, 4000);
        }
        return;
      }
    });
  }

  /* ---------------- 对外接口 ---------------- */
  window.DailyTalkInterview = {
    onShow: function () {
      bind();
      render();
    }
  };

  document.addEventListener("DOMContentLoaded", function () { bind(); });
  if (document.readyState !== "loading") { bind(); }
})();
