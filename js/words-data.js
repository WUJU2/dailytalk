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

  /* ---------- 4. 九年级牛津版（译林 9A/9B 课文词汇） ---------- */
  B.push({
    id: "oxford9",
    name: "九年级牛津版",
    icon: "📚",
    desc: "牛津译林版 9A/9B 课文核心词：性格、颜色、烦恼、成长、艺术、影视、侦探、机器人……",
    words: [
      /* 9A U1 Know yourself 性格与品质 */
      { w: "personality", zh: "性格；个性" }, { w: "energetic", zh: "精力充沛的" },
      { w: "creative", zh: "有创造力的" }, { w: "curious", zh: "好奇的" },
      { w: "modest", zh: "谦虚的" }, { w: "organized", zh: "做事有条理的" },
      { w: "patient", zh: "有耐心的" }, { w: "generous", zh: "慷慨的" },
      { w: "practical", zh: "务实的" }, { w: "imagine", zh: "想象" },
      { w: "praise", zh: "赞扬" }, { w: "sale", zh: "销售" },
      { w: "accountant", zh: "会计" }, { w: "engineer", zh: "工程师" },
      { w: "pioneer", zh: "开拓者；先锋" }, { w: "suit", zh: "适合" },
      /* 9A U2 Colour 颜色与情绪 */
      { w: "rainbow", zh: "彩虹" }, { w: "indigo", zh: "靛蓝色" },
      { w: "violet", zh: "紫罗兰色" }, { w: "mood", zh: "心情" },
      { w: "wisdom", zh: "智慧" }, { w: "jealous", zh: "嫉妒的" },
      { w: "stressed", zh: "紧张的；有压力的" }, { w: "relaxed", zh: "放松的" },
      { w: "peace", zh: "平静；安宁" }, { w: "purity", zh: "纯洁" },
      { w: "joy", zh: "欢乐" }, { w: "cheer", zh: "使振奋" },
      { w: "remind", zh: "提醒" }, { w: "influence", zh: "影响" },
      { w: "prefer", zh: "更喜欢" }, { w: "warmth", zh: "温暖" },
      /* 9A U3 Teenage problems 少年烦恼 */
      { w: "teenage", zh: "青少年的" }, { w: "exam", zh: "考试" },
      { w: "noise", zh: "噪音" }, { w: "friendship", zh: "友谊" },
      { w: "quarrel", zh: "争吵" }, { w: "suggestion", zh: "建议" },
      { w: "advice", zh: "忠告；建议" }, { w: "solve", zh: "解决" },
      { w: "doubt", zh: "怀疑" }, { w: "achieve", zh: "达到；实现" },
      { w: "balance", zh: "平衡" }, { w: "valuable", zh: "宝贵的" },
      { w: "strict", zh: "严格的" }, { w: "lonely", zh: "孤独的" },
      /* 9A U4 Growing up 成长 */
      { w: "courage", zh: "勇气" }, { w: "unusual", zh: "不寻常的" },
      { w: "research", zh: "研究；调查" }, { w: "university", zh: "大学" },
      { w: "graduation", zh: "毕业" }, { w: "ceremony", zh: "典礼" },
      { w: "survive", zh: "幸存；生存" }, { w: "attack", zh: "袭击" },
      { w: "cancer", zh: "癌症" }, { w: "drawback", zh: "缺点；不利因素" },
      { w: "disappear", zh: "消失" }, { w: "score", zh: "得分" },
      { w: "national", zh: "国家的；民族的" }, { w: "succeed", zh: "成功" },
      /* 9A U5 Art world 艺术世界 */
      { w: "art", zh: "艺术" }, { w: "music", zh: "音乐" },
      { w: "talent", zh: "天赋；才能" }, { w: "prize", zh: "奖品；奖项" },
      { w: "present", zh: "颁发；礼物" }, { w: "winner", zh: "获胜者" },
      { w: "composer", zh: "作曲家" }, { w: "melody", zh: "旋律" },
      { w: "rushing", zh: "急促的" }, { w: "flowing", zh: "流动的" },
      { w: "common", zh: "常见的；普通的" }, { w: "boundary", zh: "分界线；边界" },
      { w: "breath", zh: "呼吸" }, { w: "instrument", zh: "乐器" },
      { w: "award", zh: "奖；奖章" }, { w: "invite", zh: "邀请" },
      /* 9A U6 TV programmes 电视节目 */
      { w: "programme", zh: "节目" }, { w: "documentary", zh: "纪录片" },
      { w: "chat", zh: "聊天；访谈" }, { w: "drama", zh: "戏剧；剧" },
      { w: "live", zh: "现场直播的" }, { w: "studio", zh: "演播室" },
      { w: "announcement", zh: "通告；公告" }, { w: "murder", zh: "谋杀" },
      { w: "horror", zh: "恐怖" }, { w: "scene", zh: "场景；场面" },
      { w: "superb", zh: "极佳的" }, { w: "audience", zh: "观众" },
      { w: "society", zh: "社会" }, { w: "cover", zh: "报道；覆盖" },
      /* 9A U7 Films 电影 */
      { w: "actress", zh: "女演员" }, { w: "actor", zh: "男演员" },
      { w: "dancer", zh: "舞蹈演员" }, { w: "famous", zh: "著名的" },
      { w: "attract", zh: "吸引" }, { w: "charm", zh: "魅力" },
      { w: "angel", zh: "天使" }, { w: "playground", zh: "操场" },
      { w: "insist", zh: "坚持" }, { w: "afford", zh: "买得起；承担得起" },
      { w: "effort", zh: "努力" }, { w: "beyond", zh: "超出；越过" },
      { w: "lifetime", zh: "一生；终身" }, { w: "honour", zh: "荣誉；尊敬" },
      { w: "humanitarian", zh: "人道主义者" }, { w: "final", zh: "最后的" },
      /* 9A U8 Detective stories 侦探故事 */
      { w: "detective", zh: "侦探" }, { w: "witness", zh: "证人" },
      { w: "suspect", zh: "嫌疑人" }, { w: "guilty", zh: "有罪的" },
      { w: "crime", zh: "犯罪；罪行" }, { w: "clue", zh: "线索" },
      { w: "missing", zh: "失踪的" }, { w: "neighbourhood", zh: "街区；住宅区" },
      { w: "kidnap", zh: "绑架" }, { w: "theft", zh: "偷窃" },
      { w: "evidence", zh: "证据" }, { w: "arrest", zh: "逮捕" },
      { w: "fingerprint", zh: "指纹" }, { w: "scream", zh: "尖叫" },
      { w: "struggle", zh: "挣扎；搏斗" }, { w: "prison", zh: "监狱" },
      /* 9B U1 Asia 亚洲 */
      { w: "attract", zh: "吸引" }, { w: "attraction", zh: "吸引人的事物" },
      { w: "wing", zh: "翅膀" }, { w: "rooftop", zh: "屋顶" },
      { w: "drag", zh: "拖；拉" }, { w: "character", zh: "汉字；人物" },
      { w: "gathering", zh: "聚集；聚会" }, { w: "custom", zh: "习俗；风俗" },
      { w: "wonder", zh: "奇迹；惊奇" }, { w: "amazing", zh: "令人惊奇的" },
      { w: "channel", zh: "海峡；频道" }, { w: "location", zh: "位置" },
      { w: "dynasty", zh: "王朝；朝代" }, { w: "mountain", zh: "山" },
      /* 9B U2 Great people 伟人 */
      { w: "universe", zh: "宇宙" }, { w: "spacecraft", zh: "航天器；宇宙飞船" },
      { w: "orbit", zh: "轨道；绕轨道运行" }, { w: "land", zh: "着陆；陆地" },
      { w: "astronaut", zh: "宇航员" }, { w: "licence", zh: "执照；许可证" },
      { w: "selection", zh: "选拔" }, { w: "survivor", zh: "幸存者" },
      { w: "pride", zh: "自豪" }, { w: "achieve", zh: "实现；达到" },
      { w: "sacrifice", zh: "牺牲" }, { w: "quotation", zh: "引语；语录" },
      { w: "scientific", zh: "科学的" }, { w: "discover", zh: "发现" },
      /* 9B U3 Robots 机器人 */
      { w: "robot", zh: "机器人" }, { w: "iron", zh: "熨烫；熨斗" },
      { w: "smooth", zh: "平整的；光滑的" }, { w: "virus", zh: "病毒" },
      { w: "dustbin", zh: "垃圾桶" }, { w: "mess", zh: "混乱；脏乱" },
      { w: "battery", zh: "电池" }, { w: "charge", zh: "充电；收费" },
      { w: "customer", zh: "顾客" }, { w: "satisfy", zh: "使满意" },
      { w: "properly", zh: "正确地；适当地" }, { w: "invent", zh: "发明" },
      { w: "machine", zh: "机器" }, { w: "wheel", zh: "轮子" },
      /* 9B U4 Life on Mars 火星生活 */
      { w: "planet", zh: "行星" }, { w: "helmet", zh: "头盔" },
      { w: "gravity", zh: "重力" }, { w: "boots", zh: "靴子" },
      { w: "polluted", zh: "被污染的" }, { w: "oxygen", zh: "氧气" },
      { w: "float", zh: "漂浮" }, { w: "crowded", zh: "拥挤的" },
      { w: "interplanetary", zh: "行星间的" }, { w: "spacecraft", zh: "宇宙飞船" },
      { w: "solar", zh: "太阳的" }, { w: "glove", zh: "手套" },
      { w: "chemical", zh: "化学物质；化学的" }, { w: "development", zh: "发展" }
    ]
  });

  /* ---------- 5. 五年级人教版（PEP 五年级上册/下册） ---------- */
  B.push({
    id: "pep5",
    name: "五年级人教版",
    icon: "🎒",
    desc: "PEP 人教版五年级上下册单元词：外貌性格、一周生活、点餐、才艺、房间方位、自然公园、季节、月份、物主代词……",
    words: [
      /* 五上 U1 What's he like? 外貌与性格 */
      { w: "young", zh: "年轻的" }, { w: "funny", zh: "滑稽的；有趣的" },
      { w: "kind", zh: "亲切的；和蔼的" }, { w: "strict", zh: "严格的" },
      { w: "polite", zh: "有礼貌的" }, { w: "helpful", zh: "有帮助的" },
      { w: "clever", zh: "聪明的" }, { w: "shy", zh: "害羞的" },
      { w: "quiet", zh: "安静的" }, { w: "hardworking", zh: "勤奋的" },
      { w: "fun", zh: "有趣的" }, { w: "teacher", zh: "老师" },
      { w: "classmate", zh: "同班同学" }, { w: "principal", zh: "校长" },
      /* 五上 U2 My week 一周生活 */
      { w: "monday", zh: "星期一" }, { w: "tuesday", zh: "星期二" },
      { w: "wednesday", zh: "星期三" }, { w: "thursday", zh: "星期四" },
      { w: "friday", zh: "星期五" }, { w: "saturday", zh: "星期六" },
      { w: "sunday", zh: "星期日" }, { w: "week", zh: "星期；周" },
      { w: "weekend", zh: "周末" }, { w: "often", zh: "经常" },
      { w: "sometimes", zh: "有时" }, { w: "homework", zh: "家庭作业" },
      { w: "wash", zh: "洗" }, { w: "clothes", zh: "衣服" },
      { w: "watch", zh: "看；观看" }, { w: "cook", zh: "烹饪；做饭" },
      { w: "home", zh: "家" }, { w: "homework", zh: "作业" },
      /* 五上 U3 What would you like? 点餐 */
      { w: "sandwich", zh: "三明治" }, { w: "salad", zh: "沙拉" },
      { w: "hamburger", zh: "汉堡包" }, { w: "soup", zh: "汤" },
      { w: "tea", zh: "茶" }, { w: "fresh", zh: "新鲜的" },
      { w: "healthy", zh: "健康的" }, { w: "delicious", zh: "美味的" },
      { w: "sweet", zh: "甜的" }, { w: "sour", zh: "酸的" },
      { w: "hot", zh: "热的；辣的" }, { w: "cold", zh: "冷的" },
      { w: "sandwich", zh: "三明治" }, { w: "would", zh: "would like 想要" },
      { w: "drink", zh: "喝；饮料" }, { w: "eat", zh: "吃" },
      /* 五上 U4 What can you do? 才艺 */
      { w: "sing", zh: "唱歌" }, { w: "dance", zh: "跳舞" },
      { w: "swim", zh: "游泳" }, { w: "draw", zh: "画画" },
      { w: "cartoon", zh: "卡通；动画片" }, { w: "basketball", zh: "篮球" },
      { w: "pingpong", zh: "乒乓球" }, { w: "football", zh: "足球" },
      { w: "kungfu", zh: "功夫" }, { w: "speak", zh: "说；讲" },
      { w: "english", zh: "英语" }, { w: "chinese", zh: "汉语；中文" },
      { w: "club", zh: "俱乐部；社团" }, { w: "show", zh: "表演；展示" },
      /* 五上 U5 There is a big bed 房间与方位 */
      { w: "clock", zh: "时钟" }, { w: "plant", zh: "植物" },
      { w: "photo", zh: "照片" }, { w: "bike", zh: "自行车" },
      { w: "bottle", zh: "瓶子" }, { w: "water", zh: "水" },
      { w: "front", zh: "前面" }, { w: "behind", zh: "在…后面" },
      { w: "between", zh: "在…之间" }, { w: "above", zh: "在…上方" },
      { w: "beside", zh: "在…旁边" }, { w: "under", zh: "在…下面" },
      { w: "bedroom", zh: "卧室" }, { w: "house", zh: "房子" },
      { w: "there", zh: "那里；存在" }, { w: "room", zh: "房间" },
      /* 五上 U6 In a nature park 自然公园 */
      { w: "forest", zh: "森林" }, { w: "river", zh: "河流" },
      { w: "lake", zh: "湖泊" }, { w: "mountain", zh: "山" },
      { w: "hill", zh: "小山" }, { w: "tree", zh: "树" },
      { w: "flower", zh: "花" }, { w: "grass", zh: "草" },
      { w: "path", zh: "小路" }, { w: "sky", zh: "天空" },
      { w: "cloud", zh: "云" }, { w: "boat", zh: "小船" },
      { w: "bridge", zh: "桥" }, { w: "village", zh: "村庄" },
      { w: "building", zh: "建筑物" }, { w: "nature", zh: "自然" },
      /* 五下 U1 My day 日常作息 */
      { w: "exercise", zh: "锻炼；运动" }, { w: "breakfast", zh: "早餐" },
      { w: "usually", zh: "通常" }, { w: "when", zh: "什么时候" },
      { w: "morning", zh: "早晨" }, { w: "afternoon", zh: "下午" },
      { w: "evening", zh: "晚上" }, { w: "night", zh: "夜晚" },
      { w: "start", zh: "开始" }, { w: "finish", zh: "结束；完成" },
      { w: "why", zh: "为什么" }, { w: "because", zh: "因为" },
      { w: "shop", zh: "商店；购物" }, { w: "o'clock", zh: "…点钟" },
      /* 五下 U2 My favourite season 季节 */
      { w: "spring", zh: "春天" }, { w: "summer", zh: "夏天" },
      { w: "autumn", zh: "秋天" }, { w: "winter", zh: "冬天" },
      { w: "season", zh: "季节" }, { w: "favourite", zh: "最喜欢的" },
      { w: "snow", zh: "雪；下雪" }, { w: "wind", zh: "风" },
      { w: "kite", zh: "风筝" }, { w: "warm", zh: "温暖的" },
      { w: "cool", zh: "凉爽的" }, { w: "sunny", zh: "晴朗的" },
      { w: "rainy", zh: "下雨的" }, { w: "pick", zh: "采摘；挑选" },
      /* 五下 U3 My school calendar 月份与节日 */
      { w: "january", zh: "一月" }, { w: "february", zh: "二月" },
      { w: "march", zh: "三月" }, { w: "april", zh: "四月" },
      { w: "may", zh: "五月" }, { w: "june", zh: "六月" },
      { w: "july", zh: "七月" }, { w: "august", zh: "八月" },
      { w: "september", zh: "九月" }, { w: "october", zh: "十月" },
      { w: "november", zh: "十一月" }, { w: "december", zh: "十二月" },
      { w: "month", zh: "月份" }, { w: "calendar", zh: "日历" },
      { w: "holiday", zh: "假日；节日" }, { w: "christmas", zh: "圣诞节" },
      { w: "contest", zh: "比赛；竞赛" }, { w: "trip", zh: "旅行" },
      /* 五下 U4 When is the art show? 序数与日期 */
      { w: "first", zh: "第一" }, { w: "second", zh: "第二" },
      { w: "third", zh: "第三" }, { w: "fourth", zh: "第四" },
      { w: "fifth", zh: "第五" }, { w: "sixth", zh: "第六" },
      { w: "eighth", zh: "第八" }, { w: "ninth", zh: "第九" },
      { w: "twelfth", zh: "第十二" }, { w: "twentieth", zh: "第二十" },
      { w: "date", zh: "日期" }, { w: "birthday", zh: "生日" },
      { w: "party", zh: "聚会" }, { w: "invitation", zh: "邀请函" },
      /* 五下 U5 Whose dog is it? 物主代词与动物动作 */
      { w: "whose", zh: "谁的" }, { w: "mine", zh: "我的" },
      { w: "yours", zh: "你的" }, { w: "hers", zh: "她的" },
      { w: "his", zh: "他的" }, { w: "theirs", zh: "他们的" },
      { w: "ours", zh: "我们的" }, { w: "tail", zh: "尾巴" },
      { w: "jump", zh: "跳" }, { w: "climb", zh: "爬" },
      { w: "sleep", zh: "睡觉" }, { w: "chase", zh: "追赶" },
      /* 五下 U6 Work quietly! 行为规范 */
      { w: "quietly", zh: "安静地" }, { w: "loudly", zh: "大声地" },
      { w: "keep", zh: "保持" }, { w: "talk", zh: "说话；交谈" },
      { w: "walk", zh: "走；散步" }, { w: "listen", zh: "听" },
      { w: "write", zh: "写" }, { w: "clean", zh: "打扫；干净的" },
      { w: "rule", zh: "规则" }, { w: "wait", zh: "等待" },
      { w: "turn", zh: "轮流；转弯" }, { w: "sorry", zh: "抱歉的" }
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
