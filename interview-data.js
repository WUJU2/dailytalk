/* =========================================================
 * DailyTalk · 面试特训数据
 * 目标岗位：国际学校 本科招生行政岗
 * 职责：招生宣传与录取协助 / 境内外来访接待 / 招生热线答疑 / 平台信息维护
 * 素质：抗压（招生季高强度、高频出差加班）/ 团队协作 / 保密意识
 * 全部题目与参考答案均为中英双语
 * ========================================================= */
(function () {
  "use strict";

  /* ---------------- 岗位情报 ---------------- */
  var POSITION = {
    title: "国际学校 · 本科招生行政岗",
    titleEn: "Administrative Officer, Undergraduate Admissions",
    summary: "面试官关注三件事：① 双语能否真的「流利对答」（不是背稿）；② 是否懂招生流程与接待规范；③ 抗压、协作、保密是否可靠。",
    duties: [
      { icon: "📣", text: "协助本科招生宣传与录取" },
      { icon: "🤝", text: "境内外来访接待" },
      { icon: "☎️", text: "招生热线答疑" },
      { icon: "💻", text: "平台信息维护" }
    ],
    qualities: [
      { icon: "🔥", text: "适应招生季高强度、高频出差加班" },
      { icon: "👥", text: "团队协作" },
      { icon: "🔒", text: "保密意识" }
    ]
  };

  /* ---------------- 分类题库 ---------------- */
  var CATEGORIES = [
    /* ========== 1. 自我介绍与动机 ========== */
    {
      id: "intro", icon: "🙋", name: "自我介绍与求职动机", nameEn: "Self-introduction & Motivation",
      desc: "开场 3 分钟定印象，重点展示「双语 + 行政经验 + 对岗位的理解」。",
      questions: [
        {
          id: "intro-1",
          q: "Please introduce yourself, and tell us why you are interested in this administrative position at our international school.",
          qzh: "请做一下自我介绍，并说明你为什么对我们国际学校的行政岗位感兴趣。",
          hint: "结构：姓名与背景 → 相关经验（1–2 个亮点）→ 为什么这所学校/这个岗位 → 我能带来什么。控制在 60–90 秒。",
          keys: ["introduce", "experience", "admissions", "bilingual", "international school", "detail", "team"],
          keysZh: ["自我介绍", "学历或专业", "行政或招生经验", "中英文沟通", "细致", "团队"],
          answer: "Good morning. My name is Li Hua, and I majored in English. For the past two years I have worked as an administrative assistant in an education agency, where I handled student enquiries, prepared application documents and supported campus events. I am comfortable communicating in both English and Chinese, and I enjoy working with people from different cultures. I am applying because I want to help students and families go through the admissions process smoothly, and I believe my bilingual skills and attention to detail can support your team during the busy season.",
          answerZh: "早上好，我叫李华，英语专业。过去两年我在一家教育机构担任行政助理，负责学生咨询、申请材料准备和校园活动支持。我中英文沟通都比较流利，也喜欢和不同文化背景的人打交道。我应聘这个岗位，是希望帮助更多学生和家庭顺利完成申请流程，也相信自己双语的能力和细致的习惯能在招生旺季帮上团队。"
        },
        {
          id: "intro-2",
          q: "What do you know about our school, and why do you want to work here?",
          qzh: "你对我们学校了解多少？为什么想来这里工作？",
          hint: "一定要做功课：课程体系（IB / A-Level / AP）、办学理念、学生构成、国际化氛围。空话会立刻暴露准备不足。",
          keys: ["curriculum", "IB", "international", "students", "values", "reputation", "grow"],
          keysZh: ["课程体系", "IB", "国际化", "学生构成", "办学理念", "口碑", "成长"],
          answer: "I learned that your school offers the IB Diploma Programme and has students from more than twenty countries. I am impressed by your emphasis on whole-person education and by how much support you give students in their university applications. What attracts me most is the chance to work in a truly international environment, where I can use both English and Chinese every day and grow with a professional admissions team.",
          answerZh: "我了解到贵校开设 IB 课程，学生来自二十多个国家，非常重视全人教育，在升学指导方面也投入很多。最吸引我的是能在真正国际化的环境里工作——每天都能用到中英文，并且和专业的招生团队一起成长。"
        },
        {
          id: "intro-3",
          q: "What are your strengths and weaknesses for this role?",
          qzh: "针对这个岗位，你的优势和不足分别是什么？",
          hint: "优势要贴合岗位（沟通、细致、抗压、双语）；短板必须真实，并说明你正在如何改进。",
          keys: ["communication", "organized", "detail", "pressure", "multitask", "improve", "checklist"],
          keysZh: ["沟通", "有条理", "细致", "抗压", "多任务", "改进", "清单"],
          answer: "My strengths are communication and organisation. I am used to handling many enquiries at the same time, and I keep careful records so nothing is missed. My weakness is that I sometimes spend too long on small details. I am learning to set priorities and use checklists, so that I can keep both speed and accuracy during the peak season.",
          answerZh: "我的优势是沟通和组织能力：我习惯同时处理大量咨询，并做好记录、不遗漏。我的不足是有时会在细节上花太多时间。我正在学习设定优先级、用清单管理任务，好在旺季兼顾速度和准确度。"
        }
      ]
    },

    /* ========== 2. 招生宣传与录取 ========== */
    {
      id: "promo", icon: "📣", name: "招生宣传与录取", nameEn: "Recruitment & Admissions",
      desc: "对应职责「协助本科招生宣传与录取」，重点考渠道、物料、跟进与流程准确性。",
      questions: [
        {
          id: "promo-1",
          q: "How would you support our undergraduate recruitment and marketing activities?",
          qzh: "你会如何协助学校的招生宣传与市场推广工作？",
          hint: "线上（官网、公众号、社交媒体）+ 线下（宣讲会、开放日）+ 物料准备 + 咨询跟进与数据记录。",
          keys: ["marketing", "campaign", "info session", "open day", "materials", "follow up", "system"],
          keysZh: ["宣传", "推广渠道", "宣讲会", "开放日", "物料", "跟进", "系统记录"],
          answer: "I would help prepare marketing materials, support online and offline campaigns such as info sessions and open days, and follow up with prospective students and parents in a timely way. I would also keep track of every enquiry in the system, so that the team can see which channels bring the best applicants and adjust the plan accordingly.",
          answerZh: "我会协助准备宣传物料，支持宣讲会、开放日等线上线下活动，并及时跟进意向学生和家长；同时把每条咨询记录进系统，让团队看清哪些渠道带来的生源质量最好，据此调整宣传计划。"
        },
        {
          id: "promo-2",
          q: "A prospective student asks why they should choose our school. How would you answer?",
          qzh: "如果一位意向学生问你「为什么应该选择我们学校」，你会怎么回答？",
          hint: "先了解对方需求，再有针对性地讲课程、师资、升学成果与校园氛围；最后邀请来访。避免空泛宣传。",
          keys: ["interests", "goals", "curriculum", "faculty", "university offers", "campus visit", "fit"],
          keysZh: ["了解需求", "目标", "课程", "师资", "升学成果", "来校参观", "匹配"],
          answer: "I would first ask about their interests and goals, and then explain how our programme fits them — for example the curriculum, our teachers' experience and our graduates' university offers. I would also invite them to visit the campus, because seeing the environment in person is often the most convincing part.",
          answerZh: "我会先了解学生的兴趣和目标，再有针对性地介绍课程体系、师资背景和升学成果。同时邀请他们来校参观——实地感受校园氛围往往是最有说服力的一环。"
        },
        {
          id: "promo-3",
          q: "During the admissions process, how do you make sure applications are handled accurately and on time?",
          qzh: "在录取流程中，你如何保证申请材料处理得准确又及时？",
          hint: "流程化思维：材料清单 → 系统录入 → 截止提醒 → 双人复核 → 及时反馈。",
          keys: ["checklist", "deadline", "verify", "documents", "system", "reminder", "accuracy"],
          keysZh: ["清单", "截止日期", "核对", "材料", "系统", "提醒", "准确性"],
          answer: "I would use a checklist for each application, record every submission in the system the same day, and set reminders for the key deadlines. Before anything is passed on for review, I would double-check the documents and the key information, because accuracy matters most in admissions.",
          answerZh: "我会为每份申请建立清单，当天把提交情况录入系统，并为关键截止日期设置提醒。材料移交审核之前，我会再核对一遍文件与关键信息——招生工作里准确性是第一位的。"
        }
      ]
    },

    /* ========== 3. 境内外来访接待 ========== */
    {
      id: "reception", icon: "🤝", name: "境内外来访接待", nameEn: "Visitor Reception",
      desc: "对应职责「境内外来访接待」，考流程感、临场应变与跨文化礼仪。",
      questions: [
        {
          id: "rec-1",
          q: "How would you receive an overseas visitor who comes to our campus?",
          qzh: "有一位境外来宾到校访问，你会如何接待？",
          hint: "提前确认行程与需求 → 迎接问候 → 介绍安排 → 陪同参观（必要时翻译）→ 送别与后续跟进。",
          keys: ["itinerary", "welcome", "schedule", "campus tour", "interpret", "follow up", "arrange"],
          keysZh: ["提前确认行程", "迎接问候", "介绍安排", "陪同参观", "翻译", "后续跟进"],
          answer: "First I would confirm the itinerary and any special needs in advance. On the day, I would greet them at the entrance, introduce the schedule, and accompany them on the campus tour, offering interpretation when needed. After the visit, I would send a thank-you email and follow up on any requests they raised.",
          answerZh: "我会提前确认来宾的行程和特殊需求；当天到门口迎接、介绍整体安排、陪同参观并在需要时提供翻译；访问结束后发送感谢邮件，并跟进他们提出的未尽事项。"
        },
        {
          id: "rec-2",
          q: "A parent arrives without an appointment and insists on meeting the principal. What do you do?",
          qzh: "一位家长没有预约就来了，坚持要见校长，你怎么处理？",
          hint: "礼貌安抚 → 说明流程与日程 → 提供可行方案（预约最近时间 / 记录转达）→ 承诺反馈时间。切忌生硬拒绝。",
          keys: ["polite", "appointment", "explain", "listen", "notes", "follow up", "arrange"],
          keysZh: ["礼貌接待", "预约", "说明", "倾听", "记录", "跟进", "安排"],
          answer: "I would welcome them politely, explain that the principal's schedule is fully booked, and offer to arrange an appointment for the earliest possible time. Meanwhile I would listen to their concern, take notes and pass the message on, so that they feel heard and know exactly when they will hear back from us.",
          answerZh: "我会礼貌接待，说明校长日程已排满，同时主动帮他们预约最近可安排的时间；过程中认真倾听诉求、做好记录并转达，让家长感到被重视，也清楚什么时候能得到回复。"
        },
        {
          id: "rec-3",
          q: "What would you prepare before hosting a group of visiting teachers from abroad?",
          qzh: "在接待一批境外来访教师之前，你会做哪些准备？",
          hint: "名单、行程、会议室与设备、展示材料、翻译、茶歇、交通、应急联系人。",
          keys: ["guest list", "schedule", "meeting room", "materials", "interpretation", "refreshments", "contact"],
          keysZh: ["来宾名单", "日程", "会议室", "展示材料", "翻译", "茶歇", "应急联系人"],
          answer: "I would prepare the guest list and a detailed schedule, book the meeting room and check the equipment, and get the presentation materials ready. I would also arrange interpretation if needed, and confirm refreshments, transportation and an emergency contact, so that the whole visit runs smoothly.",
          answerZh: "我会准备来宾名单和详细日程，预定会议室并检查设备，准备好展示材料；需要时安排翻译，并确认茶歇、交通和应急联系人，确保整场接待顺畅。"
        }
      ]
    },

    /* ========== 4. 招生热线答疑 ========== */
    {
      id: "hotline", icon: "☎️", name: "招生热线答疑", nameEn: "Admissions Hotline",
      desc: "对应职责「招生热线答疑」，考口径准确性、情绪安抚与信息记录。",
      questions: [
        {
          id: "hot-1",
          q: "A parent calls to ask about tuition fees and scholarships. How do you handle the call?",
          qzh: "家长来电咨询学费和奖学金，你会怎么处理这通电话？",
          hint: "问候 → 确认需求 → 按官方口径答复；不确定的绝不猜，核实后回电 → 记录 → 当天跟进。",
          keys: ["tuition", "scholarship", "policy", "confirm", "accurate", "record", "call back"],
          keysZh: ["学费", "奖学金", "政策口径", "核实", "准确", "记录", "回电"],
          answer: "I would greet the caller warmly, listen carefully, and give the official figures and scholarship policy. If I am not sure about a detail, I would say that I will check with the admissions office and call back, rather than giving a guess. Then I would note their name and number and follow up the same day.",
          answerZh: "我会先问候，听完问题后按学校官方口径说明学费与奖学金政策。不确定的细节绝不猜测，而是说明会与招生办核实后回电；同时记录对方姓名和电话，当天完成跟进。"
        },
        {
          id: "hot-2",
          q: "The caller is angry because they have not received a reply for two weeks. What do you say?",
          qzh: "来电家长因为两周没收到回复很生气，你会怎么说？",
          hint: "先道歉共情，不辩解 → 立即查证 → 给出明确时间节点 → 主动同步进展。",
          keys: ["apologize", "sorry", "patience", "check", "timeline", "update", "assure"],
          keysZh: ["道歉", "抱歉", "耐心", "核查", "时间节点", "同步进展", "安心"],
          answer: "I would apologise sincerely for the delay, thank them for their patience, and check the status of their application right away. Then I would give them a clear timeline and my name, and promise to update them even if the answer is not final yet, so that they know the case is being handled.",
          answerZh: "我会先为延迟诚恳道歉，感谢他们的耐心，然后立即核查申请进度；接着给出明确的时间节点和我的姓名，并承诺即使结果未定也会主动同步进展，让家长知道事情正在被处理。"
        },
        {
          id: "hot-3",
          q: "How do you keep hotline information consistent and confidential?",
          qzh: "你如何保证热线答复口径统一，并且做好保密？",
          hint: "统一 FAQ 与政策文档 → 按权限答复 → 不透露学生个人信息与录取结果 → 通话记录留痕。",
          keys: ["FAQ", "policy", "consistent", "confidential", "personal information", "authorised", "records"],
          keysZh: ["FAQ", "政策", "口径统一", "保密", "个人信息", "授权", "通话记录"],
          answer: "I would follow the official FAQ and policy documents so that everyone gives the same answer, and I would never share a student's personal information or admission result with anyone who is not authorised. Every call would be logged in the system so that the team can follow up properly.",
          answerZh: "我会依据官方 FAQ 和政策文件答复，保证团队口径统一；绝不向未获授权的人透露学生的个人信息或录取结果；每次通话都在系统中记录留痕，便于团队后续跟进。"
        }
      ]
    },

    /* ========== 5. 平台信息维护 ========== */
    {
      id: "platform", icon: "💻", name: "平台信息维护", nameEn: "Platform & Data Maintenance",
      desc: "对应职责「平台信息维护」，考数据准确性、规范意识与协作方式。",
      questions: [
        {
          id: "plat-1",
          q: "What does accurate data maintenance mean to you, and how do you do it?",
          qzh: "对你来说「信息维护准确」意味着什么？你会怎么做？",
          hint: "完整、准确、及时 → 当天录入、统一格式、核对关键字段、定期清理重复、注意备份。",
          keys: ["data entry", "accuracy", "format", "double check", "update", "duplicates", "backup"],
          keysZh: ["录入", "准确", "格式统一", "核对", "及时更新", "去重", "备份"],
          answer: "To me it means the information in the system is complete, correct and up to date, so that colleagues can trust it when they make decisions. I enter data the same day, follow the same format, double-check the key fields, and review the records regularly to remove duplicates.",
          answerZh: "对我来说，这意味着系统里的信息完整、准确、及时更新，同事才能放心依据它做判断。我会当天录入、统一格式、核对关键字段，并定期检查记录、清理重复数据。"
        },
        {
          id: "plat-2",
          q: "You notice that a colleague entered the wrong contact number for an applicant. What do you do?",
          qzh: "你发现同事把一位申请人的联系电话录错了，你会怎么做？",
          hint: "先核实（找原始材料或本人）→ 按流程修正 → 委婉告知同事 → 避免同类问题再发生。不指责、不越权。",
          keys: ["verify", "correct", "procedure", "colleague", "politely", "avoid", "record"],
          keysZh: ["核实", "修正", "按流程", "同事", "委婉", "避免再犯", "记录"],
          answer: "I would first verify the correct number with the applicant or the original document, then correct the record following our procedure and let the colleague know politely, so that we can both avoid the same mistake in the future.",
          answerZh: "我会先向申请人或原始材料核实正确号码，再按流程修正记录，并委婉告知同事，让双方今后都能避免同类错误。"
        },
        {
          id: "plat-3",
          q: "How would you use the admissions platform to support the team during the peak season?",
          qzh: "招生旺季，你会怎样利用招生平台支持团队？",
          hint: "实时更新状态 → 生成报表 → 设置节点提醒 → 用数据支持决策。",
          keys: ["update", "status", "report", "reminder", "deadline", "statistics", "support"],
          keysZh: ["实时更新", "状态", "报表", "提醒", "节点", "数据统计", "支持决策"],
          answer: "I would keep every applicant's status updated in real time, generate simple reports for the team, and set reminders for the key deadlines. That way the team can see at a glance where each applicant stands and where we need to follow up next.",
          answerZh: "我会实时更新每位申请人的状态，为团队生成简明报表，并为关键节点设置提醒。这样团队一眼就能看清每个人的进度，以及下一步该跟进谁。"
        }
      ]
    },

    /* ========== 6. 抗压 · 出差 · 加班 ========== */
    {
      id: "stress", icon: "🔥", name: "抗压 · 出差 · 加班", nameEn: "Pressure, Travel & Overtime",
      desc: "JD 明确写了「适应招生季高强度节奏、高频率出差及加班」，这一项是筛人重点。",
      questions: [
        {
          id: "str-1",
          q: "The admissions season is very busy, with overtime and frequent travel. How do you handle that?",
          qzh: "招生季非常忙，需要加班和频繁出差，你怎么应对？",
          hint: "先明确表态接受并理解 → 讲你的时间与精力管理方法 → 举过去加班/高强度的真实经历。",
          keys: ["understand", "ready", "prioritise", "schedule", "overtime", "travel", "experience"],
          keysZh: ["理解", "做好准备", "排优先级", "计划", "加班", "出差", "经历"],
          answer: "I understand that the admissions season is intense, and I am ready for it. I stay organised by prioritising tasks, planning my week in advance and keeping some energy for unexpected work. In my last job I worked long hours during the application peak, and I found that a clear plan and good communication with the team kept everything on track.",
          answerZh: "我理解招生季节奏紧张，也做好了准备。我会按优先级安排任务、提前规划一周的工作，并留出余量应对突发事项。上一份工作在申请高峰期我也加过班，靠清晰的计划和与团队的充分沟通，把工作都跟上了。"
        },
        {
          id: "str-2",
          q: "Tell me about a time you worked under great pressure. How did you manage it?",
          qzh: "请举一个你在高压下工作的例子，你是怎么应对的？",
          hint: "用 STAR 结构：情境 → 任务 → 行动（具体做法）→ 结果（可量化的最好）。",
          keys: ["situation", "task", "action", "result", "deadline", "divide", "review"],
          keysZh: ["情境", "任务", "行动", "结果", "截止日期", "分工", "复盘"],
          answer: "Once we had to process more than three hundred applications in one week before a deadline. I made a shared checklist, divided the work with two colleagues, and updated our progress every evening. We finished one day early and only two files needed correction. It taught me that clear division and a daily review really help under pressure.",
          answerZh: "有一次我们需要在截止日期前一周内处理三百多份申请。我做了共享清单，和两位同事分工，每晚更新进度，最后提前一天完成，只有两份需要更正。这件事让我体会到：分工清晰和每日复盘对高压工作非常有效。"
        },
        {
          id: "str-3",
          q: "You are asked to travel abroad for a recruitment fair at short notice. What do you do?",
          qzh: "如果临时通知你出国参加招生展会，你会怎么做？",
          hint: "确认目标/时间/预算 → 尽快办签证与行程 → 准备物料 → 与同事交接工作 → 出发前逐项核对。",
          keys: ["confirm", "visa", "flights", "itinerary", "materials", "handover", "checklist"],
          keysZh: ["确认", "签证", "机票", "行程", "物料", "工作交接", "核对清单"],
          answer: "I would confirm the objective, the dates and the budget first, then arrange the visa, flights and hotel as soon as possible. I would prepare the materials for the fair and hand over my daily tasks to a colleague, so that nothing is left behind while I am away.",
          answerZh: "我会先确认出访目标、时间与预算，然后尽快办理签证、机票和住宿；准备好展会物料，并把日常工作交接给同事，确保出差期间手头的事不受影响。"
        }
      ]
    },

    /* ========== 7. 团队协作与保密 ========== */
    {
      id: "team", icon: "🔒", name: "团队协作与保密", nameEn: "Teamwork & Confidentiality",
      desc: "JD 里的「团队协作与保密意识」，考的是协作习惯与合规底线。",
      questions: [
        {
          id: "team-1",
          q: "How do you work with a team when tasks are urgent and shared?",
          qzh: "当任务紧急又需要多人协作时，你如何配合团队？",
          hint: "明确分工 → 简短高频同步 → 主动补位 → 出问题先解决后复盘。",
          keys: ["communicate", "divide", "progress", "support", "responsible", "solve", "review"],
          keysZh: ["沟通", "分工", "同步进度", "补位", "责任心", "先解决", "复盘"],
          answer: "I like to agree clearly on who does what, keep everyone updated with a short daily message, and offer help when a colleague is overloaded. If something goes wrong, I focus on solving it first and reviewing it afterwards, rather than blaming anyone.",
          answerZh: "我会先和大家明确分工，每天用简短消息同步进度，同事忙不过来时主动补位。如果出了问题，我会先集中精力解决、之后再复盘，而不是追究责任。"
        },
        {
          id: "team-2",
          q: "What does confidentiality mean in an admissions office, and how do you keep it?",
          qzh: "在招生办里，「保密」意味着什么？你会怎么做到？",
          hint: "学生信息、申请材料、录取结果只对授权人员开放；最小权限、离开工位锁屏、不在工作外讨论。",
          keys: ["confidentiality", "personal data", "privacy", "authorised", "least access", "lock", "responsibility"],
          keysZh: ["保密", "个人信息", "隐私", "授权", "最小权限", "锁屏", "责任"],
          answer: "Confidentiality means that student information, application documents and admission decisions are only accessible to people who are authorised. I follow the rule of least access: I only open the files I need, I never discuss applicants outside work, and I lock my screen whenever I leave my desk.",
          answerZh: "保密意味着学生的信息、申请材料和录取决定只有获得授权的人才能接触。我遵循最小权限原则：只查看工作需要的文件，不在工作场合之外谈论申请人，离开工位就立即锁屏。"
        },
        {
          id: "team-3",
          q: "A friend asks you to check whether their child has been admitted. What do you do?",
          qzh: "如果有朋友托你查一下他孩子有没有被录取，你会怎么做？",
          hint: "礼貌但明确拒绝 → 说明规定 → 告知官方查询渠道。立场要清楚，态度要友好。",
          keys: ["cannot", "policy", "confidential", "official channel", "politely", "firm"],
          keysZh: ["不能", "规定", "保密", "官方渠道", "礼貌", "立场明确"],
          answer: "I would explain politely that admission results are confidential and that I am not able to check them for anyone outside the office, and then direct them to the official channel where they can get the result. I would keep it friendly but firm.",
          answerZh: "我会礼貌地说明录取结果属于保密信息，我不能为任何人私下查询，并告知他们通过官方渠道获取结果。态度友好，但立场明确。"
        }
      ]
    },

    /* ========== 8. 双语与跨文化沟通 ========== */
    {
      id: "bilingual", icon: "🌍", name: "双语与跨文化沟通", nameEn: "Bilingual & Cross-cultural",
      desc: "直接检验「中英双语流利交谈」这一硬要求，务必用目标语言作答。",
      questions: [
        {
          id: "bi-1",
          q: "Tell us about a time you communicated across cultures. What did you learn?",
          qzh: "请讲一次你跨文化沟通的经历，你学到了什么？",
          hint: "具体例子 + 你的做法（放慢、用简单表达、确认理解）+ 收获。",
          keys: ["culture", "communicate", "example", "simple English", "confirm", "patient", "misunderstanding"],
          keysZh: ["跨文化", "沟通", "具体例子", "简单表达", "确认理解", "耐心", "避免误会"],
          answer: "Once I helped a visiting teacher from the UK during a campus event. Some arrangements were unclear, so I explained them in simple English, checked that we both understood the same thing, and wrote the details down for her. I learned that being patient and confirming understanding avoids most misunderstandings.",
          answerZh: "有一次校园活动，我协助一位来访的英国老师。有些安排不够清楚，我用简单的英语解释，确认双方理解一致，并把细节写下来给她。这让我体会到：耐心和反复确认理解，能避免大部分误会。"
        },
        {
          id: "bi-2",
          q: "Please describe our admissions process to a foreign parent in English.",
          qzh: "请用英文向一位外籍家长介绍我们的招生流程。",
          hint: "顺序清晰、用词简单：咨询 → 提交材料 → 审核/面试 → 结果通知 → 缴费注册。",
          keys: ["enquiry", "application", "documents", "interview", "review", "offer", "enrolment"],
          keysZh: ["咨询", "申请", "材料", "面试", "审核", "录取通知", "注册"],
          answer: "First you send us an enquiry, and we will share the application checklist. Then you submit the documents online. After we review them, we invite the student for an interview or an assessment. Once a decision is made, we send the result by email, and if you accept the offer, we help you complete the enrolment steps.",
          answerZh: "首先您联系我们咨询，我们会发送申请材料清单；之后您在线提交材料；我们审核后会邀请学生参加面试或测评；结果确定后我们以邮件通知；如果您接受录取，我们会协助您完成注册手续。"
        },
        {
          id: "bi-3",
          q: "How do you explain a school policy that a parent disagrees with?",
          qzh: "如果家长不认同学校的某项政策，你会如何解释？",
          hint: "先倾听 → 平静说明政策原因 → 表达理解 → 提供替代方案或申诉渠道。不争辩、不越权承诺。",
          keys: ["listen", "policy", "reason", "understand", "options", "respect", "department"],
          keysZh: ["倾听", "政策", "原因", "理解", "替代方案", "尊重", "对应部门"],
          answer: "I would let the parent finish first, then explain the reason behind the policy clearly and calmly. I would show that I understand their concern, and if the policy cannot be changed, I would offer other options or tell them how to raise the issue with the right department.",
          answerZh: "我会先让家长把话说完，再清楚、平静地解释这项政策的出发点；同时表达对他们顾虑的理解。如果政策确实无法更改，我会提供其他可行方案，或告知向相应部门反映的渠道。"
        }
      ]
    }
  ];

  /* ---------------- 情景模拟（每场 3 轮） ---------------- */
  var SCENARIOS = [
    {
      id: "sc-visit", icon: "🏫", title: "境外来宾校园参观", titleEn: "Overseas Visitor Campus Tour",
      desc: "全程陪同外宾参观，练习欢迎、介绍学校与送别跟进。",
      turns: [
        {
          en: "Good morning! I'm Mr. Brown from Melbourne. Thank you for picking me up. Shall we start the campus tour?",
          zh: "早上好，我是来自墨尔本的 Brown 先生，谢谢你来接我。我们可以开始参观了吗？",
          hint: "欢迎 + 自我介绍 + 确认行程 + 询问是否需要先休息。",
          sample: "Good morning, Mr. Brown. Welcome to our school — it's a pleasure to meet you. Before we start, would you like to have a short rest or a cup of tea? Then I'll show you around the campus.",
          sampleZh: "早上好，Brown 先生，欢迎来到我们学校，很高兴见到您。开始之前，您要不要先休息一下或喝杯茶？然后我带您参观校园。",
          keys: ["welcome", "pleasure", "rest", "show you around"],
          keysZh: ["欢迎", "很高兴", "休息", "带您参观"]
        },
        {
          en: "That sounds great. Could you tell me a little about the school on the way?",
          zh: "听起来不错。路上能给我简单介绍一下学校吗？",
          hint: "用 2–3 句讲办学历史、课程体系、学生构成与升学成果。",
          sample: "Of course. Our school was founded in 2003 and now has students from more than twenty countries. We offer the IB Diploma Programme, and our graduates are admitted to universities around the world.",
          sampleZh: "当然可以。我们学校创办于 2003 年，现在有来自二十多个国家的学生，开设 IB 文凭课程，毕业生被世界各地的大学录取。",
          keys: ["founded", "students", "IB", "graduates", "universities"],
          keysZh: ["创办", "学生", "IB 课程", "毕业生", "大学"]
        },
        {
          en: "Thank you so much. I really enjoyed the visit. Could you send me the programme brochure later?",
          zh: "非常感谢，这次参观很愉快。稍后能把课程手册发给我吗？",
          hint: "回应致谢 + 承诺发送时间 + 确认邮箱 + 礼貌送别。",
          sample: "It was my pleasure. I'll email you the brochure and the programme details this afternoon. Could you please confirm your email address? I hope you have a pleasant trip back.",
          sampleZh: "这是我的荣幸。我今天下午会把手册和课程详情邮件发给您。方便确认一下您的邮箱吗？祝您返程顺利。",
          keys: ["my pleasure", "email", "brochure", "confirm", "pleasant trip"],
          keysZh: ["荣幸", "邮件", "手册", "确认", "旅途愉快"]
        }
      ]
    },
    {
      id: "sc-parent", icon: "👨‍👩‍👧", title: "家长临时到访咨询", titleEn: "Walk-in Parent Enquiry",
      desc: "家长未预约直接来访，练习接待、口径把握与参观安排。",
      turns: [
        {
          en: "Hello, I'd like to ask about this year's admissions policy in person. I don't have an appointment — is it convenient now?",
          zh: "你好，我想当面咨询一下今年的招生政策，我没有预约，现在方便吗？",
          hint: "热情接待 + 安排就座 + 说明老师日程 + 提供「先记录需求 + 帮约时间」两条路。",
          sample: "Of course — welcome. Please have a seat. Our admissions officer is in a meeting right now, but I can take down your questions and arrange an appointment for you. May I have your name and phone number?",
          sampleZh: "当然可以，欢迎您。请先坐。招生老师现在正在开会，我可以先把您的问题记下来，并帮您预约时间。请问您的姓名和电话是？",
          keys: ["welcome", "seat", "appointment", "questions", "name", "phone"],
          keysZh: ["欢迎", "请坐", "预约", "问题", "姓名", "电话"]
        },
        {
          en: "Well, my main question is whether my daughter can still apply for Grade 10 this year.",
          zh: "我主要想问，我女儿今年还能不能申请 10 年级。",
          hint: "按官方口径回答；不确定的说明会核实后回电，不要随意承诺。",
          sample: "Let me check that for you. Applications for Grade 10 are still open until the end of this month. I'll confirm the exact deadline with our admissions office and call you back today.",
          sampleZh: "我帮您确认一下。10 年级的申请目前仍然开放，到本月底截止。我会和招生办核实准确日期，今天之内给您回电。",
          keys: ["check", "open", "deadline", "confirm", "call you back"],
          keysZh: ["确认", "开放", "截止日期", "核实", "回电"]
        },
        {
          en: "That's a relief. Can I also see the campus while I'm here?",
          zh: "那我就放心了。既然来了，我能顺便参观一下校园吗？",
          hint: "同意但先说明规定（需登记/需陪同），给出明确时长与路线。",
          sample: "Certainly. I'd be happy to show you around, but I need to register your visit first. It takes about twenty minutes, and I'll walk you through the classrooms and the library.",
          sampleZh: "当然可以，我很乐意带您参观，不过需要先做个来访登记。大约二十分钟，我带您看看教室和图书馆。",
          keys: ["certainly", "register", "twenty minutes", "classrooms", "library"],
          keysZh: ["当然", "登记", "二十分钟", "教室", "图书馆"]
        }
      ]
    },
    {
      id: "sc-fee", icon: "💰", title: "热线：学费与奖学金", titleEn: "Hotline: Tuition & Scholarships",
      desc: "典型热线咨询，练习口径准确与主动跟进。",
      turns: [
        {
          en: "Hello, I'm calling to ask about the tuition fee for the international programme. Could you tell me how much it is?",
          zh: "你好，我想咨询国际课程的学费，一年大概多少？",
          hint: "问候致谢 + 确认年级（费用按年级不同）+ 按官方口径答复。",
          sample: "Good morning, and thank you for calling. The tuition fee for the international programme is about one hundred and fifty thousand yuan per year, and it includes the core courses. May I ask which grade your child is applying for? Then I can give you the exact figure.",
          sampleZh: "早上好，感谢来电。国际课程学费大约每年十五万元，包含核心课程。请问您的孩子申请哪个年级？我可以给您准确的数字。",
          keys: ["thank you for calling", "tuition fee", "per year", "which grade", "exact"],
          keysZh: ["感谢来电", "学费", "每年", "哪个年级", "准确"]
        },
        {
          en: "I see. And does the school offer scholarships? My son is quite strong in maths and science.",
          zh: "明白了。学校有奖学金吗？我儿子数学和科学比较突出。",
          hint: "介绍奖学金类别与申请方式，鼓励随申请一并提交。",
          sample: "Yes, we offer merit-based scholarships for students with outstanding academic or talent records. Your son can apply together with his admission application. I'll send you the scholarship guidelines by email.",
          sampleZh: "有的，我们为学业或特长突出的学生提供奖学金。您儿子可以和入学申请一起提交。我把奖学金申请指南邮件发给您。",
          keys: ["merit-based", "scholarship", "apply", "guidelines", "email"],
          keysZh: ["奖学金", "申请", "指南", "邮件", "特长"]
        },
        {
          en: "Thank you. One more thing — when is the application deadline?",
          zh: "谢谢。还有一个问题，申请截止日期是什么时候？",
          hint: "给出准确日期 + 建议提前提交 + 索取联系方式以便提醒。",
          sample: "The deadline for this year's intake is the thirtieth of June. I'd suggest submitting the documents two weeks earlier. May I have your name and phone number so that I can send you a reminder?",
          sampleZh: "今年这一批的截止日期是 6 月 30 日。建议您提前两周提交材料。方便留下姓名和电话吗？我到时候提醒您。",
          keys: ["deadline", "intake", "submit", "two weeks", "reminder"],
          keysZh: ["截止日期", "这一批", "提交", "提前两周", "提醒"]
        }
      ]
    },
    {
      id: "sc-angry", icon: "😤", title: "热线：进度查询（情绪激动）", titleEn: "Hotline: An Upset Parent",
      desc: "处理情绪化来电，练习共情、查证与明确承诺。",
      turns: [
        {
          en: "I submitted my daughter's application three weeks ago and nobody has contacted me. This is really frustrating.",
          zh: "我三周前就提交了女儿的申请，一直没人联系我，这太让人失望了。",
          hint: "先道歉共情，不辩解；再索取信息以便立即核查。",
          sample: "I'm very sorry about that, and thank you for your patience. Let me check your daughter's application right now. Could you tell me her name and the application number?",
          sampleZh: "非常抱歉给您带来困扰，也感谢您的耐心。我现在就帮您查询。方便告诉我孩子的姓名和申请编号吗？",
          keys: ["I'm very sorry", "patience", "check", "name", "application number"],
          keysZh: ["非常抱歉", "耐心", "查询", "姓名", "申请编号"]
        },
        {
          en: "Her name is Wang Yue. I really hope you can tell me something today.",
          zh: "她叫王悦。我真的很希望今天能有个说法。",
          hint: "给出已查到的状态 + 明确回电时间（具体到点），让家长安心。",
          sample: "Thank you, Mrs. Wang. I've found her record — the documents are under review. I will confirm with the admissions officer and call you back before five o'clock today.",
          sampleZh: "谢谢您，王女士。我已经找到了她的申请记录，材料正在审核中。我会和招生老师确认，今天下午五点前给您回电。",
          keys: ["found", "under review", "confirm", "call you back", "before five"],
          keysZh: ["找到记录", "审核中", "确认", "回电", "五点前"]
        },
        {
          en: "Alright, I'll wait for your call. Please don't forget.",
          zh: "好吧，我等你的电话，请别忘了。",
          hint: "复述承诺 + 留下自己的姓名与直线电话，把主动权交给家长。",
          sample: "I won't forget, Mrs. Wang. My name is Li Hua, and here is my direct number. If you don't hear from me by five, please call me back directly.",
          sampleZh: "不会忘的，王女士。我叫李华，这是我的直线电话。如果五点前没接到我的电话，您可以直接打给我。",
          keys: ["won't forget", "my name", "direct number", "call me back"],
          keysZh: ["不会忘", "我的姓名", "直线电话", "打给我"]
        }
      ]
    },
    {
      id: "sc-fair", icon: "🎪", title: "招生宣讲会现场咨询", titleEn: "Recruitment Fair Booth",
      desc: "展会/宣讲会现场快速建立信任并留存线索。",
      turns: [
        {
          en: "Hi, I'm a Grade 12 student from another city. I'd like to know more about your undergraduate preparation programme.",
          zh: "你好，我是外地的高三学生，想了解一下你们的本科升学准备项目。",
          hint: "欢迎 + 用提问了解需求（目标国家/专业）+ 简要介绍。",
          sample: "Hi, welcome — thanks for coming over. Could you tell me which country you'd like to study in? Then I can introduce the programme that fits you best.",
          sampleZh: "你好，欢迎，谢谢你来咨询。方便告诉我你打算去哪个国家留学吗？我可以介绍最适合你的项目。",
          keys: ["welcome", "which country", "introduce", "fits you best"],
          keysZh: ["欢迎", "哪个国家", "介绍", "适合你"]
        },
        {
          en: "I'm thinking about the UK. Does your school help with personal statements?",
          zh: "我在考虑去英国。学校会指导个人陈述吗？",
          hint: "说明学校支持（文书、模拟面试、选校）与时间安排。",
          sample: "Yes, we do. Our counsellors guide students through the personal statement step by step, and we also run mock interviews. The writing workshop usually starts in September.",
          sampleZh: "会的。我们的升学指导老师会一步步指导学生写个人陈述，还会安排模拟面试。写作工作坊通常在九月开始。",
          keys: ["counsellors", "step by step", "mock interviews", "workshop", "September"],
          keysZh: ["指导老师", "一步步", "模拟面试", "工作坊", "九月"]
        },
        {
          en: "Great. Can I leave my contact details so you can send me more information?",
          zh: "太好了。我可以留联系方式，请你们把资料发给我吗？",
          hint: "索取信息 + 明确后续动作与时间（发什么、什么时候、谁来跟进）。",
          sample: "Of course. Please write down your name, phone number and email here. I'll send you the programme brochure and the event schedule by tomorrow, and our counsellor will follow up with you next week.",
          sampleZh: "当然可以。请在这里写下姓名、电话和邮箱。我明天之前把课程手册和活动安排发给您，升学老师下周会与您联系。",
          keys: ["write down", "phone number", "email", "brochure", "follow up"],
          keysZh: ["写下", "电话", "邮箱", "手册", "跟进"]
        }
      ]
    },
    {
      id: "sc-handover", icon: "🔄", title: "与同事交接与数据核对", titleEn: "Handover & Data Check",
      desc: "练习团队协作与保密边界——这是 JD 里明写的两项素质。",
      turns: [
        {
          en: "I'm going on leave next week, so could you take over the follow-up calls for the Grade 9 applicants?",
          zh: "我下周休假，你能接手 9 年级申请人的跟进电话吗？",
          hint: "明确接受 + 问清关键信息（名单、已联系情况、是否有紧急件）。",
          sample: "Sure, I can take over. Could you share the applicant list and let me know which families have already been contacted? I'd also like to know if any of them are urgent.",
          sampleZh: "没问题，我可以接手。方便把申请人名单发我，并告诉我哪些家庭已经联系过了吗？另外有没有需要优先处理的紧急情况？",
          keys: ["take over", "applicant list", "contacted", "urgent"],
          keysZh: ["接手", "名单", "已联系", "紧急"]
        },
        {
          en: "Here is the list. Two families are waiting for the scholarship result, and one needs a reply today.",
          zh: "名单在这里。有两个家庭在等奖学金结果，还有一个今天必须回复。",
          hint: "复述确认关键点，说明处理顺序，避免遗漏。",
          sample: "Got it. So two families are waiting for the scholarship result, and one needs a reply today. I'll call that family first and update the system before I leave.",
          sampleZh: "明白。也就是两个家庭在等奖学金结果，另有一个今天必须回复。我会先联系这一家，下班前把系统记录更新好。",
          keys: ["waiting for", "reply today", "call first", "update the system"],
          keysZh: ["等待", "今天回复", "先联系", "更新系统"]
        },
        {
          en: "Thanks. Please remember that the scholarship results are confidential — don't share them with anyone outside the office.",
          zh: "谢谢。请记住奖学金结果属于保密信息，不要向办公室以外的人透露。",
          hint: "明确承诺遵守保密规定，并说明具体做法（权限、留痕）。",
          sample: "Understood. I won't share any results outside the office, and I'll keep all the files in the system with restricted access. You can count on me.",
          sampleZh: "明白。我不会向办公室以外的人透露任何结果，所有文件都会保留在系统里并限制访问权限。请放心交给我。",
          keys: ["understood", "won't share", "restricted access", "count on me"],
          keysZh: ["明白", "不透露", "限制权限", "请放心"]
        }
      ]
    }
  ];

  /* ---------------- 术语速查 ---------------- */
  var VOCAB = [
    { en: "admissions", zh: "招生；录取", ex: "The admissions office handles all applications." },
    { en: "enrolment", zh: "注册；入学", ex: "Enrolment for the new term starts in August." },
    { en: "prospective student", zh: "意向学生", ex: "We follow up with prospective students by email." },
    { en: "applicant", zh: "申请人", ex: "Each applicant receives a confirmation email." },
    { en: "intake", zh: "招生批次；一届", ex: "The September intake is now open." },
    { en: "rolling admission", zh: "滚动录取", ex: "We use rolling admission for transfer students." },
    { en: "waitlist", zh: "候补名单", ex: "She was placed on the waitlist." },
    { en: "deadline", zh: "截止日期", ex: "The application deadline is the 30th of June." },
    { en: "tuition fee", zh: "学费", ex: "The tuition fee includes core courses." },
    { en: "scholarship", zh: "奖学金", ex: "Merit-based scholarships are available." },
    { en: "financial aid", zh: "助学金；资助", ex: "Families can apply for financial aid." },
    { en: "transcript", zh: "成绩单", ex: "Please upload your transcript and ID copy." },
    { en: "recommendation letter", zh: "推荐信", ex: "Two recommendation letters are required." },
    { en: "personal statement", zh: "个人陈述", ex: "Our counsellors help with the personal statement." },
    { en: "portfolio", zh: "作品集", ex: "Art applicants should submit a portfolio." },
    { en: "offer letter", zh: "录取通知书", ex: "We send the offer letter by email." },
    { en: "campus tour", zh: "校园参观", ex: "I'll take you on a campus tour." },
    { en: "info session", zh: "招生宣讲会", ex: "We hold info sessions in five cities." },
    { en: "open day", zh: "校园开放日", ex: "The open day is on the 12th of May." },
    { en: "orientation", zh: "迎新；入学教育", ex: "New students attend orientation week." },
    { en: "curriculum", zh: "课程体系", ex: "Our curriculum follows the IB framework." },
    { en: "assessment", zh: "测评；评估", ex: "The student will take an assessment." },
    { en: "guardian", zh: "监护人；家长", ex: "The guardian must sign the form." },
    { en: "alumni", zh: "校友", ex: "Our alumni study in ten countries." },
    { en: "referral", zh: "推荐；转介绍", ex: "Many applicants come from family referrals." },
    { en: "follow-up", zh: "跟进", ex: "I'll do a follow-up call tomorrow." },
    { en: "CRM system", zh: "客户关系管理系统", ex: "All enquiries are recorded in the CRM system." },
    { en: "data entry", zh: "数据录入", ex: "Data entry must be done the same day." },
    { en: "confidentiality", zh: "保密", ex: "Confidentiality is part of my contract." },
    { en: "restricted access", zh: "受限访问权限", ex: "Only two staff have restricted access." },
    { en: "itinerary", zh: "行程安排", ex: "I'll send you the itinerary in advance." },
    { en: "reception", zh: "接待", ex: "The reception desk is on the first floor." },
    { en: "interpretation", zh: "口译", ex: "We arranged interpretation for the visit." },
    { en: "compliance", zh: "合规", ex: "All documents must meet compliance rules." },
    { en: "peak season", zh: "旺季；高峰期", ex: "The peak season runs from March to July." }
  ];

  /* ---------------- 万能句式 ---------------- */
  var PHRASES = [
    { en: "Thank you for your interest in our school.", zh: "感谢您对我校的关注。" },
    { en: "May I have your name and contact number, please?", zh: "请问您的姓名和联系电话？" },
    { en: "Let me check that for you — could you hold on a moment?", zh: "我帮您查一下，请稍等片刻。" },
    { en: "I'll confirm with our admissions office and get back to you today.", zh: "我会与招生办核实，今天内回复您。" },
    { en: "I'm afraid I'm not able to share that information.", zh: "抱歉，这项信息我不能透露。" },
    { en: "Please rest assured that all your information is kept strictly confidential.", zh: "请放心，您的所有信息都会被严格保密。" },
    { en: "Would you like me to arrange an appointment for you?", zh: "需要我为您安排一次预约吗？" },
    { en: "Let me walk you through the process.", zh: "我来为您介绍一下整个流程。" },
    { en: "Could you please write down your email address here?", zh: "请在这里留下您的邮箱地址。" },
    { en: "I'll send you the documents by email this afternoon.", zh: "我今天下午会把材料邮件发给您。" },
    { en: "Sorry to keep you waiting.", zh: "抱歉让您久等了。" },
    { en: "Thank you for your patience.", zh: "感谢您的耐心。" },
    { en: "Is there anything else I can help you with?", zh: "还有什么可以帮您的吗？" },
    { en: "I'll make a note of that and follow up.", zh: "我会记录下来并跟进。" },
    { en: "Please feel free to contact me if you have any questions.", zh: "有任何问题请随时联系我。" },
    { en: "I understand your concern, and I'll do my best to help.", zh: "我理解您的顾虑，我会尽力协助。" }
  ];

  window.DailyTalkInterviewData = {
    position: POSITION,
    categories: CATEGORIES,
    scenarios: SCENARIOS,
    vocab: VOCAB,
    phrases: PHRASES
  };
})();
