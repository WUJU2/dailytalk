/* =========================================================
 * DailyTalk 数据：场景库 + 自由对话应答引擎
 * ========================================================= */
(function () {
  "use strict";

  /* ---------------- 场景库 ---------------- */
  var SCENARIOS = [
    {
      id: "coffee", icon: "☕", title: "Coffee Order", zh: "咖啡店点单",
      level: 1, tags: ["点餐", "社交"], color: ["#f59e0b", "#f97316"],
      desc: "去咖啡馆点一杯咖啡，练习点单、选大小、支付。",
      vocab: ["latte", "cappuccino", "americano", "espresso", "mocha", "hot chocolate", "tea", "iced", "hot", "small", "medium", "large", "sugar", "milk", "for here", "to go", "pay", "cash", "card"],
      menu: ["latte", "cappuccino", "americano", "espresso", "mocha", "hot chocolate", "tea"],
      bank: [
        { en: "I'd like a latte, please.", zh: "我想要一杯拿铁。" },
        { en: "For here or to go?", zh: "在这儿喝还是带走？" },
        { en: "Can I have it iced?", zh: "能做成冰的吗？" },
        { en: "How much is it?", zh: "多少钱？" }
      ],
      steps: [
        { q: "Hi there! Welcome to Brew Café. What can I get for you today?", h: "外教扮演店员：欢迎光临，想问你想喝点什么。", chips: ["I'd like a latte, please.", "A cappuccino, please.", "Can I have an iced tea?"] },
        { q: "Sure! Would you like it hot or iced?", h: "店员问你要热的还是冰的。", chips: ["Hot, please.", "Iced, please.", "Hot, thank you!"] },
        { q: "What size would you like — small, medium, or large?", h: "店员问你要小杯、中杯还是大杯。", chips: ["Medium, please.", "A small one, please.", "Large, please."] },
        { q: "Great choice! Anything else? We also have fresh cake and cookies.", h: "店员问你还要不要别的，比如蛋糕或曲奇。", chips: ["No, that's all, thanks.", "Yes, I'd like a slice of cake.", "Just the drink, thank you."] },
        { q: "Okay. For here or to go?", h: "店员问你在店里喝还是带走。", chips: ["For here, please.", "To go, please.", "For here."] },
        { q: "That will be six dollars and fifty cents. How would you like to pay?", h: "店员告诉你价格并询问支付方式。", chips: ["By card, please.", "Cash, please.", "I'll pay by card."] },
        { q: "Perfect! Here's your drink. Have a nice day!", h: "店员把饮品给你并祝你开心。", chips: ["Thank you! You too!", "Thanks a lot!", "Have a nice day!"] }
      ],
      outro: "Wonderful job! You ordered coffee like a pro. Let's practice another time. See you! ☕"
    },
    {
      id: "restaurant", icon: "🍜", title: "Restaurant", zh: "餐厅点餐",
      level: 1, tags: ["点餐", "口味"],
      desc: "在餐厅点餐，表达喜好、忌口与结账。",
      vocab: ["menu", "order", "beef noodles", "chicken", "rice", "vegetable", "spicy", "mild", "delicious", "check", "bill", "water", "recommend", "allergic"],
      menu: ["beef noodles", "fried rice", "dumplings", "chicken", "salad", "pizza"],
      bank: [
        { en: "Could I see the menu, please?", zh: "我能看看菜单吗？" },
        { en: "What do you recommend?", zh: "你有什么推荐吗？" },
        { en: "I'd like it not too spicy.", zh: "我希望不要太辣。" },
        { en: "Could we have the bill, please?", zh: "请给我们结账。" }
      ],
      steps: [
        { q: "Good evening! Welcome to Happy Noodles. Here's the menu. What would you like to order?", h: "店员欢迎你并递上菜单，问你想点什么。", chips: ["What do you recommend?", "I'd like the beef noodles, please.", "Can I have a look at the menu first?"] },
        { q: "The beef noodles are very popular here. And how spicy would you like it?", h: "店员推荐牛肉面，并问你要多辣。", chips: ["Not too spicy, please.", "Mild, please.", "A little spicy, please."] },
        { q: "Got it! Would you like anything to drink?", h: "店员问你要不要喝的。", chips: ["A glass of water, please.", "Green tea, please.", "No, thanks."] },
        { q: "Okay, your food will be ready soon. Enjoy your meal!", h: "店员说餐食很快就来，祝你用餐愉快。", chips: ["Thank you very much!", "Thanks!"] },
        { q: "How is your meal? Is everything okay?", h: "店员询问菜品是否满意。", chips: ["It's delicious! I love it.", "It's really good, thank you.", "Very tasty!"] },
        { q: "Glad to hear that! Would you like anything else?", h: "店员问你还需不需要别的。", chips: ["No, thanks. Could we have the bill?", "I'm full. The bill, please.", "No more, thank you."] },
        { q: "Of course! The total is 58 yuan. Thank you for coming. Have a great evening!", h: "店员送上账单并致谢。", chips: ["Thank you! You too!", "Thanks for the great service!"] }
      ],
      outro: "Excellent! You handled the restaurant conversation so well. See you next time! 🍜"
    },
    {
      id: "selfintro", icon: "🙋", title: "Introduce Yourself", zh: "自我介绍",
      level: 1, tags: ["社交", "破冰"],
      desc: "和新朋友打招呼，介绍你的名字、家乡、工作与爱好。",
      vocab: ["name", "from", "live", "work", "student", "engineer", "hobby", "music", "sports", "like", "meet", "happy"],
      menu: [],
      bank: [
        { en: "Nice to meet you!", zh: "很高兴认识你！" },
        { en: "I'm from Shenzhen, China.", zh: "我来自中国深圳。" },
        { en: "I work as a software engineer.", zh: "我是一名软件工程师。" },
        { en: "In my free time, I like hiking.", zh: "空闲时我喜欢远足。" }
      ],
      steps: [
        { q: "Hi! I'm Emma. It's so nice to meet you! What's your name?", h: "外教自我介绍并问你的名字。", chips: ["My name is Lily. Nice to meet you!", "I'm Mike. Nice to meet you, Emma!", "You can call me Amy."] },
        { q: "That's a lovely name! Where are you from?", h: "外教问你是哪里人。", chips: ["I'm from Shenzhen, China.", "I'm from Guangzhou.", "I'm Chinese. I come from Shanghai."] },
        { q: "Oh, I've heard great things about your city! What do you do?", h: "外教问你的职业。", chips: ["I'm a student.", "I work as a software engineer.", "I'm a teacher."] },
        { q: "Nice! What do you like to do in your free time?", h: "外教问你空闲时间喜欢做什么。", chips: ["I like listening to music.", "I enjoy playing basketball.", "I like reading books."] },
        { q: "Sounds fun! Do you like your job or your school?", h: "外教问你喜不喜欢自己的工作/学校。", chips: ["Yes, I really like it.", "It's okay, but a little busy.", "I love it very much."] },
        { q: "That's great to hear! It was really nice talking with you. Let's chat again soon!", h: "外教表示聊得很开心，期待再聊。", chips: ["Me too! See you next time!", "It was nice talking to you too!"] }
      ],
      outro: "Perfect self-introduction! You spoke clearly and confidently. Well done! 🙌"
    },
    {
      id: "smalltalk", icon: "☀️", title: "Small Talk", zh: "日常闲聊（天气/周末）",
      level: 1, tags: ["闲聊", "高频"],
      desc: "和同事朋友聊聊天气与周末安排——最常用的破冰话题。",
      vocab: ["weather", "sunny", "rainy", "cloudy", "hot", "cold", "weekend", "plan", "movie", "park", "walk", "nice day", "stay home"],
      menu: [],
      bank: [
        { en: "It's a lovely day, isn't it?", zh: "今天天气真好，对吧？" },
        { en: "What's the weather like today?", zh: "今天天气怎么样？" },
        { en: "I'm going to the park this weekend.", zh: "这周末我打算去公园。" },
        { en: "That sounds nice!", zh: "听起来不错！" }
      ],
      steps: [
        { q: "Hi! It's such a lovely day today, isn't it?", h: "外教说今天天气真好，问你是否同意。", chips: ["Yes, it is! The sun is shining.", "Yeah, it's really nice.", "It is! But it's a bit hot."] },
        { q: "I love sunny days! What do you usually do on the weekend?", h: "外教问你周末通常做什么。", chips: ["I usually stay home and rest.", "I go to the park with my friends.", "I often watch movies at home."] },
        { q: "That sounds relaxing! Did you do anything fun last weekend?", h: "外教问你上周末做了什么有趣的事。", chips: ["Yes, I went shopping with my family.", "I visited my grandparents.", "I just stayed home and studied."] },
        { q: "Nice! What are your plans for this weekend?", h: "外教问你本周末的计划。", chips: ["I'm going to the movies.", "I want to try a new restaurant.", "I'm going hiking if the weather is good."] },
        { q: "That sounds wonderful! I hope you have a great time.", h: "外教祝你玩得开心。", chips: ["Thanks! You too!", "Thank you! I will!"] }
      ],
      outro: "Great small talk! You kept the conversation going naturally. Amazing! ☀️"
    },
    {
      id: "directions", icon: "🧭", title: "Asking Directions", zh: "问路与指路",
      level: 2, tags: ["出行", "实用"],
      desc: "在街上问路、确认方位并听懂指路信息。",
      vocab: ["excuse me", "where is", "subway", "station", "bus stop", "left", "right", "straight", "turn", "far", "near", "map", "cross", "block", "lost"],
      menu: [],
      bank: [
        { en: "Excuse me, where is the nearest subway station?", zh: "请问最近的地铁站在哪里？" },
        { en: "Go straight and turn left.", zh: "直走然后左转。" },
        { en: "Is it far from here?", zh: "离这儿远吗？" },
        { en: "How long does it take to get there?", zh: "到那儿要多久？" }
      ],
      steps: [
        { q: "Excuse me, could you help me? I'm a little lost. Can you tell me where the subway station is?", h: "外教扮演路人，向你问地铁站怎么走。", chips: ["Sure! Go straight and turn left.", "It's over there, next to the bank.", "Walk two blocks and you'll see it."] },
        { q: "Okay, go straight and turn left at the bank. Is that right?", h: "外教和你确认路线。", chips: ["Yes, that's right.", "Right! Then go straight for two minutes.", "Exactly. You can't miss it."] },
        { q: "Thanks! Is it far from here?", h: "外教问地铁站离得远不远。", chips: ["No, it's not far. About five minutes on foot.", "It's a little far. You can take a bus.", "Not really, just two blocks away."] },
        { q: "Good to know! How long does it take if I walk?", h: "外教问走过去要多久。", chips: ["About ten minutes.", "Around fifteen minutes.", "It takes about five minutes."] },
        { q: "Perfect, thank you so much for your help!", h: "外教感谢你的指路。", chips: ["You're welcome! Have a nice day!", "No problem. Take care!", "My pleasure!"] }
      ],
      outro: "You gave directions clearly — I found the station easily! Thank you! 🧭"
    },
    {
      id: "hotel", icon: "🏨", title: "Hotel Check-in", zh: "酒店入住",
      level: 2, tags: ["出行", "服务"],
      desc: "办理酒店入住、咨询设施与服务。",
      vocab: ["reservation", "check in", "room", "passport", "single", "double", "floor", "wifi", "breakfast", "key card", "lobby", "reception", "booking", "available"],
      menu: [],
      bank: [
        { en: "I have a reservation under the name Chen.", zh: "我以 Chen 的名字预订了房间。" },
        { en: "Could I have a room with a view?", zh: "能给我一间有风景的房间吗？" },
        { en: "What time is breakfast?", zh: "早餐几点供应？" },
        { en: "Is the WiFi free?", zh: "WiFi 免费吗？" }
      ],
      steps: [
        { q: "Good afternoon! Welcome to Sunny Hotel. How can I help you?", h: "前台接待员（外教扮演）问你需要什么帮助。", chips: ["Hi, I'd like to check in, please.", "I have a reservation. My name is Chen.", "Good afternoon! I booked a room online."] },
        { q: "Of course! May I see your passport, please?", h: "前台请出示护照。", chips: ["Here you are.", "Sure, here it is.", "Of course, here's my passport."] },
        { q: "Thank you! Your room is on the 8th floor. Would you like a room with a city view?", h: "前台告知房型，询问是否需要城景房。", chips: ["Yes, that sounds great!", "Sure, if it's available.", "That would be lovely."] },
        { q: "Wonderful! Would you like breakfast included?", h: "前台询问是否包含早餐。", chips: ["Yes, please. What time is breakfast?", "No, thanks. I'll eat outside.", "Yes, that's great."] },
        { q: "Breakfast is from 7 to 10. Here is your key card. Is there anything else I can help with?", h: "前台告知早餐时间并递上房卡。", chips: ["Is the WiFi free?", "What time is checkout?", "No, that's all. Thank you!"] },
        { q: "WiFi is free, and checkout is at noon. Enjoy your stay!", h: "前台回答你的问题并祝福。", chips: ["Thank you so much!", "Great, thanks for your help!"] }
      ],
      outro: "Smooth check-in! You asked all the right questions. Enjoy your stay! 🏨"
    },
    {
      id: "clothes", icon: "👕", title: "Shopping for Clothes", zh: "服装店购物",
      level: 2, tags: ["购物", "颜色尺码"],
      desc: "买衣服：表达想要的颜色尺码、试穿与砍价。",
      vocab: ["size", "medium", "large", "try on", "fitting room", "color", "black", "white", "blue", "price", "discount", "cheap", "expensive", "fit", "cashier", "t-shirt", "jeans"],
      menu: [],
      bank: [
        { en: "Do you have this in a larger size?", zh: "这件有大一点的吗？" },
        { en: "Can I try it on?", zh: "我能试穿一下吗？" },
        { en: "How much is it?", zh: "这件多少钱？" },
        { en: "Could you give me a discount?", zh: "能给我打个折吗？" }
      ],
      steps: [
        { q: "Welcome to Trendy Wear! Are you looking for anything in particular?", h: "店员问你在找什么特别的衣服。", chips: ["Yes, I'm looking for a T-shirt.", "I'm just looking, thanks.", "I want to buy a pair of jeans."] },
        { q: "Great! What color do you prefer?", h: "店员问你喜欢什么颜色。", chips: ["I like black or white.", "Blue is my favorite.", "Do you have it in gray?"] },
        { q: "Nice choice! What size do you wear?", h: "店员问你穿什么尺码。", chips: ["Medium, please.", "I wear size L.", "A small size, please."] },
        { q: "Here you are. Would you like to try it on? The fitting room is over there.", h: "店员建议你去试衣间试穿。", chips: ["Yes, can I try it on?", "Sure, where is the fitting room?", "Yes, please."] },
        { q: "How does it fit? Does it look good?", h: "店员问你穿着效果如何。", chips: ["It fits well. I'll take it.", "It's a little big. Do you have a smaller one?", "I like it, but it's a bit tight."] },
        { q: "Great! This one is 199 yuan. Would you like to pay at the cashier?", h: "店员报价并引导结账。", chips: ["Okay, I'll take it.", "Could you give me a discount?", "Sure, where is the cashier?"] }
      ],
      outro: "Fabulous shopping trip! You knew exactly what to say. See you next time! 🛍️"
    },
    {
      id: "doctor", icon: "🩺", title: "Seeing a Doctor", zh: "看医生",
      level: 3, tags: ["健康", "高难度"],
      desc: "描述病情、回答医生询问并听懂医嘱。",
      vocab: ["sick", "fever", "headache", "cough", "throat", "sore", "cold", "medicine", "rest", "doctor", "hurt", "pain", "feel", "temperature", "symptom", "allergy"],
      menu: [],
      bank: [
        { en: "I don't feel well. I have a headache.", zh: "我不舒服，头疼。" },
        { en: "How long have you felt this way?", zh: "你这样多久了？" },
        { en: "Take this medicine twice a day.", zh: "这个药一天吃两次。" },
        { en: "You should drink more water and rest.", zh: "你应多喝水多休息。" }
      ],
      steps: [
        { q: "Hello, please have a seat. What seems to be the problem?", h: "医生（外教扮演）询问你哪里不舒服。", chips: ["I don't feel well. I have a fever.", "I have a bad headache.", "My throat is sore and I keep coughing."] },
        { q: "I see. How long have you felt this way?", h: "医生问你这样多久了。", chips: ["Since yesterday.", "For about two days.", "It started last night."] },
        { q: "Let me check your temperature. Do you have any other symptoms?", h: "医生量体温并询问其他症状。", chips: ["I also feel very tired.", "Yes, I have a runny nose.", "No, just the fever."] },
        { q: "Okay, you probably have a cold. Have you taken any medicine yet?", h: "医生判断是感冒，问你有没有吃药。", chips: ["Not yet.", "I took some medicine last night.", "No, I haven't."] },
        { q: "Alright. I'll give you some medicine. Take it twice a day, and drink lots of water. Can you remember that?", h: "医生开药并叮嘱用法，问你记住了吗。", chips: ["Yes, I'll remember that. Thank you.", "Twice a day. Got it!", "Okay, doctor. Should I rest a lot?"] },
        { q: "Yes, rest is very important. You'll feel better in a few days. Take care!", h: "医生嘱咐多休息，祝你早日康复。", chips: ["Thank you, doctor!", "I will. Thanks for your help!"] }
      ],
      outro: "You explained your symptoms clearly — the doctor understood everything! Well done! 🩺"
    },
    {
      id: "airport", icon: "✈️", title: "At the Airport", zh: "机场出行",
      level: 3, tags: ["出行", "高难度"],
      desc: "办理值机、询问登机口与行李相关表达。",
      vocab: ["check in", "boarding pass", "passport", "luggage", "baggage", "window seat", "aisle", "gate", "boarding", "departure", "flight", "delay", "carry-on", "scale"],
      menu: [],
      bank: [
        { en: "Where can I check in for flight CA1301?", zh: "CA1301 航班在哪里值机？" },
        { en: "Could I have a window seat, please?", zh: "可以给我靠窗的座位吗？" },
        { en: "How many bags can I check?", zh: "我能托运几件行李？" },
        { en: "Which gate does the flight board at?", zh: "这个航班在哪个登机口登机？" }
      ],
      steps: [
        { q: "Good morning! Where are you flying to today?", h: "值机员问你要飞往哪里。", chips: ["I'm flying to Beijing.", "I'm going to Shanghai.", "I have a flight to Guangzhou."] },
        { q: "Great! May I see your passport, please?", h: "值机员请出示护照。", chips: ["Here you are.", "Sure, here it is."] },
        { q: "Thank you. How many bags are you checking in?", h: "值机员问你要托运几件行李。", chips: ["Just one, please.", "Two bags, please.", "I only have a carry-on."] },
        { q: "No problem. Would you prefer a window seat or an aisle seat?", h: "值机员问靠窗还是靠过道。", chips: ["A window seat, please.", "An aisle seat, please.", "I don't mind either."] },
        { q: "Here's your boarding pass. Your flight boards at Gate 12 at 10:30. Do you have any questions?", h: "值机员告知登机口和时间。", chips: ["Which gate is it again?", "What time does boarding start?", "No, that's all. Thank you!"] },
        { q: "Boarding starts at 10:00 at Gate 12. Have a pleasant flight!", h: "值机员确认信息并祝你飞行愉快。", chips: ["Thank you very much!", "Thanks! Have a nice day!"] }
      ],
      outro: "Perfect airport conversation! You got your boarding pass with no trouble. Have a great flight! ✈️"
    },
    {
      id: "supermarket", icon: "🛒", title: "Supermarket", zh: "超市购物",
      level: 1, tags: ["购物", "日常"],
      desc: "在超市询问商品位置、比较价格并结账。",
      vocab: ["where is", "milk", "bread", "fruit", "apple", "banana", "price", "expensive", "cheap", "checkout", "plastic bag", "receipt", "fresh", "aisle"],
      menu: [],
      bank: [
        { en: "Excuse me, where can I find the milk?", zh: "请问牛奶在哪里？" },
        { en: "How much are these apples?", zh: "这些苹果多少钱？" },
        { en: "That's a bit expensive.", zh: "有点贵。" },
        { en: "Could I have a plastic bag, please?", zh: "请给我一个塑料袋。" }
      ],
      steps: [
        { q: "Hello! Welcome to FreshMart. Can I help you find something?", h: "店员问你需要帮忙找什么。", chips: ["Yes, where can I find the milk?", "Where is the bread section?", "I'm looking for fresh fruit."] },
        { q: "The milk is in aisle 3. Would you like whole milk or low-fat milk?", h: "店员告知牛奶位置并问要全脂还是低脂。", chips: ["Whole milk, please.", "Low-fat milk, please.", "Whole milk is fine."] },
        { q: "Good choice! Is there anything else you need?", h: "店员问还需要别的吗。", chips: ["Yes, how much are these apples?", "No, that's all. Thanks.", "I also need some bread."] },
        { q: "The apples are 8 yuan per kilo. Is that okay?", h: "店员报价并询问是否可以。", chips: ["That's fine. I'll take two kilos.", "A bit expensive. Do you have cheaper ones?", "Okay, I'll take some."] },
        { q: "Sure! Will that be all for today?", h: "店员确认购物清单。", chips: ["Yes, that's everything.", "That's all, thank you."] },
        { q: "Your total is 46 yuan. Would you like a plastic bag?", h: "店员报总价并问是否需要袋子。", chips: ["Yes, please.", "No, I brought my own bag.", "Yes, one bag please."] }
      ],
      outro: "Great shopping! You found everything you needed. See you next time! 🛒"
    }
  ];

  /* ---------------- 自由对话应答库 ---------------- */
  var FREE = {
    openers: [
      "Hi there! It's so nice to chat with you. How's your day going?",
      "Hello! How are you feeling today?",
      "Hey! Great to see you. What did you do this morning?",
      "Hi! I was just wondering — what kind of weather do you like best?",
      "Hello there! Do you have any fun plans for today?"
    ],
    followups: [
      "Oh, that sounds nice! What do you like about it?",
      "Interesting! Tell me more about that.",
      "Wow, really? How come?",
      "I see. And how do you feel about that?",
      "That's cool! Can you give me an example?",
      "Got it. Is that something you do often?",
      "Nice! What's your favorite part of that?"
    ],
    topicQs: [
      "By the way, what kind of music do you like?",
      "Do you enjoy cooking? What's your favorite dish to make?",
      "What do you usually do to relax after a busy day?",
      "Do you have a favorite movie? Why do you like it?",
      "If you could travel anywhere this weekend, where would you go?",
      "Are you a morning person or a night person?",
      "What's your favorite season, and why?",
      "Do you prefer reading books or watching movies?",
      "What food from your hometown would you recommend to a foreigner?"
    ]
  };

  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  /* 意图分类器（自由对话用） */
  function classify(text) {
    var t = " " + text.toLowerCase() + " ";
    var hits = [];
    function has(arr) { for (var i = 0; i < arr.length; i++) { if (t.indexOf(arr[i]) >= 0) return true; } return false; }

    if (/\b(hi|hello|hey|yo|good morning|good afternoon|good evening|nice to meet you|how do you do)\b/.test(t)) hits.push("greet");
    if (/\bhow are you|how's it going|how is it going|how are things|what's up|whats up\b/.test(t)) hits.push("howare");
    if (/\b(thank|thanks|thx|cheers|appreciate)\b/.test(t)) hits.push("thanks");
    if (/\b(bye|goodbye|see you|see ya|good night|take care|have a nice day|have a good one)\b/.test(t)) hits.push("bye");
    if (/\b(slow|slower|speak slowly|too fast)\b/.test(t)) hits.push("slow");
    if (/\b(repeat|again|one more time|say it again)\b/.test(t)) hits.push("again");
    if (/\b(what do you mean|mean|meaning|translate|how do you say|what does .+ mean|i don't understand|didn't catch)\b/.test(t)) hits.push("confuse");
    if (/\b(i don't know|not sure|no idea)\b/.test(t)) hits.push("dontknow");
    if (/\b(yes|yeah|yep|sure|ok|okay|of course|absolutely|definitely|right|that's right|correct|i agree|me too|true)\b/.test(t)) hits.push("yes");
    if (/\b(no|nope|nah|not really|i don't think|never)\b/.test(t)) hits.push("no");
    if (/\b(happy|good|great|fine|well|wonderful|awesome|amazing|excellent|fantastic|not bad|pretty good|nice|love|like|enjoy|glad|excited)\b/.test(t)) hits.push("pos");
    if (/\b(tired|bad|sad|angry|hungry|thirsty|stressed|terrible|awful|sick|exhausted|busy|bored|upset|annoyed|not good)\b/.test(t)) hits.push("neg");
    if (/\b(weather|sunny|rain|rainy|cloudy|hot|cold|snow|windy|warm|storm|temperature)\b/.test(t)) hits.push("weather");
    if (/\b(food|eat|breakfast|lunch|dinner|delicious|tasty|restaurant|coffee|tea|drink|hungry|cook|dish|noodle|rice)\b/.test(t)) hits.push("food");
    if (/\b(movie|film|watch|show|series|cinema|actor|netflix)\b/.test(t)) hits.push("movie");
    if (/\b(music|song|sing|concert|guitar|piano|singer|band)\b/.test(t)) hits.push("music");
    if (/\b(sport|basketball|soccer|football|tennis|game|match|run|running|exercise|gym|team|swim|badminton)\b/.test(t)) hits.push("sport");
    if (/\b(hobby|free time|spare time|weekend|interesting|like to|enjoy|favorite|favourite)\b/.test(t)) hits.push("hobby");
    if (/\b(work|job|office|meeting|boss|company|colleague|career)\b/.test(t)) hits.push("work");
    if (/\b(study|learn|english|school|class|teacher|exam|test|homework|lesson|university|college)\b/.test(t)) hits.push("study");
    if (/\b(family|mom|mother|dad|father|brother|sister|parent|kid|child|wife|husband|grandma|grandpa)\b/.test(t)) hits.push("family");
    if (/\b(travel|trip|vacation|holiday|tourist|visit|fly|plane|flight|train|abroad|beach|mountain)\b/.test(t)) hits.push("travel");
    if (/\b(from .+|live in|come from|shenzhen|beijing|shanghai|guangzhou|china|city|country)\b/.test(t)) hits.push("aboutme");
    if (/\b(plan|go to|tomorrow|this weekend|going to|will |next week|tonight|this evening)\b/.test(t)) hits.push("plan");
    if (/\b(i think|i believe|in my opinion|what do you think|how about|do you think)\b/.test(t)) hits.push("opinion");
    if (/\b(what|where|when|why|who|how)\b/.test(t)) hits.push("question");
    return hits;
  }

  var RES = {
    greet: ["Hello! It's lovely to see you.", "Hi again! I'm really glad we're talking.", "Hey! So nice to chat with you."],
    howare: ["I'm doing great, thank you for asking! How about you?", "Pretty good, thanks! And you?", "I'm wonderful, thank you! Tell me about yourself."],
    thanks: ["You're very welcome!", "Anytime! I enjoy talking with you.", "My pleasure!"],
    bye: ["Goodbye! It was so nice talking with you. Practice makes perfect!", "See you later! Keep up the great work!", "Take care! Come back soon for more practice!"],
    yes: ["Great!", "Awesome!", "I love to hear that!", "Wonderful!"],
    no: ["I see. That's totally fine.", "Okay, got it!", "No worries at all."],
    pos: ["That's wonderful to hear!", "I'm so glad! You sound really positive.", "That makes me happy too!"],
    neg: ["Oh no, I'm sorry to hear that. I hope it gets better soon!", "That sounds tough. Hang in there!", "I understand. Sometimes we all have days like that."],
    slow: ["Of course! Let me say it more slowly: I said — how is your day going? 😊 Take your time.", "Sure! I'll speak more slowly. Ready? Let's try again."],
    again: ["No problem! I'll say it again: how is your day going? 😊", "Of course! Listen again, and take your time."],
    confuse: ["Great question! It means you can ask me anything in English, and I'll respond. Don't worry about mistakes — I'm here to help! 😊", "Good idea to ask! You can just say whatever comes to mind, even simple sentences. Let's keep going!"],
    dontknow: ["No worries! How about this — tell me something simple, like what you ate today? 😊", "That's okay! Let's try an easy topic. Do you like pets?"],
    weather: ["Oh, I love talking about weather! Do you prefer sunny days or rainy days?", "Interesting! Does the weather affect your mood?"],
    food: ["Mmm, now I'm hungry! What's your favorite food of all time?", "I love trying local food! What dish would you recommend from your city?"],
    movie: ["I'm a big movie fan too! What kind of movies make you laugh the most?", "Nice! Do you prefer watching movies at home or in the cinema?"],
    music: ["Music is such a great topic! Do you like to sing along when you listen to songs?", "Cool! Does music help you relax or focus?"],
    sport: ["Sports are a great way to stay healthy! Do you play sports, or do you prefer watching them?", "Nice! Do you feel energetic after exercising?"],
    hobby: ["Hobbies make life colorful! How did you get into that hobby?", "That's a lovely hobby! Do you do it alone or with friends?"],
    work: ["Work can be busy, right? What do you enjoy most about your job?", "Sounds interesting! Is your work stressful sometimes?"],
    study: ["Learning is a journey! What subject do you enjoy the most?", "That's great! Do you think learning English is hard?"],
    family: ["Family is so important! Do you have a big family?", "That sounds lovely! Do you often spend time together on weekends?"],
    travel: ["Traveling opens the mind! What's the best place you've ever visited?", "I'd love to hear more! Do you prefer beach holidays or city trips?"],
    aboutme: ["That's really interesting! What's the best thing about your city?", "Nice to know! Do you think you'll stay there for a long time?"],
    plan: ["Plans sound exciting! What part are you looking forward to the most?", "Nice plan! Do you usually make plans early or decide at the last minute?"],
    opinion: ["That's a thoughtful point of view! What makes you feel that way?", "I appreciate you sharing your opinion. Interesting perspective!"],
    question: ["Good question! Well, I'd say it depends. What do you think?", "Hmm, let me think! I believe every experience teaches us something. How about you?"]
  };

  function chatReply(userText, turnCount) {
    var hits = classify(userText);
    var said;
    /* 优先级顺序 */
    if (hits.indexOf("bye") >= 0) { said = pick(RES.bye); return { say: said, over: true }; }
    if (hits.indexOf("slow") >= 0) return { say: pick(RES.slow) };
    if (hits.indexOf("again") >= 0) return { say: pick(RES.again) };
    if (hits.indexOf("confuse") >= 0) return { say: pick(RES.confuse) };
    if (hits.indexOf("dontknow") >= 0) return { say: pick(RES.dontknow) };
    if (hits.indexOf("greet") >= 0 && hits.indexOf("howare") < 0) said = pick(RES.greet);
    else if (hits.indexOf("howare") >= 0) said = pick(RES.howare) + " " + pick(FREE.topicQs);
    else if (hits.indexOf("thanks") >= 0) said = pick(RES.thanks);
    else if (hits.indexOf("no") >= 0 && hits.indexOf("yes") < 0) said = pick(RES.no) + " " + pick(FREE.topicQs);
    else if (hits.indexOf("yes") >= 0) said = pick(RES.yes) + " " + pick(FREE.followups);
    else if (hits.indexOf("neg") >= 0) said = pick(RES.neg);
    else if (hits.indexOf("pos") >= 0) said = pick(RES.pos) + " " + pick(FREE.followups);

    if (!said) {
      /* 按主题回复 */
      var topics = ["weather", "food", "movie", "music", "sport", "hobby", "work", "study", "family", "travel", "aboutme", "plan", "opinion"];
      for (var i = 0; i < topics.length; i++) {
        if (hits.indexOf(topics[i]) >= 0) { said = pick(RES[topics[i]]); break; }
      }
    }
    if (!said) {
      /* 无命中：先共情/接话，再引一个新话题 */
      if (turnCount % 2 === 0) said = pick(RES.opinion);
      else said = pick(FREE.followups);
      said += " " + pick(FREE.topicQs);
    }
    /* 避免过度问答：随机并入一个话题问题 */
    if (said.length < 40 && Math.random() < 0.5 && hits.indexOf("question") < 0 && hits.indexOf("greet") >= 0) {
      said += " " + pick(FREE.topicQs);
    }
    return { say: said, over: false };
  }

  /* ---------------- 导出 ---------------- */
  window.DailyTalkData = {
    scenarios: SCENARIOS,
    free: FREE,
    chatReply: chatReply,
    classify: classify,
    pick: pick
  };
})();
