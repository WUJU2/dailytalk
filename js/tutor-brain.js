/* =========================================================
 * DailyTalk · 外教对话大脑（tutor-brain.js）
 * 目标：让 Emma「接得住话」，不再答非所问
 *   1. 内容提取：把你话里的关键内容复述回去（mirror）
 *   2. 话题记忆：记住刚聊的话题，短答（"noodles."）也能顺着聊
 *   3. 正面作答：你提问时 Emma 先给答案，再反问，而不是躲开
 *   4. 防重复：同一句回应不会连着说两遍
 *   5. 场景槽位：一次说全（中杯/冰的/带走）会自动跳过已问过的步骤
 * 纯前端规则引擎，无需联网，兼容 ES5。
 * ========================================================= */
(function () {
  "use strict";

  /* ---------------- 基础工具 ---------------- */
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function L(en, zh) { return { en: en, zh: zh || "" }; }
  function words(t) { return (t || "").trim().split(/\s+/).filter(Boolean); }
  function wc(t) { return words(t).length; }
  function hasCJK(t) { return /[\u4e00-\u9fa5]/.test(t || ""); }
  function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }
  /* 从句：不截成半句，保留最多 n 个词 */
  function tidyClause(s, n) {
    s = (s || "").replace(/\s+/g, " ").trim();
    s = s.replace(/[.。]+$/, "");
    return s.split(/\s+/).slice(0, n || 12).join(" ");
  }

  /* 防重复取词：同一个 key 下不重复，用尽后重置 */
  var used = {};
  function fresh(pool, key) {
    key = key || "_";
    if (!used[key]) used[key] = {};
    var avail = [], i;
    for (i = 0; i < pool.length; i++) { if (!used[key][pool[i].en]) avail.push(pool[i]); }
    if (!avail.length) { used[key] = {}; avail = pool.slice(); }
    var it = pick(avail);
    used[key][it.en] = 1;
    return it;
  }
  function resetMemory() { used = {}; }

  /* ---------------- 内容提取（mirror） ---------------- */
  var PATTERNS = [
    /i\s+(?:really\s+|usually\s+|often\s+|sometimes\s+|just\s+)?(?:like|love|enjoy|prefer|adore|hate|dislike|am into|am learning|am studying|am reading|am watching|am playing|am making|want|need|miss)\s+([^.,!?;]{2,44})/i,
    /i\s+(?:went|go|am going|will go|would go|usually go|flew|traveled|travelled)\s+to\s+([^.,!?;]{2,44})/i,
    /i\s+(?:have|had|got|bought|just got|ordered|cooked|made)\s+(?:a|an|some|my)?\s*([^.,!?;]{2,44})/i,
    /my\s+favou?rite\s+(?:\w+\s+)?is\s+([^.,!?;]{2,44})/i,
    /i(?:'m| am)\s+from\s+([^.,!?;]{2,44})/i,
    /i(?:'m| am)\s+(?:a|an)\s+([^.,!?;]{2,44})/i
  ];
  var BAD_X = /^(it|that|this|them|they|he|she|him|her|us|you|me|my|there|here|so|very|really|too|also|just|not|no|yes|ok|okay|fine|good|great|nothing|anything|something|sure|a lot|so so)$/i;

  function tidyX(s) {
    s = (s || "").replace(/[^A-Za-z0-9'\-\s]+/g, " ").replace(/\s+/g, " ").trim();
    /* 去掉从句连接词后的内容，避免截出半句 */
    s = s.split(/\s+(?:because|but|so|though|although|which|when|that|and then|and i|and we)\s+/i)[0].trim();
    s = s.replace(/\b(a|an|the|some|my|your|very|really|so|too|much|quite|also|just|about|a lot)\b\s*$/gi, "").trim();
    s = s.split(/\s+/).slice(0, 5).join(" ").trim();
    if (!s || s.length < 3) return null;
    if (BAD_X.test(s)) return null;
    return s;
  }

  function mirror(text) {
    var i, m;
    for (i = 0; i < PATTERNS.length; i++) {
      m = text.match(PATTERNS[i]);
      if (m) { var x = tidyX(m[1]); if (x) return x; }
    }
    /* 短答（1–3 词）当作话题对象，如 "noodles." / "hiking" */
    var w = words(text.replace(/[^A-Za-z0-9'\-\s]/g, " "));
    if (w.length && w.length <= 3) {
      var cand = tidyX(w.join(" "));
      var STOP = /^(i|i'?m|i am|we|you|he|she|they|it|yeah|yep|nope|hmm|well|and|but|because|maybe|later|nothing much|not much|so so|fine|ok|okay|good|great|nice|busy|tired|hungry|sleepy|happy|sad|yes|no|sure|thanks|thank you)$/i;
      if (cand && !STOP.test(cand) && !/^(i|i'?m|i am|we|we'?re|you|he|she|they)\b/i.test(cand)) return cand;
    }
    return null;
  }

  /* ---------------- 话题库（按优先级，越靠前越具体） ----------------
   * kws 触发词 / comments 复述式回应 / follows 相关追问
   * qa 被反问时的正面回答 / fav 被问"最喜欢"时的答案
   * ------------------------------------------------------------ */
  var TOPICS = [
    { id: "pets", kws: /(pet|pets|\bdog\b|puppy|\bcat\b|kitten|bird|fish|rabbit|hamster|turtle|my dog|my cat)/i,
      comments: [L("{x}! I love animals — tell me more!", "{x}！我很喜欢动物，多说一点～"),
                 L("Oh, {x} — how lovely!", "哦，{x}，真可爱！"),
                 L("{x}? That's adorable. I wish I could meet it!", "{x}？太可爱了，我也想见见！")],
      follows: [L("How long have you had it?", "养了多久了？"),
                L("What's its name? Does it do anything funny?", "它叫什么？有什么好玩的事吗？"),
                L("Who takes care of it at home?", "平时谁照顾它？"),
                L("Do you like cats or dogs better?", "你更喜欢猫还是狗？")],
      qa: L("I do, actually! I have a cat named Coco — lazy but lovely. Do you have any pets?", "有的！我养了只猫叫 Coco，很懒但很可爱。你养宠物吗？"),
      fav: L("cats, definitely — they're so calm", "猫，肯定选猫，它们很安静") },

    { id: "food", kws: /(food|eat|ate|lunch|dinner|breakfast|delicious|tasty|restaurant|cook|cooking|dish|noodle|noodles|rice|dumpling|dumplings|hotpot|snack|dessert|cake|pizza|spicy|hungry)/i,
      comments: [L("{x}? Mmm, now I'm hungry!", "{x}？我馋了！"),
                 L("You mentioned {x} — that sounds delicious!", "你提到 {x}，听起来很好吃！"),
                 L("{x}! Food is one of my favorite topics.", "{x}！美食是我最喜欢的话题之一。")],
      follows: [L("Is it spicy or mild?", "辣还是不辣？"),
                L("Do you cook it yourself or eat out?", "你自己做还是出去吃？"),
                L("What's your favorite meal of the day?", "你一天中最喜欢哪一餐？"),
                L("What food from your city would you recommend to a foreigner?", "你会给外国人推荐家乡的哪道菜？")],
      qa: L("I love noodles and anything spicy! Cooking is one of my hobbies. What's your favorite food?", "我喜欢面条和辣的东西！做饭是我的爱好之一。你最爱吃什么？"),
      fav: L("noodles — I could eat them every day", "面条，我每天吃都不腻") },

    { id: "coffee", kws: /(coffee|latte|cappuccino|americano|espresso|milk tea|bubble tea|drink|juice)/i,
      comments: [L("{x} — good taste! I need mine every morning too.", "{x}，品味不错！我每天早上也要来一杯。"),
                 L("{x}? Nice. Are you a regular at a café near you?", "{x}？你常去附近哪家店吗？")],
      follows: [L("How many cups do you drink a day?", "你一天喝几杯？"),
                L("Do you prefer it hot or iced?", "你喜欢热的还是冰的？"),
                L("Is there a nice café near your home?", "你家附近有好喝的店吗？")],
      qa: L("Coffee, for sure — one cup every morning! What about you?", "当然是咖啡，每天早上都要一杯！你呢？"),
      fav: L("a latte in the morning", "早上的一杯拿铁") },

    { id: "weather", kws: /(weather|sunny|rain|rainy|cloudy|snow|snowy|windy|warm|freezing|storm|humid|temperature|season|spring|summer|autumn|fall|winter)/i,
      comments: [L("{x}? The weather really changes our mood, doesn't it?", "{x}？天气真的会影响心情。"),
                 L("Ah, {x} — thanks for the weather report!", "啊，{x}，谢谢你播报天气！")],
      follows: [L("Do you prefer sunny days or rainy days?", "你更喜欢晴天还是雨天？"),
                L("What's the weather like in your city right now?", "你那儿现在天气怎么样？"),
                L("Does the weather change what you do on weekends?", "天气会影响你周末的安排吗？")],
      qa: L("I love sunny days — they give me energy. What about you?", "我喜欢晴天，让人有精神。你呢？"),
      fav: L("sunny autumn days", "秋日的晴天") },

    { id: "movie", kws: /(movie|movies|film|films|cinema|netflix|series|drama|actor|actress|documentary|cartoon|anime)/i,
      comments: [L("{x}? I'm a big movie fan too!", "{x}？我也是影迷！"),
                 L("{x} — great choice for a relaxing evening!", "{x}，很适合放松的晚上看！")],
      follows: [L("Who was your favorite character?", "你最喜欢哪个角色？"),
                L("Do you prefer the cinema or watching at home?", "你喜欢去电影院还是在家看？"),
                L("What kind of endings do you like best?", "你喜欢哪种结局？")],
      qa: L("I love comedies and space movies. What about you?", "我喜欢喜剧和太空题材。你呢？"),
      fav: L("space movies like Interstellar", "像《星际穿越》那样的太空片") },

    { id: "music", kws: /(music|song|songs|sing|singing|concert|guitar|piano|singer|band|album|playlist|kpop)/i,
      comments: [L("{x}! Music is such a great topic.", "{x}！音乐真是个好话题。"),
                 L("{x} — nice! Does it help you relax?", "{x}，不错！它让你放松吗？")],
      follows: [L("Who is your favorite singer or band?", "你最喜欢的歌手或乐队是谁？"),
                L("Do you sing along when you listen?", "听的时候会跟着唱吗？"),
                L("Do you listen to English songs to practice English?", "你会听英文歌练英语吗？")],
      qa: L("I like pop and jazz — I always listen while I cook. How about you?", "我喜欢流行和爵士，做饭时总在听。你呢？"),
      fav: L("jazz and pop", "爵士和流行") },

    { id: "sport", kws: /(sport|sports|basketball|soccer|football|tennis|badminton|running|jog|gym|exercise|workout|swim|swimming|yoga|hiking|climbing|cycling|marathon)/i,
      comments: [L("{x} keeps you healthy — that's wonderful!", "{x} 能让你保持健康，太棒了！"),
                 L("{x}? Nice! How often do you do it?", "{x}？不错！你多久做一次？")],
      follows: [L("Do you do it alone or with friends?", "你一个人做还是和朋友一起？"),
                L("How do you feel after exercising?", "运动完感觉怎么样？"),
                L("What got you started?", "你是怎么开始的？")],
      qa: L("I like swimming and yoga — they help me relax. Do you play any sports?", "我喜欢游泳和瑜伽，很解压。你做什么运动吗？"),
      fav: L("swimming", "游泳") },

    { id: "reading", kws: /(book|books|read|reading|novel|story|stories|magazine|library|comic|author)/i,
      comments: [L("{x} — reading opens so many doors!", "{x}，阅读能打开很多扇门！"),
                 L("{x}? Tell me more — what's the best part?", "{x}？说说看，最精彩的是什么？")],
      follows: [L("Do you read paper books or on your phone?", "你看纸质书还是电子书？"),
                L("When do you usually find time to read?", "你一般什么时候看书？"),
                L("Would you recommend it to me?", "你会推荐我看吗？")],
      qa: L("Yes! I read before bed almost every night. What about you?", "喜欢！我几乎每晚睡前都读。你呢？"),
      fav: L("short stories before bed", "睡前读短篇") },

    { id: "games", kws: /(game|games|gaming|video game|mobile game|board game|chess|puzzle|console|ps5|xbox|switch)/i,
      comments: [L("{x} — games are fun, and a great way to relax.", "{x}，游戏好玩又解压。"),
                 L("{x}? Do you play to relax or to win?", "{x}？你是为了放松还是为了赢？")],
      follows: [L("How often do you play?", "你多久玩一次？"),
                L("Do you play with friends online?", "你会和朋友线上一起玩吗？"),
                L("What's the hardest level you've beaten?", "你通过最难的关卡是哪个？")],
      qa: L("I play a few mobile games to relax. What about you?", "我会玩些手机游戏放松一下。你呢？"),
      fav: L("simple puzzle games", "简单的解谜游戏") },

    { id: "travel", kws: /(travel|trip|vacation|holiday|tourist|visit|visited|flight|abroad|beach|mountain|hotel|airport|sightseeing)/i,
      comments: [L("{x}? Traveling opens the mind — I'd love to hear about it!", "{x}？旅行开阔眼界，我想听听！"),
                 L("{x}! That sounds like a wonderful experience.", "{x}！听起来是很棒的体验。")],
      follows: [L("What was the best part of the trip?", "这趟最棒的部分是什么？"),
                L("Who did you go with?", "你和谁一起去的？"),
                L("Where would you go next if you could?", "如果还能去，下一站想去哪？")],
      qa: L("I love traveling! Japan and Italy are on my list. Where would you go?", "我很爱旅行！日本和意大利都在我的清单上。你想去哪儿？"),
      fav: L("Japan — the food and the temples", "日本，为了美食和寺庙") },

    { id: "work", kws: /(work|job|office|meeting|boss|company|colleague|career|business|client|project|deadline|overtime)/i,
      comments: [L("{x}? Work can be busy, but it sounds interesting!", "{x}？工作虽忙，但听起来有意思！"),
                 L("Thanks for sharing about your work — {x}.", "谢谢你分享工作上的事——{x}。")],
      follows: [L("What do you enjoy most about your job?", "你最喜欢工作的哪一点？"),
                L("Is your work stressful sometimes? How do you handle it?", "工作有压力时会怎么调节？"),
                L("Do you work from home or at the office?", "你在家办公还是在公司？")],
      qa: L("I'm an English tutor, so I talk all day — and I love it! What do you do?", "我是英语外教，整天说话，我很喜欢！你是做什么的？"),
      fav: L("teaching English", "教英语") },

    { id: "study", kws: /(study|studying|learn|learning|english|school|class|teacher|exam|test|homework|lesson|university|college|course|grade)/i,
      comments: [L("{x}? Learning is a journey — keep going!", "{x}？学习是场旅程，继续加油！"),
                 L("{x} — that's great. It'll open many doors for you.", "{x}，很不错，会给你打开很多机会。")],
      follows: [L("Do you think learning English is hard?", "你觉得学英语难吗？"),
                L("What's the best way you've found to practice?", "你找到最好的练习方式是什么？"),
                L("How much time can you study each day?", "你每天能学多久？")],
      qa: L("I keep learning too — right now, a little Chinese! What are you studying?", "我也一直在学，最近在学一点中文！你在学什么？"),
      fav: L("languages", "语言") },

    { id: "family", kws: /(family|mom|mother|mum|dad|father|brother|sister|parents|kid|kids|child|children|son|daughter|wife|husband|grandma|grandpa|grandmother|grandfather|uncle|aunt|cousin)/i,
      comments: [L("Thanks for telling me about {x} — family matters so much.", "谢谢你告诉我关于 {x} 的事，家人很重要。"),
                 L("{x}? That sounds lovely!", "{x}？听起来很温馨！")],
      follows: [L("Do you have a big family?", "你家人多吗？"),
                L("Do you often spend time together on weekends?", "周末常一起聚吗？"),
                L("Who are you closest to in your family?", "家里你和谁最亲？")],
      qa: L("I have a small family, but we're close and talk every week. What about you?", "我家人不多，但很亲密，每周都联系。你呢？"),
      fav: L("weekend dinners together", "周末一起吃饭") },

    { id: "friends", kws: /(friend|friends|bestie|classmate|neighbor|neighbour|hang out|get together|gathering)/i,
      comments: [L("{x}? Good friends make life much better.", "{x}？好朋友让生活美好很多。"),
                 L("{x} — nice! Friendship needs time, right?", "{x}，不错！友情需要时间经营。")],
      follows: [L("How did you two meet?", "你们怎么认识的？"),
                L("What do you usually do together?", "你们常一起做什么？"),
                L("Do you prefer small groups or big parties?", "你喜欢小聚还是大party？")],
      qa: L("I love meeting friends for coffee and a long chat. What about you?", "我喜欢约朋友喝咖啡慢慢聊。你呢？"),
      fav: L("casual coffee chats", "随意的咖啡闲聊") },

    { id: "shopping", kws: /(shop|shopping|buy|bought|store|mall|market|price|discount|sale|clothes|shoes|bag)/i,
      comments: [L("{x}? Shopping is always fun — did you get a good deal?", "{x}？买东西挺开心，划算吗？"),
                 L("{x} — nice find!", "{x}，淘到好东西了！")],
      follows: [L("Do you prefer shopping online or in stores?", "你更喜欢网购还是逛店？"),
                L("Do you plan what to buy, or just look around?", "你会列清单还是随便逛？"),
                L("What was the last thing you bought?", "你最近买的是什么？")],
      qa: L("I shop online mostly — it saves time! What about you?", "我大多网购，省时间！你呢？"),
      fav: L("buying books and coffee", "买书和咖啡") },

    { id: "health", kws: /(health|healthy|sick|ill|hospital|doctor|medicine|headache|fever|pain|hurt|insomnia|sleep well)/i,
      comments: [L("{x}? Please take good care of yourself — health comes first.", "{x}？一定要保重，健康第一。"),
                 L("I'm sorry to hear about {x}. I hope you feel better soon!", "听到 {x} 我很难过，希望你快点好起来！")],
      follows: [L("Have you been sleeping enough?", "最近睡眠够吗？"),
                L("What do you do to relax and rest?", "你怎么放松休息？"),
                L("Do you exercise to stay healthy?", "你会运动保持健康吗？")],
      qa: L("I try to walk every day and sleep eight hours. What helps you stay healthy?", "我尽量每天散步、睡够八小时。你靠什么保持健康？"),
      fav: L("walking and good sleep", "散步和充足睡眠") },

    { id: "tech", kws: /(phone|iphone|android|computer|laptop|app|apps|internet|online|website|social media|wechat|ai|robot)/i,
      comments: [L("{x}? Technology is everywhere now, right?", "{x}？现在科技无处不在。"),
                 L("{x} — interesting! I use it every day too.", "{x}，有意思，我每天也在用。")],
      follows: [L("How much time do you spend on your phone?", "你每天花多少时间在手机上？"),
                L("Do apps help you learn English?", "有帮到学英语的app吗？"),
                L("What's the most useful app for you?", "你觉得最有用的app是哪个？")],
      qa: L("I use my phone a lot — mostly for music and podcasts. What about you?", "我手机用得不少，主要听音乐和播客。你呢？"),
      fav: L("music apps", "音乐类app") },

    { id: "traffic", kws: /(traffic|commute|subway|metro|bus|drive|driving|taxi|ride|jam|rush hour)/i,
      comments: [L("{x}? Commuting can be tiring in a big city.", "{x}？在大城市通勤挺累的。"),
                 L("{x} — I see. How long does it take you?", "{x}，原来如此，要多久呢？")],
      follows: [L("How long is your commute?", "你通勤要多久？"),
                L("Do you listen to anything on the way?", "路上会听点什么吗？"),
                L("Would you rather drive or take the subway?", "你更愿意开车还是坐地铁？")],
      qa: L("My commute is short — I usually walk. What about yours?", "我通勤很短，一般走路。你呢？"),
      fav: L("walking instead of driving", "走路而不是开车") },

    { id: "housework", kws: /(housework|cleaning|laundry|washing|tidy|chores|vacuum|grocery)/i,
      comments: [L("{x}? Housework never ends, does it?", "{x}？家务真是做不完。"),
                 L("{x} — good job keeping things in order!", "{x}，把家里打理得很好！")],
      follows: [L("Do you share the housework with your family?", "家务和家人分担吗？"),
                L("Which chore do you dislike the most?", "你最讨厌哪样家务？"),
                L("When do you usually do the laundry?", "你一般什么时候洗衣服？")],
      qa: L("I do laundry on weekends and cook almost every day. What about you?", "我周末洗衣服，几乎每天做饭。你呢？"),
      fav: L("cooking, not cleaning", "做饭，不是打扫") },

    { id: "festival", kws: /(birthday|festival|spring festival|new year|christmas|gift|present|celebrate|anniversary|wedding)/i,
      comments: [L("{x}? Celebrations make great memories!", "{x}？庆祝能留下美好回忆！"),
                 L("{x} — how lovely! I'd love to hear more.", "{x}，真好！我想多听听。")],
      follows: [L("How do you usually celebrate it?", "你一般怎么庆祝？"),
                L("Who did you spend it with?", "你和谁一起过的？"),
                L("What's the best gift you've ever received?", "你收到过最好的礼物是什么？")],
      qa: L("I love Christmas — the lights and the food! What's your favorite festival?", "我喜欢圣诞节的灯和美食！你最喜欢什么节日？"),
      fav: L("Christmas", "圣诞节") },

    { id: "hobby", kws: /(hobby|hobbies|free time|spare time|painting|drawing|dancing|photography|gardening|fishing|craft)/i,
      comments: [L("{x}? Hobbies make life colorful!", "{x}？爱好让生活多彩！"),
                 L("{x} — that's a lovely hobby. How did you get into it?", "{x}，很棒的爱好，你是怎么开始的？")],
      follows: [L("Do you do it alone or with friends?", "你一个人做还是和朋友一起？"),
                L("How often do you make time for it?", "你多久做一次？"),
                L("Does it help you relax?", "它能让你放松吗？")],
      qa: L("I love cooking and taking photos. What about you?", "我喜欢做饭和拍照。你呢？"),
      fav: L("cooking and photography", "烹饪和摄影") },

    { id: "plan", kws: /(plan|plans|weekend|tomorrow|tonight|next week|this evening|looking forward|schedule)/i,
      comments: [L("{x}? That sounds like a nice plan!", "{x}？听起来是个不错的计划！"),
                 L("{x} — planning ahead, that's smart!", "{x}，提前计划很聪明！")],
      follows: [L("What are you looking forward to the most?", "你最期待哪一部分？"),
                L("Who are you going with?", "你和谁一起去？"),
                L("Do you usually plan early or decide at the last minute?", "你习惯早计划还是临时决定？")],
      qa: L("This weekend I'm going to a small café and reading a book. What about you?", "这周末我打算去家小咖啡馆看书。你呢？"),
      fav: L("quiet café weekends", "安静的咖啡馆周末") },

    { id: "aboutme", kws: /(i live in|live in|i'm from|i am from|come from|my city|my hometown|shenzhen|beijing|shanghai|guangzhou|hangzhou|chengdu|china)/i,
      comments: [L("{x}? That's a great place! What's the best thing about it?", "{x}？那地方不错！最好的地方是什么？"),
                 L("{x} — nice! I'd love to visit someday.", "{x}，真好，我想去逛逛。")],
      follows: [L("What's the best thing about your city?", "你城市最棒的是什么？"),
                L("Is the food there famous?", "那儿的美食有名吗？"),
                L("How long have you lived there?", "你在那儿住多久了？")],
      qa: L("I'm from California — sunny beaches and big cities. Where are you from?", "我来自加州，阳光、海滩和大城市。你来自哪里？"),
      fav: L("California", "加州") }
  ];

  /* ---------------- 情绪 / 元意图 ---------------- */
  var SO = [
    { id: "bye", re: /(bye|goodbye|see you|see ya|good night|take care|have a nice day|talk to you later|i have to go|gotta go)/i,
      lines: [L("Goodbye! It was so nice talking with you. Practice makes perfect!", "再见！和你聊天很愉快，熟能生巧！"),
              L("See you later! You're doing really well.", "回头见！你做得很棒。"),
              L("Take care! Come back soon for more practice.", "保重！下次再来练。")] },
    { id: "slow", re: /(speak (more )?slowly|say it slowly|too fast|slow down|slower)/i,
      lines: [L("Of course! I'll speak more slowly — take your time. 😊", "当然！我说慢一点，不用急。"),
              L("Sure! Slower is better for practice. 😊", "好的！慢一点更适合练习。")] },
    { id: "again", re: /(say it again|say that again|repeat|one more time|pardon|come again)/i,
      lines: [L("No problem! Listen again — take your time. 😊", "没问题！再听一遍，慢慢来。"),
              L("Of course! Here it is one more time. 😊", "当然！再说一遍。")] },
    { id: "confuse", re: /(what do you mean|what does .{1,20} mean|i don'?t understand|didn'?t catch|not sure what you mean)/i,
      lines: [L("No worries! Let me put it in easier words. 😊", "别担心！我换简单点的说法。"),
              L("Good to ask! I'll use simpler English. 😊", "问得好！我用更简单的英语。")] },
    { id: "help", re: /(i don'?t know what to say|what should i say|how do i answer|i have no idea)/i,
      lines: [L("That's okay! Just say anything — even one word. Try 'I think...' and continue. 😊", "没关系！随便说，哪怕一个词。试试 \"I think...\"。"),
              L("No pressure! Use short sentences — mistakes are welcome here. 😊", "别有压力！用短句说，说错也没关系。")] },
    { id: "dontknow", re: /^(i don'?t know|not sure|no idea|dunno|i forget)[.!]?$/i,
      lines: [L("No worries! Let's try something easy — what did you eat today? 😊", "没关系！聊点简单的——你今天吃了什么？"),
              L("That's okay! Let's switch topics — do you like music? 😊", "没事！换个话题——你喜欢音乐吗？")] },
    { id: "greet", re: /(^|\s)(hi|hello|hey|yo|good morning|good afternoon|good evening|nice to meet you|how do you do)(\s|$|!|\.|,)/i,
      lines: [L("Hello! It's lovely to see you again.", "你好！又见到你真开心。"),
              L("Hi there! I'm really glad we're talking.", "你好！很高兴和你聊天。"),
              L("Hey! So nice to chat with you.", "嗨！和你聊天真好。")] },
    { id: "howare", re: /(how are you|how'?s it going|how is it going|how are things|what'?s up|whats up|how are you doing)/i,
      lines: [L("I'm doing great, thank you for asking! How about you?", "我很好，谢谢你关心！你呢？"),
              L("Pretty good, thanks! And you?", "挺好的，谢谢！你呢？"),
              L("I'm wonderful, thank you — I love our chats!", "我很好，谢谢，我很喜欢和你聊天！")] },
    { id: "fine", re: /^(i'?m|i am|i'?m doing|i am doing)\s+(fine|good|great|okay|ok|well|pretty good|not bad|doing (well|fine|good|great|okay))/i,
      lines: [L("That's great to hear!", "听到你这么说真好！"),
              L("Wonderful! I'm happy for you.", "太好了！我为你高兴。"),
              L("Nice! Sounds like a good day.", "很好！听起来今天不错。")] },
    { id: "thanks", re: /^(thank you|thanks|thank u|thx|thanks a lot|thanks so much|many thanks|thank you so much|cheers|appreciate it)[.!]?$/i,
      lines: [L("You're very welcome!", "不客气！"),
              L("Anytime! I really enjoy talking with you.", "随时！我很喜欢和你聊天。"),
              L("My pleasure! Keep up the great work.", "我的荣幸！继续保持。")] }
  ];

  var MOOD = [
    { id: "pos", re: /(i'?m (so )?(happy|excited|glad|delighted)|great day|amazing day|fantastic|wonderful day|in a good mood|so good today)/i,
      lines: [L("That's wonderful to hear! What made your day so good?", "听到这真好！是什么让你的今天这么棒？"),
              L("I'm so glad! You sound really positive today. What's the best part?", "我真高兴！你今天听着很积极，最好的部分是什么？")] },
    { id: "neg", re: /(tired|exhausted|stressed|stressful|sad|upset|annoyed|angry|terrible|awful|not good|too busy|busy day|so busy|no time|overwhelmed|worried|nervous|lonely|sick)/i,
      lines: [L("I'm sorry to hear that. You're doing your best, and that's enough. What's been taking your energy?", "听到这我很难过。你已经尽力了，这就够了。什么最耗你的精力？"),
              L("That sounds tough. Remember to take a short break for yourself. What usually helps you recharge?", "听起来很辛苦。记得给自己留点休息时间。什么能让你回血？"),
              L("I understand — we all have days like that. Want to talk about it, or shall we chat about something lighter?", "我懂，谁都有这样的日子。想聊聊，还是换个轻松点的？")] }
  ];

  /* ---------------- 你提问 → Emma 正面回答 ---------------- */
  var QA = [
    { re: /(who are you|what'?s your name|what is your name|your name|are you (a )?(robot|real|human|ai|machine))/i,
      a: [L("I'm Emma, your English tutor from California! I love helping people speak with confidence. And you — what's your name?", "我是 Emma，来自加州的英语外教！你叫什么名字？"),
          L("I'm Emma! I'm your friendly practice partner — real English, real conversation. What would you like to talk about?", "我是 Emma！我是你的练习伙伴。想聊点什么？")] },
    { re: /(where are you from|where do you live|where were you born)/i,
      a: [L("I'm from California, in the United States. It's sunny almost all year. Where are you from?", "我来自美国加州，那里几乎全年阳光。你来自哪里？")] },
    { re: /(how old are you|what'?s your age|your age)/i,
      a: [L("Haha, a lady never tells! Let's just say I've been teaching English for many years. Are you a student or working?", "哈哈，这个保密！我只说教了很多年英语。你在读书还是工作？")] },
    { re: /(what do you do|what'?s your job|your job|are you a teacher)/i,
      a: [L("I'm an English tutor — I talk with people like you all day, and I love it! What do you do?", "我是英语外教，每天和大家聊天，我很喜欢！你是做什么的？")] },
    { re: /(can you help|could you help|can you teach|can you explain|will you help)/i,
      a: [L("Yes, of course! That's exactly why I'm here. Say a sentence and I'll help you make it better. 😊", "当然可以！这正是我在这儿的原因。你说一句，我帮你改得更好。")] },
    { re: /(can you|could you|are you able to|do you know how to)/i,
      a: [L("Yes, I can! Let's practice it step by step. 😊 Try a sentence first.", "可以的！我们一步步练，你先说一句试试。"),
          L("Sure! Give it a try and I'll help you improve it. 😊", "当然！你说说看，我帮你改进。")] },
    { re: /(what time|what day|what'?s the date|what date)/i,
      a: [L("I don't have a clock here, but your phone knows! 😄 By the way — do you prefer morning or evening practice?", "我这儿没有时钟，你手机知道！你更喜欢早上还是晚上练？")] },
    { re: /(how much|how many|the price|expensive)/i,
      a: [L("In real life you'd ask 'How much is it?' — and they'll tell you. Want to try asking me something like that?", "现实中你可以问 'How much is it?'，对方就会告诉你。想试着问我一句吗？")] },
    { re: /(have you ever|did you ever|have you been)/i,
      a: [L("I have, actually — and I enjoyed it a lot! Have you tried it yourself?", "我还真试过，挺喜欢的！你自己试过吗？")] }
  ];

  /* 没有可复述内容时的中性接话（避免出现 "that?" 这类生硬表达） */
  var PLAIN = [
    L("I see!", "我明白！"), L("Nice!", "不错！"), L("Oh, lovely!", "哦，真好！"),
    L("Got it!", "明白了！"), L("That sounds nice!", "听起来不错！"), L("Interesting!", "有意思！")
  ];

  /* 兜底追问（与话题库互补，避免重复） */
  var GENERIC_Q = [
    L("By the way, what kind of music do you like?", "顺便问一下，你喜欢什么音乐？"),
    L("What do you usually do to relax after a busy day?", "忙完一天你一般怎么放松？"),
    L("Are you a morning person or a night person?", "你是早起型还是夜猫子？"),
    L("What's your favorite season, and why?", "你最喜欢什么季节，为什么？"),
    L("Do you prefer reading books or watching movies?", "你更喜欢看书还是看电影？"),
    L("If you could travel anywhere this weekend, where would you go?", "如果这周末能去任何地方，你想去哪儿？"),
    L("Do you like cooking? What's your favorite dish?", "你喜欢做饭吗？拿手菜是什么？")
  ];

  /* ---------- 开场问题（带话题 id，便于接住你的短答） ---------- */
  var OPEN_QS = [
    { topic: "food", en: "What's your favorite food?", zh: "你最喜欢吃什么？" },
    { topic: "music", en: "What kind of music do you like?", zh: "你喜欢什么类型的音乐？" },
    { topic: "pets", en: "Do you have any pets at home?", zh: "你家里养宠物吗？" },
    { topic: "sport", en: "Do you play any sports?", zh: "你做什么运动吗？" },
    { topic: "plan", en: "What did you do this morning?", zh: "你今天早上做了什么？" },
    { topic: "travel", en: "Where would you like to travel next?", zh: "你下次想去哪里旅行？" },
    { topic: "work", en: "How was your work today — busy or easy?", zh: "今天工作忙不忙？" },
    { topic: "movie", en: "Have you watched any good movies lately?", zh: "最近看了什么好电影吗？" },
    { topic: "hobby", en: "What do you like to do in your free time?", zh: "你空闲时喜欢做什么？" },
    { topic: "weather", en: "What's the weather like in your city today?", zh: "你那儿今天天气怎么样？" },
    { topic: "family", en: "Do you spend much time with your family?", zh: "你平时和家人相处多吗？" },
    { topic: "reading", en: "Do you like reading? What kind of books?", zh: "你喜欢读书吗？爱看哪类？" },
    { topic: "shopping", en: "Do you prefer shopping online or in stores?", zh: "你更喜欢网购还是逛实体店？" },
    { topic: "aboutme", en: "Tell me about your city — what's it like?", zh: "跟我说说你的城市吧，是什么样子？" },
    { topic: "coffee", en: "Do you drink coffee or tea in the morning?", zh: "你早上喝咖啡还是茶？" }
  ];
  function openQuestion() { return pick(OPEN_QS); }

  function classifyTopics(text) {
    var hits = [], i;
    for (i = 0; i < TOPICS.length; i++) { if (TOPICS[i].kws.test(text)) hits.push(TOPICS[i]); }
    return hits;
  }
  function topicById(id) {
    for (var i = 0; i < TOPICS.length; i++) { if (TOPICS[i].id === id) return TOPICS[i]; }
    return null;
  }
  function soById(id) {
    for (var i = 0; i < SO.length; i++) { if (SO[i].id === id) return SO[i]; }
    return null;
  }

  /* 把 "{x}! ..." 换成自然句子；没有内容可复述时优雅降级 */
  function fillX(line, x) {
    if (!line) return line;
    if (x) return cap(line.replace(/\{x\}/g, x));
    var s = line.replace(/^\s*\{x\}[^A-Za-z]*/, "").replace(/\{x\}/g, "that");
    return cap(s.trim());
  }

  /* =========================================================
   * 自由对话：生成 Emma 的回应
   * ctx: { openTopic, turn } → { say, zh, over, topic }
   * ========================================================= */
  function freeReply(rawText, ctx) {
    ctx = ctx || {};
    var text = (rawText || "").trim();
    var low = text.toLowerCase();
    var x = mirror(text);
    var topics = classifyTopics(text);

    /* 0) 中文输入 → 温和引导用英语 */
    if (hasCJK(text)) {
      var mixed = text.replace(/[\u4e00-\u9fa5]/g, " ").replace(/\s+/g, " ").trim();
      var l0 = fresh([
        L("I understand! Let's practice in English — even two or three words is enough. 😊", "我明白！我们用英语练一练，两三个词就够。"),
        L("Got it! Now try it in English — simple words are perfectly fine. 😊", "懂了！现在试着用英语说一遍，简单词就很好。")
      ], "zh");
      return { say: (mixed ? mixed + "! " : "") + l0.en, zh: l0.zh, over: false, topic: ctx.openTopic || null };
    }

    var i, r;

    /* 1) 告别 */
    if (soById("bye").re.test(low)) {
      var lb = fresh(soById("bye").lines, "bye");
      return { say: lb.en, zh: lb.zh, over: true };
    }
    /* 2) 元意图：慢一点 / 再说一遍 / 没听懂 / 不知道怎么答 */
    for (i = 1; i < SO.length; i++) {
      if (SO[i].id === "greet" || SO[i].id === "howare" || SO[i].id === "fine" || SO[i].id === "thanks") continue;
      if (SO[i].re.test(low)) {
        var ls = fresh(SO[i].lines, SO[i].id);
        return { say: ls.en, zh: ls.zh, over: false, topic: ctx.openTopic || null };
      }
    }
    /* 3) 情绪（优先于话题，先共情再说事） */
    if (wc(text) >= 2) {
      for (i = 0; i < MOOD.length; i++) {
        if (MOOD[i].re.test(low)) {
          var lm = fresh(MOOD[i].lines, "mood" + MOOD[i].id);
          return { say: lm.en, zh: lm.zh, over: false, topic: MOOD[i].id === "neg" ? "health" : ctx.openTopic || null };
        }
      }
    }
    /* 4) 寒暄 / 状态 / 道谢（短句社交） */
    for (i = 0; i < SO.length; i++) {
      if (SO[i].id === "greet" || SO[i].id === "howare" || SO[i].id === "fine" || SO[i].id === "thanks") {
        /* 继续 */
      } else { continue; }
      if (SO[i].re.test(low) && wc(text) <= 8) {
        var lsc = fresh(SO[i].lines, SO[i].id);
        var sayS = lsc.en, topicS = null;
        if (SO[i].id !== "thanks") {
          /* 寒暄/状态之后自然抛一个开场话题问题 */
          var oq0 = openQuestion();
          topicS = oq0.topic;
          sayS += " " + oq0.en;
        }
        return { say: sayS, zh: lsc.zh, over: false, topic: topicS };
      }
    }
    /* 5) 观点表达：I think / I believe / in my opinion */
    var opm = text.match(/^\s*i\s+(?:think|believe|feel|guess)\s+(.{3,80})/i) || text.match(/\bin my opinion[,:]?\s+(.{3,80})/i);
    if (opm) {
      var ox = tidyClause(opm[1], 12);
      var lo = fresh([
        L("That's a thoughtful point of view — you think " + ox + ". What makes you feel that way?", "这个观点很有想法——你认为" + ox + "。是什么让你这么想？"),
        L("I see what you mean: " + ox + ". Has it always been like that for you?", "我懂你的意思：" + ox + "。一直是这样吗？"),
        L("Good point! " + cap(ox) + " — that's worth thinking about. What led you to that idea?", "说得好！" + ox + "，值得想想。你是怎么有这个想法的？")
      ], "opinion");
      return { say: lo.en, zh: lo.zh, over: false, topic: "opinion" };
    }
    /* 6) 你提问 → 正面回答 */
    var isQ = /\?\s*$/.test(text) ||
      /^(what|where|when|who|why|which|how|do|does|did|are|is|can|could|would|will|should|have|has|may|tell me)\b/i.test(low);
    if (isQ) {
      /* 6a. 常见问题库 */
      for (i = 0; i < QA.length; i++) {
        if (QA[i].re.test(text)) {
          var la = fresh(QA[i].a, "qa" + i);
          return { say: la.en, zh: la.zh, over: false, topic: ctx.openTopic || null };
        }
      }
      /* 6b. "你最喜欢…？" → 给出具体答案 + 反问 */
      if (/favou?rite/i.test(low) && topics.length && topics[0].fav) {
        var tp0 = topics[0], fe = tp0.fav.en, fz = tp0.fav.zh;
        var dash = fe.indexOf("—");
        var what = dash > 0 ? fe.slice(0, dash).trim() : fe;
        var why = dash > 0 ? fe.slice(dash + 1).trim() : "";
        var zhMain = fz.split(/[，,]/)[0].trim();
        var sayFav = "My favorite? Probably " + what + (why ? " — " + why : "") + ". What about yours?";
        return { say: sayFav, zh: "我最爱的？大概是 " + zhMain + "。你呢？", over: false, topic: tp0.id };
      }
      /* 6c. 问题里含话题 → 用该话题的「个人答案」作答 */
      if (topics.length) {
        var tp = topics[0];
        if (tp.qa) return { say: tp.qa.en, zh: tp.qa.zh, over: false, topic: tp.id };
      }
      /* 6d. 泛问句：给态度 + 具体一点的内容，再反问 */
      var lq = fresh([
        L("Good question!" + (x ? " About " + x + " — I'd say" : " I'd say") + " it depends on the person. What do you think?", "好问题！" + (x ? "关于 " + x + "，" : "") + "我觉得因人而异。你怎么看？"),
        L("Hmm, interesting question!" + (x ? " I actually like " + x + " a lot." : "") + " What about you?", "嗯，有意思的问题！" + (x ? "其实我挺喜欢 " + x + " 的。" : "") + "你呢？")
      ], "qaGen");
      return { say: lq.en, zh: lq.zh, over: false, topic: ctx.openTopic || null };
    }
    /* 7) 话题命中 → 复述你的内容 + 顺着问 */
    if (topics.length) {
      var tp2 = topics[0];
      var fq = fresh(tp2.follows, "f_" + tp2.id);
      var cm = x ? fillX(fresh(tp2.comments, "c_" + tp2.id).en, x)
                 : fresh(PLAIN, "plain").en;
      return { say: cm + " " + fq.en, zh: fq.zh, over: false, topic: tp2.id };
    }
    /* 8) 是非 / 简短回应（先判断，避免把 "no" 当成话题内容） */
    if (/^(yes|yeah|yep|sure|ok|okay|of course|absolutely|right|correct|i agree|me too|sometimes|always)[.!]?$/i.test(low)) {
      var ly = fresh([L("Great!", "很好！"), L("Wonderful!", "太棒了！"), L("I love to hear that!", "听到这个真开心！")], "yes");
      var op2 = topicById(ctx.openTopic);
      if (op2) {
        var f3 = fresh(op2.follows, "f_" + op2.id);
        return { say: ly.en + " " + f3.en, zh: f3.zh, over: false, topic: op2.id };
      }
      var oq1 = openQuestion();
      return { say: ly.en + " " + oq1.en, zh: oq1.zh, over: false, topic: oq1.topic };
    }
    if (/^(no|nope|nah|not really|never|not much|nothing much)[.!]?$/i.test(low)) {
      var ln = fresh([L("That's totally fine!", "完全没关系！"), L("Okay, got it!", "好的，明白了！"), L("No worries at all.", "一点也不用担心。")], "no");
      var op3 = topicById(ctx.openTopic);
      if (op3) {
        var f4 = fresh(op3.follows, "f_" + op3.id);
        return { say: ln.en + " " + f4.en, zh: f4.zh, over: false, topic: op3.id };
      }
      var oq2 = openQuestion();
      return { say: ln.en + " " + oq2.en, zh: oq2.zh, over: false, topic: oq2.topic };
    }
    /* 9) 短答 + 上一条话题 → 顺着旧话题继续（不跑题） */
    if (wc(text) <= 5 && ctx.openTopic) {
      var op = topicById(ctx.openTopic);
      if (op) {
        var c2 = x ? fillX(fresh(op.comments, "c_" + op.id).en, x)
                   : fresh(PLAIN, "plain").en;
        var f2 = fresh(op.follows, "f_" + op.id);
        return { say: c2 + " " + f2.en, zh: f2.zh, over: false, topic: op.id };
      }
    }
    /* 10) 兜底：复述内容 + 自然追问 */
    var gq = fresh(GENERIC_Q, "genQ");
    if (x) {
      var lx = fresh([L("{x} — that sounds interesting! Tell me more.", "{x}，听起来有意思，多说一点。"),
                      L("You mentioned {x}. I'd love to hear more!", "你提到 {x}，我想多听一点！"),
                      L("Oh, {x}! That's a nice thing to talk about.", "哦，{x}！这是个不错的话题。")], "mirror");
      return { say: cap(lx.en.replace(/\{x\}/g, x)) + " " + gq.en, zh: gq.zh, over: false, topic: null };
    }
    var lg = fresh([L("I see! Please tell me more — I'm listening.", "我明白！请多说一点，我在听。"),
                    L("Thanks for sharing that. Can you say a bit more?", "谢谢你的分享，能再多说一点吗？"),
                    L("Interesting! Let's dig a little deeper — how do you feel about it?", "有意思！我们聊深一点——你感觉如何？")], "genFallback");
    return { say: lg.en + " " + gq.en, zh: gq.zh, over: false, topic: null };
  }

  /* =========================================================
   * 场景模式：槽位识别 + 跳步（一次说全就不再重复问）
   * ========================================================= */
  var SLOT_RES = [
    { id: "temp", ask: /(hot or iced|iced or hot|how would you like it)/i, yes: /(iced|ice\b|cold)/i, no: /\b(hot|warm)\b/i, yesVal: "iced", noVal: "hot" },
    { id: "size", ask: /(what size|which size|small, medium)/i, yes: /\b(small|medium|large|big|regular|extra large)\b/i, no: null, yesVal: null, noVal: null },
    { id: "togo", ask: /(for here or to go|to go|take ?away|eat in|dine in)/i, yes: /(to go|take ?away|take ?out)/i, no: /(for here|eat in|dine in)/i, yesVal: "to go", noVal: "for here" },
    { id: "pay", ask: /(how would you like to pay|pay by|cash or card|payment|how will you pay)/i, yes: /(by card|card|credit|visa|master|apple pay|wechat|alipay|mobile pay)/i, no: /\b(cash|banknote|bills)\b/i, yesVal: "card", noVal: "cash" },
    { id: "extra", ask: /(anything else|something to (eat|drink)|would you like .{0,20}(cake|cookie|fries|side|dessert))/i, yes: /^(no|nothing|that'?s all|just the|only the)|no,? (thanks|thank you)/i, no: /(yes|cake|cookie|fries|dessert|salad|soup|side)/i, yesVal: "no more", noVal: "more food" },
    { id: "amount", ask: /(how much|how many|that will be|the total)/i, yes: /\b\d+\b|\bdollars?\b|\byuan\b|\brmb\b/i, no: null, yesVal: null, noVal: null },
    { id: "item", ask: /(what can i get|what would you like|what can i do for you|can i help you|your order|would you like to order|what are you having)/i, yes: null, no: null, yesVal: null, noVal: null }
  ];

  /* 用问题文本给步骤自动打槽位标签 */
  function stepSlot(q) {
    q = q || "";
    for (var i = 0; i < SLOT_RES.length; i++) {
      if (SLOT_RES[i].ask.test(q)) return SLOT_RES[i].id;
    }
    return null;
  }

  /* 从用户的话里抽取已提供的槽位信息 */
  function extractSlots(text, sc) {
    var low = " " + (text || "").toLowerCase() + " ";
    var out = {}, i, k;
    if (sc && sc.menu) {
      for (i = 0; i < sc.menu.length; i++) {
        k = sc.menu[i].toLowerCase();
        if (low.indexOf(k) >= 0) { out.item = sc.menu[i]; break; }
      }
    }
    for (i = 0; i < SLOT_RES.length; i++) {
      var S = SLOT_RES[i], m = null, val = null;
      if (S.yes && (m = text.match(S.yes))) val = S.yesVal || m[0];
      else if (S.no && (m = text.match(S.no))) val = S.noVal || m[0];
      if (val && !out[S.id]) out[S.id] = String(val).trim();
    }
    return out;
  }

  /* 场景里用户提问 → Emma 的正面回答 */
  function scenarioAnswer(text) {
    var low = (text || "").toLowerCase();
    if (/(how much|price|cost|expensive)/.test(low)) return fresh([L("It's about six dollars. ", "大概六美元。")], "sq1").en;
    if (/(what do you recommend|recommendation|what'?s good|signature)/.test(low)) return fresh([L("Our most popular one is really good — I'd recommend that! ", "我们最受欢迎的那款很棒，推荐那个！")], "sq4").en;
    if (/(what time|open|close|closing|opening)/.test(low)) return fresh([L("We're open from nine to nine. ", "我们九点到九点营业。")], "sq5").en;
    if (/(where is|where are|how do i get|which way)/.test(low)) return fresh([L("It's just over there, on your right. ", "就在那边，右手边。")], "sq6").en;
    if (/(spicy|sweet|sour|bitter)/.test(low)) return fresh([L("It's a little spicy, but very tasty! ", "有点辣，但很好吃！")], "sq7").en;
    if (/(do you have|is there|are there|any )/.test(low)) return fresh([L("Yes, we do! ", "有的！"), L("Sorry, we just ran out today. ", "抱歉，今天刚好卖完了。")], "sq2").en;
    if (/(can i|could i|may i|is it ok|is it okay|do i need)/.test(low)) return fresh([L("Of course you can! ", "当然可以！"), L("Sure, no problem at all. ", "当然，完全没问题。")], "sq3").en;
    return fresh([L("Good question! ", "好问题！"), L("Hmm, let me think — ", "嗯，让我想想——")], "sq8").en;
  }

  /* 场景里答非所问 → 温和拉回 */
  function steerBack(currentQ) {
    return fresh([
      L("Ha, that's interesting! Let's come back to that later. First — " + currentQ, "哈，有意思！这个稍后再聊，我们先把眼前这句说完～"),
      L("I'd love to hear more about that another time! Right now — " + currentQ, "那个我们下次再聊！先看这句～"),
      L("Nice point! But let's finish this step first — " + currentQ, "说得好！先把这步走完～")
    ], "steer");
  }

  /* 场景确认语：尽量把你说的内容复述进去 */
  function scenarioAck(text, item, slots) {
    slots = slots || {};
    if (item && slots.size && slots.temp) {
      return { en: "A " + slots.size + " " + slots.temp + " " + item + " — great choice!", zh: "一份" + slots.size + "的" + item + "，好选择！" };
    }
    if (item) {
      return fresh([
        { en: item + " — great pick!", zh: item + "，选得好！" },
        { en: "Ah, " + item + ", nice choice!", zh: "啊，" + item + "，不错的选择！" },
        { en: "One " + item + ", coming up!", zh: "一份" + item + "，马上来！" }
      ], "ackItem");
    }
    var bits = [];
    if (slots.size) bits.push(slots.size);
    if (slots.temp) bits.push(slots.temp);
    if (slots.togo) bits.push(slots.togo);
    if (slots.pay) bits.push("by " + slots.pay);
    if (bits.length) return { en: bits.join(", ") + " — got it!", zh: bits.join("、") + "，记下了！" };
    return fresh([
      { en: "Got it!", zh: "明白了！" }, { en: "Okay!", zh: "好的！" },
      { en: "Perfect!", zh: "很好！" }, { en: "Sounds good!", zh: "听起来不错！" },
      { en: "Great!", zh: "太棒了！" }, { en: "Alright!", zh: "行！" }
    ], "ackGen");
  }

  window.DailyTalkBrain = {
    freeReply: freeReply,
    mirror: mirror,
    stepSlot: stepSlot,
    extractSlots: extractSlots,
    scenarioAnswer: scenarioAnswer,
    steerBack: steerBack,
    scenarioAck: scenarioAck,
    hasCJK: hasCJK,
    resetMemory: resetMemory,
    openQuestion: openQuestion,
    topics: TOPICS
  };
})();
