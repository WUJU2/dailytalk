/* =========================================================
 * DailyTalk 纠错引擎（规则驱动）
 * 检测日常口语中的常见语法、用词、中式英语问题，输出：
 *  - errors   : 计入扣分的错误（penalty > 0）
 *  - tips     : 不计分的优化建议（penalty = 0）
 *  - corrected: 修正后的句子
 * ========================================================= */
(function () {
  "use strict";

  /* ---------- 词形字典 ---------- */
  var PROFESSIONS = "teacher|student|doctor|nurse|engineer|lawyer|barista|cashier|waiter|driver|manager|salesperson|receptionist|tour guide|pilot|artist|writer|designer|chef|firefighter|accountant|secretary|programmer|developer|baker|police officer|musician|photographer";

  var PLURAL = {
    person: "people", child: "children", man: "men", woman: "women",
    foot: "feet", tooth: "teeth", mouse: "mice", leaf: "leaves", knife: "knives",
    life: "lives", shelf: "shelves", half: "halves", wife: "wives",
    city: "cities", country: "countries", family: "families", baby: "babies",
    story: "stories", hobby: "hobbies", strawberry: "strawberries",
    dictionary: "dictionaries", day: "days", key: "keys", boy: "boys", toy: "toys"
  };
  var SINGULAR = {
    books: "book", people: "person", children: "child", men: "man", women: "woman",
    feet: "foot", teeth: "tooth", cups: "cup", days: "day", hours: "hour",
    minutes: "minute", questions: "question", students: "student", friends: "friend",
    apples: "apple", dollars: "dollar", tickets: "ticket",
    pens: "pen", rooms: "room", tables: "table", chairs: "chair", bags: "bag",
    phones: "phone", cars: "car", trees: "tree", dogs: "dog", cats: "cat",
    birds: "bird", houses: "house", buses: "bus", boxes: "box", classes: "class",
    cities: "city", watches: "watch", beaches: "beach", sentences: "sentence",
    shops: "shop", gifts: "gift", cards: "card", emails: "email", photos: "photo",
    pictures: "picture", bottles: "bottle", games: "game", words: "word",
    shoes: "shoe", shirts: "shirt", hats: "hat", cakes: "cake",
    parks: "park", trains: "train", planes: "plane"
  };
  var COUNT_NOUNS = "book|pen|ticket|room|table|chair|bag|apple|orange|egg|day|week|month|year|hour|minute|question|dollar|glass|cup|plate|dish|friend|colleague|student|problem|idea|song|movie|coffee|latte|cappuccino|sandwich|burger|phone|car|bike|tree|flower|dog|cat|bird|bus|train|plane|taxi|hotel|shop|store|gift|card|letter|email|photo|picture|house|door|window|bottle|box|ball|game|lesson|class|exam|test|word|sentence|page|chapter|city|village|street|park|beach|restaurant|cake|pie|pizza|shoe|shirt|dress|hat|wallet|watch|computer|keyboard|lamp|desk|map|umbrella|dollar|pound|yuan|person|child|man|woman|foot|tooth";

  var IRREG_PAST_BAD = { /* 常见错误过去式 -> 正确过去式 */
    goed: "went", buyed: "bought", eated: "ate", drinked: "drank", runned: "ran",
    catched: "caught", seed: "saw", taked: "took", maked: "made", thinked: "thought",
    sayed: "said", meeted: "met", getted: "got", feeled: "felt", sleeped: "slept",
    keeped: "kept", leaved: "left", comed: "came", telled: "told", gived: "gave",
    standed: "stood", swimmed: "swam", bringed: "brought", writed: "wrote",
    runed: "ran", teld: "told", feelt: "felt", goen: "gone", buyed: "bought"
  };
  var PRES2PAST = { /* 现在式 -> 过去式（时态呼应用） */
    go: "went", come: "came", see: "saw", eat: "ate", buy: "bought", do: "did",
    have: "had", make: "made", take: "took", meet: "met", watch: "watched",
    play: "played", tell: "told", say: "said", feel: "felt", get: "got",
    sleep: "slept", know: "knew", think: "thought", find: "found", hear: "heard",
    write: "wrote", read: "read", speak: "spoke", drink: "drank", run: "ran",
    swim: "swam", drive: "drove", visit: "visited", walk: "walked",
    study: "studied", work: "worked", travel: "traveled", enjoy: "enjoyed",
    stay: "stayed", order: "ordered", pay: "paid", ask: "asked", call: "called",
    love: "loved", like: "liked", want: "wanted", need: "needed", help: "helped",
    start: "started", finish: "finished", learn: "learned", listen: "listened",
    watch: "watched", cook: "cooked", clean: "cleaned", open: "opened",
    close: "closed", wait: "waited", try: "tried", carry: "carried"
  };
  var PAST2BASE = {
    went: "go", ate: "eat", saw: "see", took: "take", made: "make", got: "get",
    had: "have", did: "do", came: "come", told: "tell", said: "say", met: "meet",
    bought: "buy", taught: "teach", thought: "think", knew: "know", drank: "drink",
    ran: "run", wrote: "write", spoke: "speak", gave: "give", sent: "send",
    felt: "feel", slept: "sleep", kept: "keep", left: "leave", found: "find",
    heard: "hear", brought: "bring", caught: "catch", stood: "stand", swam: "swim",
    sat: "sit", wore: "wear", became: "become", began: "begin", broke: "break",
    chose: "choose", drove: "drive", flew: "fly", forgot: "forget", grew: "grow",
    held: "hold", lost: "lose", paid: "pay", rode: "ride", sang: "sing",
    spent: "spend", stole: "steal", won: "win", woke: "wake", understood: "understand",
    read: "read", watched: "watch", played: "play", cooked: "cook", worked: "work"
  };
  var S3_VERBS = {
    go: "goes", like: "likes", want: "wants", need: "needs", know: "knows",
    eat: "eats", drink: "drinks", play: "plays", work: "works", live: "lives",
    love: "loves", hate: "hates", think: "thinks", say: "says", talk: "talks",
    speak: "speaks", read: "reads", watch: "watches", study: "studies", sleep: "sleeps",
    feel: "feels", look: "looks", run: "runs", walk: "walks", make: "makes",
    take: "takes", come: "comes", buy: "buys", do: "does", have: "has",
    enjoy: "enjoys", use: "uses", start: "starts", finish: "finishes", hope: "hopes",
    wish: "wishes", mean: "means", understand: "understands", remember: "remembers",
    forget: "forgets", practice: "practices", travel: "travels", visit: "visits",
    drive: "drives", write: "writes", sing: "sings", dance: "dances", swim: "swims",
    listen: "listens", meet: "meets", help: "helps", cook: "cooks", clean: "cleans",
    wash: "washes", pay: "pays", stay: "stays", wait: "waits", learn: "learns",
    teach: "teaches", try: "tries", ask: "asks", answer: "answers", call: "calls",
    send: "sends", give: "gives", get: "gets", put: "puts", open: "opens",
    close: "closes", turn: "turns", find: "finds", show: "shows", tell: "tells",
    order: "orders", eat: "eats", want: "wants", walk: "walks", carry: "carries"
  };
  var GERUND = {
    run: "running", swim: "swimming", shop: "shopping", sit: "sitting",
    stop: "stopping", plan: "planning", travel: "traveling", get: "getting",
    put: "putting", begin: "beginning", forget: "forgetting", prefer: "preferring",
    write: "writing", make: "making", take: "taking", come: "coming",
    have: "having", dance: "dancing", ride: "riding", drive: "driving",
    live: "living", study: "studying", play: "playing", watch: "watching",
    read: "reading", eat: "eating", drink: "drinking", speak: "speaking",
    listen: "listening", cook: "cooking", clean: "cleaning", walk: "walking",
    talk: "talking", work: "working", go: "going", do: "doing", see: "seeing",
    meet: "meeting", visit: "visiting", learn: "learning", teach: "teaching",
    sing: "singing", draw: "drawing", paint: "painting", fish: "fishing",
    hike: "hiking", ski: "skiing", surf: "surfing", jog: "jogging", climb: "climbing",
    swim: "swimming", use: "using", make: "making", take: "taking"
  };
  var TYPO = {
    recieve: "receive", beleive: "believe", becuase: "because", wich: "which",
    freind: "friend", teh: "the", adress: "address", resturant: "restaurant",
    coffe: "coffee", colledge: "college", calender: "calendar", diffrent: "different",
    excercise: "exercise", goverment: "government", happend: "happened",
    intersting: "interesting", knowlege: "knowledge", langauge: "language",
    neccessary: "necessary", occured: "occurred", oppertunity: "opportunity",
    peice: "piece", recomend: "recommend", seperate: "separate", succes: "success",
    tommorow: "tomorrow", truely: "truly", unfortunatly: "unfortunately",
    wierd: "weird", acheive: "achieve", arguement: "argument", begining: "beginning",
    buisness: "business", definately: "definitely", enviroment: "environment",
    foriegn: "foreign", immediatly: "immediately", profesional: "professional",
    responsable: "responsible", suprise: "surprise", tution: "tuition",
    wensday: "Wednesday", tuseday: "Tuesday", meny: "many", becouse: "because"
  };

  var ADJ_ING2ED = { boring: "bored", exciting: "excited", interesting: "interested", tiring: "tired", frustrating: "frustrated", confusing: "confused", disappointing: "disappointed", surprising: "surprised", annoying: "annoyed", relaxing: "relaxed", frightening: "frightened" };
  var ADJ_ED2ING = { bored: "boring", excited: "exciting", interested: "interesting", tired: "tiring", frustrated: "frustrating", confused: "confusing", disappointed: "disappointing", surprised: "surprising", annoyed: "annoying", relaxed: "relaxing", frightened: "frightening" };

  /* ---------- 规则容器 ---------- */
  var rules = [];
  function push(re, type, note, out, penalty) {
    rules.push({ re: re, type: type, note: note, out: out, penalty: penalty == null ? 1 : penalty });
  }

  /* ---------- 1. 冠词 ---------- */
  push(new RegExp("\\b(I am|I'm|He is|He's|She is|She's|We are|We're|They are|They're|You are|You're)\\s+(?!(?:a|an|the)\\b)(?:a|an\\s+)?(" + PROFESSIONS + ")\\b", "gi"),
    "冠词", "表示身份职业的单数可数名词前需要冠词 a/an。",
    function (m, subj, noun) {
      var art = (/^[aeiou]/i.test(noun) && !/^uni|^use|^euro|^one|^u\b/i.test(noun)) ? "an" : "a";
      return subj + " " + art + " " + noun;
    });
  push(/\b(a)\s+(hour|honest|honor|apple|orange|egg|umbrella|idea|interesting|important|easy|early|8|11|18|80)\b/gi,
    "冠词", "后面单词以元音音素开头时，冠词用 an。",
    function (m, a, w) { return "an " + w; });
  push(/\b(an)\s+(university|useful|user|one|european|unicorn|uk)\b/gi,
    "冠词", "u 读作 /juː/ 时属于辅音音素，冠词用 a。",
    function (m, a, w) { return "a " + w; });

  /* ---------- 2. 单复数 ---------- */
  push(new RegExp("\\b(two|three|four|five|six|seven|eight|nine|ten|several|many|a few|both|these|those)\\s+(" + COUNT_NOUNS + ")\\b", "gi"),
    "单复数", "数量大于 1 时，可数名词要用复数形式。",
    function (m, num, noun) {
      var n = noun.toLowerCase();
      return num + " " + (PLURAL[n] || (/(s|x|ch|sh)$/i.test(n) ? n + "es" : (/([^aeiou])y$/i.test(n) ? n.replace(/y$/, "ies") : n + "s")));
    });
  push(new RegExp("\\b([2-9]|\\d{2,})\\s+(" + COUNT_NOUNS + ")\\b", "gi"),
    "单复数", "数字大于 1 时，可数名词要用复数形式。",
    function (m, num, noun) {
      var n = noun.toLowerCase();
      return num + " " + (PLURAL[n] || (/(s|x|ch|sh)$/i.test(n) ? n + "es" : (/([^aeiou])y$/i.test(n) ? n.replace(/y$/, "ies") : n + "s")));
    });
  push(/\b(one|1|a|an)\s+(books|people|children|men|women|feet|teeth|cups|days|hours|minutes|questions|students|friends|apples|dollars|tickets|pens|rooms|tables|chairs|bags|phones|cars|trees|dogs|cats|birds|houses|buses|boxes|classes|cities|watches|beaches|sentences|shops|gifts|cards|emails|photos|pictures|bottles|games|words|shoes|shirts|hats|cakes|parks|trains|planes)\b/gi,
    "单复数", "数量为 1 时名词用单数形式。",
    function (m, one, noun) { return one + " " + (SINGULAR[noun.toLowerCase()] || noun.replace(/s$/, "")); });
  push(/\bless\s+(people|books|apples|days|hours|minutes|questions|cups|friends|students|dollars|tickets)\b/gi,
    "用词", "可数名词复数前用 fewer，不用 less。",
    function (m, w) { return "fewer " + w; });
  push(/\bthere (is|was)\s+(two|three|four|five|six|seven|eight|nine|ten|many|several|a few)\b/gi,
    "主谓一致", "there be 结构后是复数名词时，be 用 are / were。",
    function (m, be, num) { return "there " + (be.toLowerCase() === "is" ? "are" : "were") + " " + num; });
  push(/\bthere (are|were)\s+(one|a|an)\b/gi,
    "主谓一致", "there be 结构后是单数名词时，be 用 is / was。",
    function (m, be) { return "there " + (be.toLowerCase() === "are" ? "is" : "was") + " "; });

  /* ---------- 3. 主谓一致 / 动词形态 ---------- */
  push(/\b(he|she|it|this|that|Tom|Mary)\s+(go|like|want|need|know|eat|drink|play|work|live|love|hate|think|say|talk|speak|read|watch|study|sleep|feel|look|run|walk|make|take|come|buy|have|do|enjoy|use|start|finish|hope|wish|mean|understand|remember|forget|practice|travel|visit|drive|write|sing|dance|swim|listen|meet|help|cook|clean|wash|pay|stay|wait|learn|teach|try|ask|answer|call|send|give|get|put|open|close|turn|find|show|tell|order|carry)\b/gi,
    "主谓一致", "第三人称单数（he/she/it 等）后的动词要加 -s（have→has、do→does）。",
    function (m, subj, verb) { return subj + " " + (S3_VERBS[verb.toLowerCase()] || verb + "s"); });
  push(/\b(I)\s+(is|are|were|has|does)\b/gi,
    "主谓一致", "I 后面应搭配 am / was / have / do。",
    function (m, s, v) {
      var map = { is: "am", are: "am", were: "was", has: "have", does: "do" };
      return "I " + map[v.toLowerCase()];
    });
  push(/\b(you|we|they)\s+(is|am|has|does)\b/gi,
    "主谓一致", "you / we / they 后应搭配 are / have / do。",
    function (m, s, v) {
      var map = { is: "are", am: "are", has: "have", does: "do" };
      return s + " " + map[v.toLowerCase()];
    });
  push(/\b(he|she|it)\s+(have|do)\b/gi,
    "主谓一致", "第三人称单数用 has / does。",
    function (m, s, v) { return s + " " + (v.toLowerCase() === "have" ? "has" : "does"); });
  push(/\b(he|she|it)\s+don't\b/gi,
    "主谓一致", "第三人称单数的否定形式用 doesn't。",
    function (m, s) { return s + " doesn't"; });
  push(/\b(does|doesn't|did|didn't|do|don't)\s+(he|she|it|you|we|they|I|Tom|Mary)\s+(goes|likes|wants|needs|has|does|works|plays|eats|drinks|watches|studies|reads|speaks|talks|knows|thinks|says|lives|makes|takes|comes|buys|sleeps|feels|looks|runs|walks|tries|hopes|means|understands|remembers|carries)\b/gi,
    "动词形态", "助动词 do / does / did 后面的动词要用原形。",
    function (m, aux, subj, verb) {
      var v = verb.toLowerCase();
      var map = { goes: "go", likes: "like", wants: "want", needs: "need", has: "have", does: "do", works: "work", plays: "play", eats: "eat", drinks: "drink", watches: "watch", studies: "study", reads: "read", speaks: "speak", talks: "talk", knows: "know", thinks: "think", says: "say", lives: "live", makes: "make", takes: "take", comes: "come", buys: "buy", sleeps: "sleep", feels: "feel", looks: "look", runs: "run", walks: "walk", tries: "try", hopes: "hope", means: "mean", understands: "understand", remembers: "remember", carries: "carry" };
      return aux + " " + subj + " " + (map[v] || v.replace(/s$/, ""));
    });

  /* ---------- 4. 时态 ---------- */
  push(/\b(didn't|did not|did)\s+(went|ate|saw|took|made|got|had|did|came|told|said|met|bought|taught|thought|knew|drank|ran|wrote|spoke|gave|sent|felt|slept|kept|left|found|heard|brought|caught|stood|swam|sat|wore|became|began|broke|chose|drove|flew|forgot|grew|held|lost|paid|rode|sang|spent|stole|won|understood|woke)\b/gi,
    "时态", "did 后面要用动词原形（如 didn't go，而不是 didn't went）。",
    function (m, aux, v) { return aux + " " + (PAST2BASE[v.toLowerCase()] || v); });
  (function () {
    var re = /\b(goed|buyed|eated|drinked|runned|catched|seed|taked|maked|thinked|sayed|meeted|getted|feeled|sleeped|keeped|leaved|comed|telled|gived|standed|swimmed|bringed|writed|teld|feelt|goen)\b/gi;
    push(re, "时态", "这是不规则动词，过去式形式拼写有误。",
      function (m, w) { return IRREG_PAST_BAD[w.toLowerCase()] || w; });
  })();

  /* ---------- 5. 介词 ---------- */
  push(/\b(in|at|by|for)\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/gi,
    "介词", "星期几前面用介词 on。",
    function (m, p, d) { return "on " + d; });
  push(/\b(on|at|by)\s+(january|february|march|april|may|june|july|august|september|october|november|december)\b/gi,
    "介词", "月份前面用介词 in。",
    function (m, p, d) { return "in " + d; });
  push(/\b(on|at|by)\s+(\d{4})\b/gi,
    "介词", "年份前面用介词 in。",
    function (m, p, y) { return "in " + y; });
  push(/\b(in|on)\s+(\d{1,2})\s*(?:am|pm|o'clock|oclock)\b/gi,
    "介词", "具体时刻前面用介词 at。",
    function (m, p, t, ap) { return "at " + t + (ap ? " " + ap : ""); });
  push(/\bat\s+(the\s+)?(morning|afternoon|evening)\b/gi,
    "介词", "固定搭配为 in the morning / afternoon / evening。",
    function (m, art, t) { return "in the " + t; });
  push(/\bin\s+(night|noon|midnight)\b/gi,
    "介词", "固定搭配为 at night / at noon / at midnight。",
    function (m, t) { return "at " + t; });
  push(/\bin\s+(the\s+)?(weekend|weekends)\b/gi,
    "介词", "表示“在周末”用 on the weekend / on weekends。",
    function (m, art, t) { return t.indexOf("weekends") >= 0 ? "on weekends" : "on the weekend"; });
  push(/\bto\s+home\b/gi,
    "介词", "home 在此为副词，go home / come home 前面不加 to。",
    function () { return "home"; });
  push(/\b(listen|listening|listened)\s+(?!to\b)(music|english|songs|radio|podcast|the teacher|him|her|them|me|us)\b/gi,
    "搭配", "listen 是不及物动词，说“听音乐”要用 listen to music。",
    function (m, v, o) { return v + " to " + o; });
  push(/\bagree\s+(you|him|her|them|us|me|my|your)\b/gi,
    "搭配", "表达“同意某人”用 agree with sb.。",
    function (m, o) { return "agree with " + o; });
  push(/\bwait\s+(me|you|him|her|them|us)\b/gi,
    "搭配", "表达“等待某人”用 wait for sb.。",
    function (m, o) { return "wait for " + o; });
  push(/\bdepend\s+of\b/gi, "搭配", "固定搭配 depend on。", function () { return "depend on"; });
  push(/\bmarried\s+with\b/gi, "搭配", "固定搭配 be married to sb.。", function () { return "married to"; });
  push(/\bcome\s+to\s+here\b/gi, "搭配", "here 是副词，直接说 come here。", function () { return "come here"; });

  /* ---------- 6. 动词搭配 ---------- */
  push(/\b(want|wants|wanted|would like)\s+(?!to\b)(go|come|buy|eat|drink|see|do|make|take|play|watch|learn|speak|visit|meet|try|know|help|ask|tell|say|start|finish|travel|live|stay|walk|run|swim|read|write|listen|talk|sleep|use)\b/gi,
    "搭配", "want 后面接动词时要用 want to do 结构（want to go）。",
    function (m, v, verb) { return v + " to " + verb; });
  push(/\b(like|likes|love|loves|enjoy|enjoys|hate|hates|mind|minds|keep|keeps|practice|practices)\s+(?!to\b)(play|swim|read|watch|go|eat|drink|run|shop|travel|listen|walk|dance|sing|draw|cook|study|drive|ride|fish|hike|ski|surf|jog|climb|paint|write|speak|talk|meet|see|use)\b/gi,
    "搭配", "like / enjoy / practice 等后面接动词时多用 -ing 形式（enjoy playing）。",
    function (m, v, verb) { return v + " " + (GERUND[verb.toLowerCase()] || verb + "ing"); });
  push(/\bgo(?:es|ing)?\s+to\s+(shopping|swimming|running|fishing|hiking|sightseeing|dancing|skiing|jogging|camping|boating)\b/gi,
    "搭配", "固定搭配 go shopping / go swimming，中间不加 to。",
    function (m, act) { return "go " + act; });

  /* ---------- 7. 中式英语 ---------- */
  push(/\b(open|opens|opened|opening|close|closes|closed|closing)\s+(the\s+)?(light|lights|lamp|tv|television|computer|radio|air conditioner|fan|microwave)\b/gi,
    "中式表达", "中文“开灯”英文不说 open，开关电器用 turn on / turn off。",
    function (m, v, art, thing) {
      var turn = /^close/i.test(v) ? "turn off" : "turn on";
      return turn + " " + (art || "") + thing;
    });
  push(/\b(I|we|you|they)\s+very\s+(like|love|enjoy|want|need|know|hope|miss)\b/gi,
    "中式表达", "中文“我非常喜欢”不能说 I very like，应用 I really like…。",
    function (m, s, v) { return s + " really " + v; });
  push(/\b(although|though)\b[\s\S]{0,80}?\b(but)\b/gi,
    "中式表达", "although / though 与 but 不能同时出现在一个句子里，去掉 but。",
    function (m) {
      return m.replace(/\s*,?\s+but\b/gi, "").replace(/\bbut\s+([a-z])/i, "$1");
    });
  push(/\b(because)\b[\s\S]{0,80}?\b(so)\b/gi,
    "中式表达", "because 与 so 不能同时出现在一个句子里，去掉 so。",
    function (m) { return m.replace(/\s*,?\s+so\b/gi, ""); });
  push(/\bI think I (can't|cannot|won't|don't|am not|shouldn't|didn't|wouldn't)\b/gi,
    "中式表达", "“我想我不能…”英文习惯说 I don't think I can…（否定前移）。",
    function (m, neg) {
      var map = { "can't": "can", cannot: "can", "won't": "will", "don't": "do", "am not": "am", "shouldn't": "should", "didn't": "did", "wouldn't": "would" };
      return "I don't think I " + map[neg.toLowerCase()];
    });
  push(/\bI no (have|like|want|know|need|understand|think|go|speak)\b/gi,
    "中式表达", "“我没有 / 我不…”要说 I don't…，不要直译为 I no…。",
    function (m, v) { return "I don't " + v; });
  push(/\b(don't|do not|can't|cannot|never|didn't|doesn't|isn't|aren't|won't|haven't|hasn't|no)\b[\s\S]{0,40}?\b(nothing|nobody|no one|nowhere|none)\b/gi,
    "语法", "出现双重否定：I don't know nothing 应为 I don't know anything。",
    function (m) {
      var map = { nothing: "anything", nobody: "anybody", "no one": "anyone", nowhere: "anywhere", none: "any" };
      return m.replace(/\b(nothing|nobody|no one|nowhere|none)\b/gi, function (w) { return map[w.toLowerCase()] || w; });
    });
  push(/\bmore\s+(better|worse|bigger|smaller|faster|slower|easier|harder|cheaper|cleaner|quieter|nicer|older|younger|hotter|colder)\b/gi,
    "语法", "比较级已经表示“更”，more better 应直接说 better。",
    function (m, adj) { return adj; });
  push(/\bI have (\d+) years? old\b/gi,
    "中式表达", "“我 20 岁”英文说 I am 20 years old，动词用 am。",
    function (m, age) { return "I am " + age + " years old"; });
  push(/\b(I|you|he|she|we|they|it)\s+very\s+(tired|happy|sad|busy|hungry|thirsty|angry|excited|bored|sick|tall|good|bad|hot|cold|expensive|cheap|easy|hard|beautiful)\b/gi,
    "语法", "形容词前缺少系动词：应为 I'm very tired / You're very busy。",
    function (m, s, adj) {
      var map = { i: "I'm", you: "you're", he: "he's", she: "she's", we: "we're", they: "they're", it: "it's" };
      return map[s.toLowerCase()] + " very " + adj;
    });
  push(/\bthanks you\b/gi, "中式表达", "“谢谢你”是 thank you，不是 thanks you。", function () { return "thank you"; });
  push(/\bwhat('s| is)\s+you\s+name\b/gi, "语法", "“你的名字”是 your name，不是 you name。",
    function (m) { return "what's your name"; });
  push(/\bborrow\s+me\s+(your|the|a)\b/gi, "用词", "“借给我”用 lend me；borrow 表示“向某人借”。",
    function (m, det) { return "lend me " + det; });
  push(/\b(can|could)\s+you\s+borrow\s+me\b/gi, "用词", "“你能借给我吗？”中的“借给”用 lend。",
    function (m) { return m.replace(/\bborrow\b/i, "lend"); });
  push(/\bI am agree\b/gi, "中式表达", "agree 是动词，不能说 I am agree，应说 I agree。",
    function () { return "I agree"; });
  push(/\bto\s+(far|much|many|expensive|cheap|hot|cold|big|small|long|short|late|early|fast|slow|difficult|easy|hard|busy|tired|spicy|sweet)\b/gi,
    "用词", "表示“太…”（程度）时用 too，不用 to。",
    function (m, adj) { return "too " + adj; });

  /* ---------- 8. 语序 / 疑问句 ---------- */
  push(/^(what|where|when|why|how)\s+you\s+(\w+)\b/gi,
    "语序", "特殊疑问句需要助动词：如 What do you do?",
    function (m, qw, verb) { return qw + " do you " + verb; });
  push(/^(how\s+to\s+(say|spell|pronounce|go|get|make|do|use|open|buy|order|ask)\b)/gi,
    "语序", "单独问“怎么说…？”要说 How do you say…?（how to say 只用于从句中）。",
    function (m, whole) { return whole.replace(/^how to/i, "how do you"); });
  push(/^(you|they|we)\s+(like|want|need|have|know|eat|drink|go|play|watch|love|think)\b.+[?？]\s*$/gi,
    "表达优化", "口语中这样问可以听懂，但更标准、更礼貌的是用 Do you…?",
    function (m, subj, verb) {
      var lower = m.replace(/[?？]\s*$/, "");
      return "Do " + lower + "?";
    }, 0);
  push(/^(he|she|it)\s+(likes|wants|has|needs|knows|goes|plays|eats|drinks|watches|loves|thinks)\b.+[?？]\s*$/gi,
    "表达优化", "更标准的问法是 Does he/she/it…?",
    function (m, subj, verb) {
      var map = { likes: "like", wants: "want", has: "have", needs: "need", knows: "know", goes: "go", plays: "play", eats: "eat", drinks: "drink", watches: "watch", loves: "love", thinks: "think" };
      var lower = m.replace(/[?？]\s*$/, "");
      return "Does " + subj + " " + (map[verb.toLowerCase()] || verb) + "?";
    }, 0);

  /* ---------- 9. 情感形容词 -ed / -ing 反用 ---------- */
  push(/\b(I am|I'm|I was|I feel|I felt|I get|I got)\s+(boring|exciting|interesting|tiring|frustrating|confusing|disappointing|surprising|annoying|relaxing|frightening)\b/gi,
    "用词", "主语是“人”时表达自身感受，用 -ed 形式：I'm bored / excited。",
    function (m, head, adj) { return head + " " + (ADJ_ING2ED[adj.toLowerCase()] || adj.replace(/ing$/, "ed")); });
  push(/\b(the\s+)?(movie|film|book|food|job|game|class|lesson|trip|news|story|show|weather|music)\s+is\s+(bored|excited|interested|tired|frustrated|confused|disappointed|surprised|annoyed|relaxed|frightened)\b/gi,
    "用词", "主语是“事物”时表示其性质，用 -ing 形式：The movie is boring。",
    function (m, art, thing, be, adj) { return (art || "") + thing + " is " + (ADJ_ED2ING[adj.toLowerCase()] || adj.replace(/ed$/, "ing")); });

  /* ---------- 10. 时态呼应：过去时间标志 + 动词 ---------- */
  var PAST_MARKS = ["the day before yesterday", "yesterday", "last night", "last week", "last month", "last year",
    "last weekend", "ago", "just now", "in 2018", "in 2019", "in 2020", "in 2021",
    "in 2022", "in 2023", "in 2024", "in 2025", "in 1990", "in 2000", "in 2010"];

  function applyTenseScan(state) {
    var text = state.copy;
    if (text.length > 400) text = text.slice(0, 400); /* 限制扫描长度 */
    var i;
    for (i = 0; i < PAST_MARKS.length; i++) {
      var mark = PAST_MARKS[i];
      var re = new RegExp("\\b" + mark.replace(/\s+/g, "\\s+") + "\\b", "gi");
      var mk;
      while ((mk = re.exec(text)) !== null) {
        var matchEnd = mk.index + mk[0].length;
        var rest = text.slice(matchEnd, matchEnd + 90);
        var m = rest.match(/\b(I|we|they|you|he|she|it|Tom|Mary)\s+(go|come|see|eat|buy|do|have|make|take|meet|watch|play|tell|say|feel|get|sleep|know|think|find|hear|write|read|speak|drink|run|swim|drive|visit|walk|study|work|travel|enjoy|stay|order|pay|ask|call|love|like|want|need|help|start|finish|learn|listen|cook|clean|open|close|wait|try|carry)\b/i);
        if (m) {
          var verb = m[2].toLowerCase();
          var past = PRES2PAST[verb];
          if (!past) continue;
          var startIdx = matchEnd + m.index;
          var segText = text.substr(startIdx, m[0].length);
          var replaced = segText.replace(new RegExp("\\b" + verb + "\\b", "i"), past);
          if (replaced !== segText && !/\b(yesterday|last|ago)\s*\w*$/i.test(segText)) {
            state.copy = state.copy.slice(0, startIdx) + replaced + state.copy.slice(startIdx + segText.length);
            state.pushError(segText, replaced, "时态", "句中有 " + mark + " 等过去时间，动词应改为过去式 " + past + "。");
          }
        }
      }
    }
  }

  /* ---------- 主分析函数 ---------- */
  function analyze(text) {
    var orig = (text || "").replace(/\s+/g, " ").trim();
    if (!orig) return { errors: [], tips: [], corrected: orig, count: 0, wordCount: 0 };

    var state = {
      copy: orig,
      items: [],
      seen: {},
      pushError: function (txt, fix, type, note) {
        txt = (txt || "").trim();
        fix = (fix || "").trim();
        if (!txt || !fix || txt.toLowerCase() === fix.toLowerCase()) return;
        var key = txt.toLowerCase() + "|" + fix.toLowerCase();
        if (state.seen[key]) return;
        state.seen[key] = 1;
        state.items.push({ text: txt, fix: fix, type: type, note: note, penalty: 1 });
      }
    };

    /* 规则引擎 */
    for (var r = 0; r < rules.length; r++) {
      var rule = rules[r];
      try {
        state.copy = state.copy.replace(rule.re, function () {
          var args = Array.prototype.slice.call(arguments);
          var match = args[0];
          var groups = args.slice(1, args.length - 2);
          var fix = rule.out ? rule.out.apply(null, [match].concat(groups)) : match;
          if (typeof fix !== "string") fix = String(fix);
          if (fix !== match && fix && match) {
            var key = match.toLowerCase() + "|" + fix.toLowerCase();
            if (!state.seen[key]) {
              state.seen[key] = 1;
              state.items.push({
                text: match.trim(), fix: fix.trim(),
                type: rule.type, note: rule.note, penalty: rule.penalty
              });
            }
          }
          return fix;
        });
      } catch (e) { /* 单条规则异常忽略，避免影响整体 */ }
    }

    /* 时态呼应扫描 */
    try { applyTenseScan(state); } catch (e) { }

    /* 拼写 */
    try {
      state.copy = state.copy.replace(/[A-Za-z]+/g, function (w) {
        var lw = w.toLowerCase();
        if (TYPO[lw]) {
          var key = w + "|" + TYPO[lw];
          if (!state.seen[key]) {
            state.seen[key] = 1;
            state.items.push({ text: w, fix: TYPO[lw], type: "拼写", note: "常见拼写错误，正确拼写是 " + TYPO[lw] + "。", penalty: 1 });
          }
          return TYPO[lw];
        }
        return w;
      });
      /* 语言/国籍名词首字母大写（提示，不计分） */
      state.copy = state.copy.replace(/\b(english|chinese|american|british|japanese|korean|spanish|french|german|russian|italian)\b/gi, function (w) {
        var cap = w.charAt(0).toUpperCase() + w.slice(1);
        if (cap !== w) {
          var key2 = w + "|" + cap;
          if (!state.seen[key2]) {
            state.seen[key2] = 1;
            state.items.push({ text: w, fix: cap, type: "拼写", note: "English / Chinese 等语言、国籍名称首字母要大写。", penalty: 0 });
          }
        }
        return cap;
      });
    } catch (e) { }

    /* 归一化与句首大写 */
    var corrected = state.copy
      .replace(/\s+/g, " ")
      .replace(/\s+([,.!?;:])/g, "$1")
      .replace(/\s+([)'"])([.,!?])/g, "$1$2")
      .trim();

    corrected = corrected.split(/(?<=[.!?]\s)/).map(function (s) {
      return s.charAt(0).toUpperCase() + s.slice(1);
    }).join("").replace(/\bi\b/g, "I");

    var errors = [], tips = [];
    state.items.forEach(function (it) {
      if (it.penalty > 0) errors.push(it); else tips.push(it);
    });

    return {
      errors: errors,
      tips: tips,
      corrected: corrected,
      count: errors.length,
      wordCount: orig.split(/\s+/).filter(Boolean).length
    };
  }

  window.DailyTalkCorrect = { analyze: analyze };
})();
