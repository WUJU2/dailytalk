/* =========================================================
 * DailyTalk · 单词大炮 词库
 * 结构：window.DailyTalkWords = { books: [...] }
 * 每本词书：{ id, name, icon, desc, words: [{ w: 单词, zh: 中文释义 }] }
 * ========================================================= */
(function () {
  "use strict";

  var B = [];

  /* ---------- 1. 日常生活高频词 ---------- */
  B.push({
    id: "daily",
    name: "日常生活",
    icon: "☕",
    desc: "咖啡店、餐厅、购物、出行、天气……外教场景里出现最多的词",
    words: [
      { w: "breakfast", zh: "早餐" }, { w: "lunch", zh: "午餐" }, { w: "dinner", zh: "晚餐" },
      { w: "coffee", zh: "咖啡" }, { w: "latte", zh: "拿铁" }, { w: "sugar", zh: "糖" },
      { w: "milk", zh: "牛奶" }, { w: "water", zh: "水" }, { w: "juice", zh: "果汁" },
      { w: "bread", zh: "面包" }, { w: "cheese", zh: "奶酪" }, { w: "chicken", zh: "鸡肉" },
      { w: "noodle", zh: "面条" }, { w: "rice", zh: "米饭" }, { w: "salad", zh: "沙拉" },
      { w: "soup", zh: "汤" }, { w: "dessert", zh: "甜点" }, { w: "menu", zh: "菜单" },
      { w: "order", zh: "点单；订购" }, { w: "bill", zh: "账单" }, { w: "tip", zh: "小费" },
      { w: "delicious", zh: "美味的" }, { w: "hungry", zh: "饥饿的" }, { w: "thirsty", zh: "口渴的" },
      { w: "weather", zh: "天气" }, { w: "sunny", zh: "晴朗的" }, { w: "rainy", zh: "下雨的" },
      { w: "cloudy", zh: "多云的" }, { w: "windy", zh: "有风的" }, { w: "temperature", zh: "气温" },
      { w: "umbrella", zh: "雨伞" }, { w: "jacket", zh: "夹克" }, { w: "sweater", zh: "毛衣" },
      { w: "shoes", zh: "鞋子" }, { w: "shirt", zh: "衬衫" }, { w: "pants", zh: "裤子" },
      { w: "hat", zh: "帽子" }, { w: "size", zh: "尺码" }, { w: "price", zh: "价格" },
      { w: "cheap", zh: "便宜的" }, { w: "expensive", zh: "昂贵的" }, { w: "discount", zh: "折扣" },
      { w: "market", zh: "市场" }, { w: "supermarket", zh: "超市" }, { w: "pharmacy", zh: "药店" },
      { w: "hospital", zh: "医院" }, { w: "doctor", zh: "医生" }, { w: "nurse", zh: "护士" },
      { w: "medicine", zh: "药" }, { w: "headache", zh: "头痛" }, { w: "fever", zh: "发烧" },
      { w: "airport", zh: "机场" }, { w: "station", zh: "车站" }, { w: "ticket", zh: "票" },
      { w: "luggage", zh: "行李" }, { w: "passport", zh: "护照" }, { w: "flight", zh: "航班" },
      { w: "hotel", zh: "酒店" }, { w: "reservation", zh: "预订" }, { w: "checkin", zh: "入住登记" },
      { w: "subway", zh: "地铁" }, { w: "taxi", zh: "出租车" }, { w: "bus", zh: "公共汽车" },
      { w: "street", zh: "街道" }, { w: "corner", zh: "拐角" }, { w: "traffic", zh: "交通" },
      { w: "map", zh: "地图" }, { w: "left", zh: "左边的" }, { w: "right", zh: "右边的" },
      { w: "north", zh: "北方" }, { w: "south", zh: "南方" }, { w: "east", zh: "东方" },
      { w: "west", zh: "西方" }, { w: "neighbor", zh: "邻居" }, { w: "family", zh: "家庭" },
      { w: "friend", zh: "朋友" }, { w: "weekend", zh: "周末" }, { w: "holiday", zh: "假期" },
      { w: "birthday", zh: "生日" }, { w: "party", zh: "聚会" }, { w: "movie", zh: "电影" },
      { w: "music", zh: "音乐" }, { w: "photo", zh: "照片" }, { w: "travel", zh: "旅行" },
      { w: "hobby", zh: "爱好" }, { w: "sport", zh: "运动" }, { w: "running", zh: "跑步" },
      { w: "swimming", zh: "游泳" }, { w: "garden", zh: "花园" }, { w: "kitchen", zh: "厨房" },
      { w: "bedroom", zh: "卧室" }, { w: "window", zh: "窗户" }, { w: "morning", zh: "早晨" },
      { w: "afternoon", zh: "下午" }, { w: "evening", zh: "晚上" }, { w: "midnight", zh: "午夜" },
      { w: "today", zh: "今天" }, { w: "tomorrow", zh: "明天" }, { w: "yesterday", zh: "昨天" },
      { w: "always", zh: "总是" }, { w: "usually", zh: "通常" }, { w: "never", zh: "从不" }
    ]
  });

  /* ---------- 2. 职场与面试词汇 ---------- */
  B.push({
    id: "career",
    name: "职场面试",
    icon: "💼",
    desc: "面试、行政、招生录取高频词——求职季冲刺必备",
    words: [
      { w: "interview", zh: "面试" }, { w: "resume", zh: "简历" }, { w: "candidate", zh: "候选人" },
      { w: "position", zh: "职位" }, { w: "salary", zh: "薪资" }, { w: "benefit", zh: "福利" },
      { w: "contract", zh: "合同" }, { w: "promotion", zh: "晋升" }, { w: "colleague", zh: "同事" },
      { w: "manager", zh: "经理" }, { w: "department", zh: "部门" }, { w: "company", zh: "公司" },
      { w: "office", zh: "办公室" }, { w: "meeting", zh: "会议" }, { w: "deadline", zh: "截止日期" },
      { w: "schedule", zh: "日程安排" }, { w: "overtime", zh: "加班" }, { w: "duty", zh: "职责" },
      { w: "task", zh: "任务" }, { w: "project", zh: "项目" }, { w: "report", zh: "报告" },
      { w: "email", zh: "电子邮件" }, { w: "document", zh: "文件" }, { w: "photocopy", zh: "复印件" },
      { w: "printer", zh: "打印机" }, { w: "stationery", zh: "文具" }, { w: "calendar", zh: "日历" },
      { w: "reception", zh: "接待处" }, { w: "receptionist", zh: "前台接待员" }, { w: "visitor", zh: "访客" },
      { w: "appointment", zh: "预约" }, { w: "agenda", zh: "议程" }, { w: "minutes", zh: "会议记录" },
      { w: "coordinate", zh: "协调" }, { w: "organize", zh: "组织" }, { w: "arrange", zh: "安排" },
      { w: "communicate", zh: "沟通" }, { w: "cooperate", zh: "合作" }, { w: "teamwork", zh: "团队合作" },
      { w: "responsible", zh: "负责的" }, { w: "reliable", zh: "可靠的" }, { w: "punctual", zh: "守时的" },
      { w: "efficient", zh: "高效的" }, { w: "careful", zh: "细心的" }, { w: "patient", zh: "有耐心的" },
      { w: "flexible", zh: "灵活的" }, { w: "experience", zh: "经验" }, { w: "skill", zh: "技能" },
      { w: "strength", zh: "优势" }, { w: "weakness", zh: "不足" }, { w: "achievement", zh: "成就" },
      { w: "goal", zh: "目标" }, { w: "plan", zh: "计划" }, { w: "challenge", zh: "挑战" },
      { w: "pressure", zh: "压力" }, { w: "confidence", zh: "自信" }, { w: "attitude", zh: "态度" },
      { w: "admission", zh: "录取；入学" }, { w: "admissions", zh: "招生办公室" }, { w: "apply", zh: "申请" },
      { w: "applicant", zh: "申请人" }, { w: "application", zh: "申请表" }, { w: "enroll", zh: "注册入学" },
      { w: "enrollment", zh: "注册人数" }, { w: "campus", zh: "校园" }, { w: "campus tour", zh: "校园参观" },
      { w: "tuition", zh: "学费" }, { w: "scholarship", zh: "奖学金" }, { w: "brochure", zh: "宣传册" },
      { w: "recruit", zh: "招收" }, { w: "recruitment", zh: "招生；招聘" }, { w: "open day", zh: "开放日" },
      { w: "hotline", zh: "热线电话" }, { w: "inquiry", zh: "咨询" }, { w: "enquiry", zh: "询问" },
      { w: "deadline", zh: "截止日期" }, { w: "requirements", zh: "申请要求" }, { w: "transcript", zh: "成绩单" },
      { w: "certificate", zh: "证书" }, { w: "recommendation", zh: "推荐信" }, { w: "waitlist", zh: "候补名单" },
      { w: "offer", zh: "录取通知" }, { w: "orientation", zh: "入学新生培训" }, { w: "semester", zh: "学期" },
      { w: "term", zh: "学期；术语" }, { w: "principal", zh: "校长" }, { w: "faculty", zh: "全体教员" },
      { w: "staff", zh: "员工" }, { w: "confidential", zh: "保密的" }, { w: "privacy", zh: "隐私" },
      { w: "database", zh: "数据库" }, { w: "platform", zh: "平台" }, { w: "update", zh: "更新" },
      { w: "maintenance", zh: "维护" }, { w: "accurate", zh: "准确的" }, { w: "detail", zh: "细节" },
      { w: "bilingual", zh: "双语的" }, { w: "fluent", zh: "流利的" }, { w: "interpreter", zh: "口译员" },
      { w: "translate", zh: "翻译" }, { w: "abroad", zh: "国外" }, { w: "visa", zh: "签证" },
      { w: "embassy", zh: "大使馆" }, { w: "itinerary", zh: "行程安排" }, { w: "agenda", zh: "议程" },
      { w: "reception desk", zh: "接待前台" }, { w: "business trip", zh: "出差" }
    ]
  });

  /* ---------- 3. 进阶挑战 ---------- */
  B.push({
    id: "advanced",
    name: "进阶挑战",
    icon: "🔥",
    desc: "更长更难的高阶词汇——敢来试试手速和拼写吗？",
    words: [
      { w: "achievement", zh: "成就" }, { w: "environment", zh: "环境" }, { w: "government", zh: "政府" },
      { w: "development", zh: "发展" }, { w: "technology", zh: "技术" }, { w: "society", zh: "社会" },
      { w: "culture", zh: "文化" }, { w: "tradition", zh: "传统" }, { w: "education", zh: "教育" },
      { w: "knowledge", zh: "知识" }, { w: "university", zh: "大学" }, { w: "library", zh: "图书馆" },
      { w: "laboratory", zh: "实验室" }, { w: "experiment", zh: "实验" }, { w: "research", zh: "研究" },
      { w: "analysis", zh: "分析" }, { w: "strategy", zh: "策略" }, { w: "solution", zh: "解决方案" },
      { w: "problem", zh: "问题" }, { w: "question", zh: "提问" }, { w: "answer", zh: "回答" },
      { w: "opinion", zh: "观点" }, { w: "suggestion", zh: "建议" }, { w: "decision", zh: "决定" },
      { w: "important", zh: "重要的" }, { w: "necessary", zh: "必要的" }, { w: "possible", zh: "可能的" },
      { w: "impossible", zh: "不可能的" }, { w: "difficult", zh: "困难的" }, { w: "comfortable", zh: "舒适的" },
      { w: "excellent", zh: "优秀的" }, { w: "perfect", zh: "完美的" }, { w: "wonderful", zh: "精彩的" },
      { w: "beautiful", zh: "美丽的" }, { w: "dangerous", zh: "危险的" }, { w: "popular", zh: "受欢迎的" },
      { w: "famous", zh: "著名的" }, { w: "special", zh: "特别的" }, { w: "professional", zh: "专业的" },
      { w: "successful", zh: "成功的" }, { w: "wonderfully", zh: "精彩地" }, { w: "immediately", zh: "立即" },
      { w: "especially", zh: "尤其" }, { w: "generally", zh: "通常" }, { w: "probably", zh: "大概" },
      { w: "attention", zh: "注意" }, { w: "celebration", zh: "庆祝" }, { w: "conversation", zh: "对话" },
      { w: "discussion", zh: "讨论" }, { w: "expression", zh: "表达" }, { w: "pronunciation", zh: "发音" },
      { w: "grammar", zh: "语法" }, { w: "vocabulary", zh: "词汇" }, { w: "practice", zh: "练习" },
      { w: "improve", zh: "提高" }, { w: "progress", zh: "进步" }, { w: "achievement", zh: "成就" },
      { w: "opportunity", zh: "机会" }, { w: "experience", zh: "经验" }, { w: "international", zh: "国际的" },
      { w: "national", zh: "国家的" }, { w: "personal", zh: "个人的" }, { w: "traditional", zh: "传统的" },
      { w: "natural", zh: "自然的" }, { w: "medical", zh: "医学的" }, { w: "physical", zh: "身体的" },
      { w: "digital", zh: "数字的" }, { w: "global", zh: "全球的" }, { w: "local", zh: "当地的" },
      { w: "history", zh: "历史" }, { w: "future", zh: "未来" }, { w: "present", zh: "现在；礼物" },
      { w: "moment", zh: "时刻" }, { w: "memory", zh: "记忆" }, { w: "dream", zh: "梦想" },
      { w: "imagine", zh: "想象" }, { w: "believe", zh: "相信" }, { w: "understand", zh: "理解" },
      { w: "remember", zh: "记住" }, { w: "forget", zh: "忘记" }, { w: "explain", zh: "解释" },
      { w: "describe", zh: "描述" }, { w: "discover", zh: "发现" }, { w: "invent", zh: "发明" },
      { w: "create", zh: "创造" }, { w: "build", zh: "建造" }, { w: "destroy", zh: "破坏" },
      { w: "protect", zh: "保护" }, { w: "support", zh: "支持" }, { w: "encourage", zh: "鼓励" },
      { w: "succeed", zh: "成功" }, { w: "failure", zh: "失败" }, { w: "effort", zh: "努力" },
      { w: "energy", zh: "能量" }, { w: "power", zh: "力量" }, { w: "strength", zh: "力量；优势" }
    ]
  });

  /* 去重 & 清洗：小写、只留 a-z 与空格 */
  B.forEach(function (book) {
    var seen = {};
    book.words = book.words.filter(function (it) {
      var w = String(it.w || "").toLowerCase().trim().replace(/[^a-z ]/g, "");
      if (!w || w.length < 3 || seen[w]) return false;
      seen[w] = 1;
      it.w = w;
      return true;
    });
  });

  window.DailyTalkWords = { books: B };
})();
