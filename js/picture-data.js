/* =========================================================
 * DailyTalk · 英语绘本启蒙（数据层）
 * 面向 4–5 岁零基础小朋友（幼儿园中班）
 * 设计参考牛津树「固定小主人公 + 高复现句型」的磨耳朵思路，
 * 全部角色与故事均为原创，不使用任何受版权保护的素材。
 *
 * 角色固定出现于每一本书，帮助小朋友建立熟悉感：
 *   萌萌 Momo（姐姐）· 里奥 Leo（哥哥）· 豆豆 Dodo（弟弟）
 *   毛毛 Fluffy（小狗）· 妈妈 Mama · 爸爸 Papa · 猫咪 Mimi
 *
 * 页面坐标系统：400 × 300 的画布，(x, y) 为物体「落地/落点」坐标
 * ========================================================= */
(function () {
  "use strict";

  /* ---------------- 小主人公档案（认识小伙伴） ---------------- */
  var CHARACTERS = [
    { id: "momo", em: "👧", name: "Momo", zh: "萌萌", role: "姐姐 6 岁", line: "Hello! I am Momo.", lineZh: "你好！我是萌萌。", color: "#ff8fb1" },
    { id: "leo", em: "👦", name: "Leo", zh: "里奥", role: "哥哥 7 岁", line: "Hi! I am Leo.", lineZh: "嗨！我是里奥。", color: "#5b8def" },
    { id: "dodo", em: "🧒", name: "Dodo", zh: "豆豆", role: "弟弟 3 岁", line: "I am Dodo. I am little.", lineZh: "我是豆豆，我很小。", color: "#ffd23f" },
    { id: "fluffy", em: "🐶", name: "Fluffy", zh: "毛毛", role: "小狗", line: "Woof! I am Fluffy.", lineZh: "汪！我是毛毛。", color: "#e0a76a" },
    { id: "mama", em: "👩", name: "Mama", zh: "妈妈", role: "妈妈", line: "I am Mama.", lineZh: "我是妈妈。", color: "#b18cf0" },
    { id: "papa", em: "👨", name: "Papa", zh: "爸爸", role: "爸爸", line: "I am Papa.", lineZh: "我是爸爸。", color: "#5bbf9c" }
  ];

  /* ---------------- 绘本 ---------------- */
  var BOOKS = [

    /* ============ 1 ============ */
    {
      id: "look-at-me", em: "👕", lv: 1,
      title: "Look at Me!", zh: "看看我！",
      pattern: "复现句型：Look at my …",
      tip: [
        "读的时候用手拍拍自己身上的对应部位，让小朋友把「声音」和「东西」连起来。",
        "不要求跟读完整句子，能跟着说出 hat、coat、shoes 这几个词就非常棒了。",
        "最后一页 Fluffy 抢走了帽子，可以一起大笑，让读书变成好玩的事。"
      ],
      quiz: [
        { q: "Which one is a hat?", zh: "哪一个是帽子？", opts: [{ em: "🎩", label: "hat", ok: true }, { em: "👟", label: "shoes" }, { em: "🧸", label: "teddy" }] },
        { q: "Who takes the hat away?", zh: "谁把帽子叼走了？", opts: [{ em: "🐱", label: "Mimi" }, { em: "🐶", label: "Fluffy", ok: true }, { em: "🐰", label: "rabbit" }] },
        { q: "Is Fluffy a good dog?", zh: "毛毛是个乖狗狗吗？", opts: [{ em: "😄", label: "Yes" }, { em: "😝", label: "Silly dog!", ok: true }] }
      ],
      pages: [
        { en: "Look at me!", zh: "看看我！", bg: "garden", words: [{ w: "look", em: "👀", zh: "看" }, { w: "me", em: "🙋", zh: "我" }], sc: [{ t: "kid", who: "momo", x: 120, y: 258, s: 0.98 }, { t: "kid", who: "leo", x: 205, y: 256, s: 1.05 }, { t: "kid", who: "dodo", x: 280, y: 262, s: 0.82 }, { t: "dog", x: 348, y: 262, s: 0.85 }] },
        { en: "Look at my hat.", zh: "看看我的帽子。", bg: "garden", words: [{ w: "hat", em: "🎩", zh: "帽子" }], sc: [{ t: "kid", who: "dodo", x: 175, y: 262, s: 1.15, opt: { hat: "straw" } }, { t: "dog", x: 300, y: 262, s: 0.95 }] },
        { en: "Look at my coat.", zh: "看看我的外套。", bg: "garden", words: [{ w: "coat", em: "🧥", zh: "外套" }], sc: [{ t: "kid", who: "leo", x: 150, y: 258, s: 1.1, opt: { coat: "#5b8def" } }, { t: "kid", who: "momo", x: 285, y: 258, s: 0.95 }] },
        { en: "Look at my shoes.", zh: "看看我的鞋子。", bg: "garden", words: [{ w: "shoes", em: "👟", zh: "鞋子" }], sc: [{ t: "kid", who: "momo", x: 140, y: 258, s: 1.05, opt: { shoes: "#e2564e" } }, { t: "p", k: "stick", em: "👟", x: 292, y: 258, s: 1.5 }] },
        { en: "Look at Fluffy.", zh: "看看毛毛。", bg: "garden", words: [{ w: "look", em: "👀", zh: "看" }], sc: [{ t: "kid", who: "momo", x: 105, y: 258, s: 0.9 }, { t: "kid", who: "dodo", x: 180, y: 262, s: 0.8 }, { t: "dog", x: 285, y: 258, s: 1.15, opt: { hat: "straw" } }] },
        { en: "Oh no! Fluffy!", zh: "哎呀！毛毛！", bg: "garden", words: [{ w: "oh no", em: "😲", zh: "哎呀" }], sc: [{ t: "kid", who: "momo", x: 95, y: 258, s: 0.85, opt: { face: "surprise" } }, { t: "kid", who: "dodo", x: 168, y: 262, s: 0.78, opt: { face: "surprise" } }, { t: "dog", x: 320, y: 262, s: 1.1, opt: { pose: "run", flip: true } }] },
        { en: "Come back, Fluffy!", zh: "回来，毛毛！", bg: "garden", words: [{ w: "come back", em: "🔙", zh: "回来" }], sc: [{ t: "kid", who: "leo", x: 105, y: 256, s: 1.02, opt: { face: "surprise" } }, { t: "kid", who: "momo", x: 190, y: 258, s: 0.95 }, { t: "dog", x: 335, y: 262, s: 0.95, opt: { pose: "run", flip: true } }] },
        { en: "Silly Fluffy!", zh: "傻毛毛！", bg: "garden", words: [{ w: "silly", em: "🤪", zh: "傻乎乎的" }], sc: [{ t: "kid", who: "momo", x: 110, y: 258, s: 0.98, opt: { face: "happy" } }, { t: "kid", who: "leo", x: 185, y: 256, s: 1.0, opt: { face: "happy" } }, { t: "kid", who: "dodo", x: 250, y: 262, s: 0.8, opt: { face: "happy" } }, { t: "dog", x: 340, y: 250, s: 1.0, opt: { pose: "jump", flip: true, hat: "straw" } }] }
      ]
    },

    /* ============ 2 ============ */
    {
      id: "toy-box", em: "🧸", lv: 1,
      title: "The Toy Box", zh: "玩具箱",
      pattern: "复现句型：I have a … / It is in the box.",
      tip: [
        "读完一页，请小朋友去自己玩具箱里找出一样一样的东西，边说边拿。",
        "「I have a …」句式会重复 4 次，跟着节奏摇一摇身体，效果更好。",
        "最后一页「Let's tidy up」可以顺势约定：玩完玩具要收好。"
      ],
      quiz: [
        { q: "Which one is a ball?", zh: "哪一个是球？", opts: [{ em: "⚽", label: "ball", ok: true }, { em: "🚗", label: "car" }, { em: "📚", label: "book" }] },
        { q: "Where do the toys go?", zh: "玩具要放到哪里？", opts: [{ em: "🧺", label: "the box", ok: true }, { em: "🛏️", label: "the bed" }, { em: "🚪", label: "the door" }] },
        { q: "Is the room tidy at the end?", zh: "最后房间收好了吗？", opts: [{ em: "✅", label: "Yes, tidy!", ok: true }, { em: "❌", label: "No" }] }
      ],
      pages: [
        { en: "This is my toy box.", zh: "这是我的玩具箱。", bg: "room", words: [{ w: "toy", em: "🧸", zh: "玩具" }, { w: "box", em: "📦", zh: "箱子" }], sc: [{ t: "p", k: "toybox", x: 265, y: 268, s: 1.25 }, { t: "kid", who: "dodo", x: 130, y: 268, s: 1.0, opt: { face: "happy" } }] },
        { en: "I have a red ball.", zh: "我有一个红皮球。", bg: "room", words: [{ w: "red", em: "🔴", zh: "红色" }, { w: "ball", em: "⚽", zh: "球" }], sc: [{ t: "kid", who: "leo", x: 130, y: 268, s: 1.05, opt: { face: "happy" } }, { t: "p", k: "ball", x: 280, y: 268, s: 1.35, color: "#e2564e" }] },
        { en: "I have a blue car.", zh: "我有一辆蓝小车。", bg: "room", words: [{ w: "blue", em: "🔵", zh: "蓝色" }, { w: "car", em: "🚗", zh: "小汽车" }], sc: [{ t: "kid", who: "dodo", x: 128, y: 268, s: 0.95 }, { t: "p", k: "stick", em: "🚗", x: 285, y: 262, s: 1.6 }] },
        { en: "I have a teddy bear.", zh: "我有一只泰迪熊。", bg: "room", words: [{ w: "teddy bear", em: "🧸", zh: "泰迪熊" }], sc: [{ t: "kid", who: "momo", x: 132, y: 268, s: 1.0 }, { t: "p", k: "stick", em: "🧸", x: 288, y: 262, s: 1.6 }] },
        { en: "Dodo has a book.", zh: "豆豆有一本书。", bg: "room", words: [{ w: "book", em: "📚", zh: "书" }], sc: [{ t: "kid", who: "dodo", x: 190, y: 268, s: 1.0 }, { t: "p", k: "stick", em: "📕", x: 300, y: 262, s: 1.5 }] },
        { en: "Look in the box.", zh: "看看箱子里。", bg: "room", words: [{ w: "in", em: "📥", zh: "在……里面" }], sc: [{ t: "p", k: "toybox", x: 270, y: 268, s: 1.35, opt: { open: true } }, { t: "kid", who: "momo", x: 110, y: 268, s: 0.98, opt: { face: "surprise" } }, { t: "kid", who: "leo", x: 178, y: 268, s: 1.0 }] },
        { en: "What a mess!", zh: "好乱呀！", bg: "room", words: [{ w: "mess", em: "🌀", zh: "乱糟糟" }], sc: [{ t: "p", k: "ball", x: 90, y: 272, s: 1.0, color: "#e2564e" }, { t: "p", k: "stick", em: "🚗", x: 170, y: 268, s: 1.1 }, { t: "p", k: "stick", em: "🧸", x: 250, y: 268, s: 1.1 }, { t: "p", k: "stick", em: "📕", x: 320, y: 268, s: 1.0 }, { t: "kid", who: "momo", x: 200, y: 230, s: 0.95, opt: { face: "surprise" } }] },
        { en: "Let's tidy up.", zh: "我们一起收拾吧。", bg: "room", words: [{ w: "tidy up", em: "🧹", zh: "收拾" }], sc: [{ t: "p", k: "toybox", x: 265, y: 268, s: 1.3 }, { t: "kid", who: "momo", x: 105, y: 268, s: 0.98, opt: { face: "happy" } }, { t: "kid", who: "leo", x: 175, y: 268, s: 1.02, opt: { face: "happy" } }] }
      ]
    },

    /* ============ 3 ============ */
    {
      id: "at-the-park", em: "🌳", lv: 2,
      title: "At the Park", zh: "在公园",
      pattern: "复现句型：I can see a …",
      tip: [
        "「I can see…」是幼儿园阶段最好用的句型，出去玩时可以一直用。",
        "读到 see 就用手指一指远处，帮小朋友建立「看」的动作联想。",
        "结尾猫跑到树上去了，可以问问小朋友：Fluffy 能不能爬树呢？"
      ],
      quiz: [
        { q: "Which one can fly?", zh: "哪一个会飞？", opts: [{ em: "🐦", label: "bird", ok: true }, { em: "🌳", label: "tree" }, { em: "🐶", label: "dog" }] },
        { q: "Where is the cat at the end?", zh: "最后猫咪在哪里？", opts: [{ em: "🌳", label: "up the tree", ok: true }, { em: "🛝", label: "on the swing" }, { em: "🏠", label: "at home" }] },
        { q: "Is Fluffy happy or sad?", zh: "毛毛心情怎么样？", opts: [{ em: "😄", label: "happy", ok: true }, { em: "😢", label: "sad" }] }
      ],
      pages: [
        { en: "We go to the park.", zh: "我们去公园。", bg: "park", words: [{ w: "go", em: "🚶", zh: "去" }, { w: "park", em: "🌳", zh: "公园" }], sc: [{ t: "kid", who: "momo", x: 120, y: 262, s: 0.95 }, { t: "kid", who: "leo", x: 195, y: 260, s: 1.0 }, { t: "kid", who: "dodo", x: 258, y: 264, s: 0.78 }, { t: "dog", x: 330, y: 266, s: 0.85 }] },
        { en: "I can see a tree.", zh: "我能看见一棵树。", bg: "park", words: [{ w: "see", em: "👀", zh: "看见" }, { w: "tree", em: "🌳", zh: "树" }], sc: [{ t: "p", k: "tree", x: 288, y: 262, s: 1.3 }, { t: "kid", who: "momo", x: 120, y: 262, s: 1.05, opt: { face: "happy" } }] },
        { en: "I can see a bird.", zh: "我能看见一只小鸟。", bg: "park", words: [{ w: "bird", em: "🐦", zh: "小鸟" }], sc: [{ t: "p", k: "bird", x: 300, y: 88, s: 1.2 }, { t: "kid", who: "dodo", x: 150, y: 264, s: 0.9, opt: { face: "surprise" } }, { t: "kid", who: "leo", x: 230, y: 260, s: 1.0 }] },
        { en: "I can see a swing.", zh: "我能看见一个秋千。", bg: "park", words: [{ w: "swing", em: "🛝", zh: "秋千" }], sc: [{ t: "p", k: "swing", x: 285, y: 262, s: 1.35 }, { t: "kid", who: "leo", x: 120, y: 262, s: 1.05, opt: { face: "happy" } }] },
        { en: "Fluffy can see a cat.", zh: "毛毛看见一只猫。", bg: "park", words: [{ w: "cat", em: "🐱", zh: "猫" }], sc: [{ t: "dog", x: 120, y: 264, s: 1.0 }, { t: "cat", x: 300, y: 262, s: 1.05 }] },
        { en: "Fluffy runs and runs.", zh: "毛毛跑呀跑。", bg: "park", words: [{ w: "run", em: "🏃", zh: "跑" }], sc: [{ t: "dog", x: 160, y: 262, s: 1.05, opt: { pose: "run" } }, { t: "cat", x: 320, y: 262, s: 1.0, opt: { pose: "run", flip: true } }] },
        { en: "Come here, Fluffy!", zh: "过来，毛毛！", bg: "park", words: [{ w: "come here", em: "🫱", zh: "到这儿来" }], sc: [{ t: "kid", who: "momo", x: 110, y: 262, s: 1.0, opt: { face: "surprise" } }, { t: "kid", who: "dodo", x: 190, y: 264, s: 0.8 }, { t: "dog", x: 320, y: 264, s: 0.95, opt: { pose: "run", flip: true } }] },
        { en: "The cat is up the tree.", zh: "猫跑到树上去了。", bg: "park", words: [{ w: "up", em: "⬆️", zh: "在上面" }], sc: [{ t: "p", k: "tree", x: 230, y: 268, s: 1.5 }, { t: "cat", x: 245, y: 118, s: 1.0 }, { t: "dog", x: 320, y: 268, s: 1.0, opt: { face: "sad" } }] }
      ]
    },

    /* ============ 4 ============ */
    {
      id: "good-morning", em: "☀️", lv: 1,
      title: "Good Morning", zh: "早上好",
      pattern: "复现句型：Good morning, … / I wash/brush/eat/drink my …",
      tip: [
        "这本书就是早上的流程图，可以把英语直接嵌进真实生活里用。",
        "早上做每件事的时候说一句对应的英文，坚持一周小朋友就会自己说了。",
        "最后「Goodbye, everyone!」可以在出门时大声说，养成习惯。"
      ],
      quiz: [
        { q: "What do we do in the morning?", zh: "早上我们要做什么？", opts: [{ em: "🪥", label: "brush teeth", ok: true }, { em: "😴", label: "go to sleep" }] },
        { q: "What do I drink?", zh: "我喝了什么？", opts: [{ em: "🥛", label: "milk", ok: true }, { em: "🍎", label: "apple" }, { em: "🍫", label: "chocolate" }] },
        { q: "Say goodbye to Mama:", zh: "跟妈妈道别怎么说？", opts: [{ em: "👋", label: "Goodbye!", ok: true }, { em: "🌙", label: "Good night!" }] }
      ],
      pages: [
        { en: "Good morning, Mama.", zh: "早上好，妈妈。", bg: "room", words: [{ w: "good morning", em: "🌅", zh: "早上好" }], sc: [{ t: "adult", who: "mama", x: 285, y: 268, s: 1.2 }, { t: "kid", who: "dodo", x: 145, y: 268, s: 1.0, opt: { face: "happy" } }] },
        { en: "Good morning, Papa.", zh: "早上好，爸爸。", bg: "room", words: [{ w: "good morning", em: "🌅", zh: "早上好" }], sc: [{ t: "adult", who: "papa", x: 285, y: 268, s: 1.25 }, { t: "kid", who: "momo", x: 145, y: 268, s: 1.0, opt: { face: "happy" } }] },
        { en: "I wash my face.", zh: "我洗脸。", bg: "room", words: [{ w: "wash", em: "💧", zh: "洗" }, { w: "face", em: "😊", zh: "脸" }], sc: [{ t: "p", k: "sink", x: 300, y: 268, s: 1.3 }, { t: "kid", who: "dodo", x: 150, y: 268, s: 1.05 }] },
        { en: "I brush my teeth.", zh: "我刷牙。", bg: "room", words: [{ w: "brush", em: "🪥", zh: "刷" }, { w: "teeth", em: "🦷", zh: "牙齿" }], sc: [{ t: "kid", who: "dodo", x: 170, y: 268, s: 1.1 }, { t: "p", k: "stick", em: "🪥", x: 292, y: 258, s: 1.6 }] },
        { en: "I eat my egg.", zh: "我吃鸡蛋。", bg: "kitchen", words: [{ w: "eat", em: "😋", zh: "吃" }, { w: "egg", em: "🥚", zh: "鸡蛋" }], sc: [{ t: "p", k: "table", x: 250, y: 268, s: 1.3 }, { t: "p", k: "stick", em: "🍳", x: 250, y: 218, s: 1.3 }, { t: "kid", who: "leo", x: 110, y: 268, s: 1.0, opt: { face: "happy" } }] },
        { en: "I drink my milk.", zh: "我喝牛奶。", bg: "kitchen", words: [{ w: "drink", em: "🥤", zh: "喝" }, { w: "milk", em: "🥛", zh: "牛奶" }], sc: [{ t: "p", k: "table", x: 250, y: 268, s: 1.3 }, { t: "p", k: "stick", em: "🥛", x: 250, y: 216, s: 1.35 }, { t: "kid", who: "momo", x: 110, y: 268, s: 1.0 }] },
        { en: "I put on my bag.", zh: "我背上书包。", bg: "room", words: [{ w: "bag", em: "🎒", zh: "书包" }], sc: [{ t: "kid", who: "momo", x: 170, y: 268, s: 1.15, opt: { bag: true } }, { t: "kid", who: "leo", x: 290, y: 268, s: 1.1, opt: { face: "happy" } }] },
        { en: "Goodbye, everyone!", zh: "大家再见！", bg: "room", words: [{ w: "goodbye", em: "👋", zh: "再见" }], sc: [{ t: "adult", who: "mama", x: 300, y: 268, s: 1.2, opt: { wave: true } }, { t: "kid", who: "momo", x: 120, y: 268, s: 1.0, opt: { face: "happy", wave: true } }, { t: "kid", who: "dodo", x: 195, y: 268, s: 0.85, opt: { face: "happy", wave: true } }, { t: "dog", x: 258, y: 272, s: 0.8 }] }
      ]
    },

    /* ============ 5 ============ */
    {
      id: "where-is-fluffy", em: "🐶", lv: 2,
      title: "Where Is Fluffy?", zh: "毛毛在哪里？",
      pattern: "复现句型：Is he in/on/under…? — No! / Yes!",
      tip: [
        "这本书在教方位词 in / on / under / behind，读的时候用手比划位置。",
        "每一页都先猜一猜，再翻页揭晓，小朋友会特别期待。",
        "可以拿一个毛绒玩具藏在房间各处，玩真实的「Where is…?」游戏。"
      ],
      quiz: [
        { q: "Where is Fluffy?", zh: "毛毛最后在哪里？", opts: [{ em: "🧺", label: "in the basket", ok: true }, { em: "🛏️", label: "on the bed" }, { em: "🚪", label: "behind the door" }] },
        { q: "What is Fluffy doing?", zh: "毛毛在做什么？", opts: [{ em: "😴", label: "sleeping", ok: true }, { em: "🏃", label: "running" }, { em: "🍽️", label: "eating" }] },
        { q: "Shh! Be …", zh: "嘘！要怎么样？", opts: [{ em: "🤫", label: "quiet", ok: true }, { em: "📢", label: "loud" }] }
      ],
      pages: [
        { en: "Where is Fluffy?", zh: "毛毛在哪里？", bg: "room", words: [{ w: "where", em: "❓", zh: "哪里" }], sc: [{ t: "kid", who: "dodo", x: 150, y: 268, s: 1.05, opt: { face: "surprise" } }, { t: "p", k: "qm", x: 285, y: 175, s: 1.3 }] },
        { en: "Is he in the box?", zh: "他在箱子里吗？", bg: "room", words: [{ w: "in", em: "📥", zh: "在里面" }], sc: [{ t: "p", k: "toybox", x: 270, y: 268, s: 1.35, opt: { open: true } }, { t: "kid", who: "leo", x: 120, y: 268, s: 1.05 }] },
        { en: "Is he on the bed?", zh: "他在床上吗？", bg: "room", words: [{ w: "on", em: "🔝", zh: "在上面" }], sc: [{ t: "p", k: "bed", x: 265, y: 268, s: 1.3 }, { t: "kid", who: "momo", x: 110, y: 268, s: 1.0 }] },
        { en: "Is he under the table?", zh: "他在桌子下面吗？", bg: "kitchen", words: [{ w: "under", em: "⬇️", zh: "在下面" }], sc: [{ t: "p", k: "table", x: 260, y: 268, s: 1.35 }, { t: "kid", who: "dodo", x: 100, y: 268, s: 0.95, opt: { face: "surprise" } }] },
        { en: "Is he behind the door?", zh: "他在门后面吗？", bg: "room", words: [{ w: "behind", em: "🚪", zh: "在后面" }], sc: [{ t: "p", k: "door", x: 285, y: 268, s: 1.35 }, { t: "kid", who: "leo", x: 120, y: 268, s: 1.05 }] },
        { en: "Look! He is in the basket.", zh: "看！他在篮子里。", bg: "room", words: [{ w: "basket", em: "🧺", zh: "篮子" }], sc: [{ t: "p", k: "basket", x: 265, y: 268, s: 1.3 }, { t: "dog", x: 265, y: 238, s: 0.85, opt: { pose: "sit" } }, { t: "kid", who: "momo", x: 110, y: 268, s: 1.0, opt: { face: "happy" } }] },
        { en: "Fluffy is sleeping.", zh: "毛毛在睡觉。", bg: "room", words: [{ w: "sleeping", em: "😴", zh: "睡觉" }], sc: [{ t: "p", k: "basket", x: 255, y: 278, s: 1.4 }, { t: "dog", x: 255, y: 248, s: 0.9, opt: { pose: "sleep" } }, { t: "p", k: "zzz", x: 310, y: 190, s: 1.2 }] },
        { en: "Shh! Be quiet.", zh: "嘘！小声点。", bg: "room", words: [{ w: "quiet", em: "🤫", zh: "安静" }], sc: [{ t: "p", k: "basket", x: 285, y: 278, s: 1.15 }, { t: "dog", x: 285, y: 252, s: 0.75, opt: { pose: "sleep" } }, { t: "kid", who: "dodo", x: 130, y: 268, s: 1.05, opt: { face: "shh" } }] }
      ]
    },

    /* ============ 6 ============ */
    {
      id: "i-like-fruit", em: "🍎", lv: 2,
      title: "I Like Fruit", zh: "我喜欢水果",
      pattern: "复现句型：I like … / Do you like …? — Yes, I do!",
      tip: [
        "这本书是餐桌场景，吃水果的时候直接问：Do you like apples?",
        "小朋友只用回答 Yes / No，非常容易建立自信，先开口最重要。",
        "可以做真正的水果沙拉，边做边说 fruit、apple、banana。"
      ],
      quiz: [
        { q: "Which one is a fruit?", zh: "哪一个是水果？", opts: [{ em: "🍌", label: "banana", ok: true }, { em: "🚌", label: "bus" }, { em: "👟", label: "shoe" }] },
        { q: "Do you like fruit?", zh: "你喜欢水果吗？", opts: [{ em: "👍", label: "Yes, I do!", ok: true }, { em: "👎", label: "No, I don't" }] },
        { q: "What do they make?", zh: "他们做了什么？", opts: [{ em: "🥗", label: "fruit salad", ok: true }, { em: "🍜", label: "noodles" }] }
      ],
      pages: [
        { en: "I like fruit.", zh: "我喜欢水果。", bg: "kitchen", words: [{ w: "fruit", em: "🍇", zh: "水果" }], sc: [{ t: "p", k: "bowl", x: 265, y: 262, s: 1.35, em: "🍇" }, { t: "kid", who: "momo", x: 120, y: 268, s: 1.05, opt: { face: "happy" } }] },
        { en: "I like apples.", zh: "我喜欢苹果。", bg: "kitchen", words: [{ w: "apple", em: "🍎", zh: "苹果" }], sc: [{ t: "p", k: "stick", em: "🍎", x: 275, y: 252, s: 2.0 }, { t: "kid", who: "dodo", x: 130, y: 268, s: 1.0, opt: { face: "happy" } }] },
        { en: "I like bananas.", zh: "我喜欢香蕉。", bg: "kitchen", words: [{ w: "banana", em: "🍌", zh: "香蕉" }], sc: [{ t: "p", k: "stick", em: "🍌", x: 275, y: 252, s: 2.0 }, { t: "kid", who: "leo", x: 130, y: 268, s: 1.05, opt: { face: "happy" } }] },
        { en: "I like grapes.", zh: "我喜欢葡萄。", bg: "kitchen", words: [{ w: "grapes", em: "🍇", zh: "葡萄" }], sc: [{ t: "p", k: "stick", em: "🍇", x: 275, y: 252, s: 2.0 }, { t: "kid", who: "momo", x: 130, y: 268, s: 1.0, opt: { face: "happy" } }] },
        { en: "Do you like oranges?", zh: "你喜欢橙子吗？", bg: "kitchen", words: [{ w: "orange", em: "🍊", zh: "橙子" }], sc: [{ t: "p", k: "stick", em: "🍊", x: 275, y: 252, s: 2.0 }, { t: "kid", who: "dodo", x: 130, y: 268, s: 1.0, opt: { face: "surprise" } }] },
        { en: "Yes, I do!", zh: "是的，我喜欢！", bg: "kitchen", words: [{ w: "yes", em: "✅", zh: "是的" }], sc: [{ t: "p", k: "stick", em: "🍊", x: 265, y: 258, s: 1.7 }, { t: "kid", who: "dodo", x: 130, y: 268, s: 1.05, opt: { face: "happy" } }] },
        { en: "Let's make a fruit salad.", zh: "我们做水果沙拉吧。", bg: "kitchen", words: [{ w: "salad", em: "🥗", zh: "沙拉" }], sc: [{ t: "p", k: "bowl", x: 265, y: 264, s: 1.45, em: "🥗" }, { t: "kid", who: "momo", x: 105, y: 268, s: 0.95 }, { t: "kid", who: "leo", x: 168, y: 268, s: 1.0 }] },
        { en: "What a big smile!", zh: "笑得多开心！", bg: "kitchen", words: [{ w: "smile", em: "😄", zh: "笑容" }], sc: [{ t: "p", k: "bowl", x: 265, y: 266, s: 1.3, em: "🥗" }, { t: "kid", who: "momo", x: 110, y: 268, s: 1.0, opt: { face: "happy" } }, { t: "kid", who: "dodo", x: 180, y: 268, s: 0.9, opt: { face: "happy" } }] }
      ]
    },

    /* ============ 7 ============ */
    {
      id: "colours", em: "🌈", lv: 2,
      title: "Colours", zh: "颜色",
      pattern: "复现句型：The … is red / blue / yellow …",
      tip: [
        "颜色是最容易迁移的词，出门散步时看到什么就说什么颜色。",
        "读完可以玩「找一找」：Find something red! 让小朋友跑去找。",
        "不要求小朋友记住全部颜色，能主动说一个就是巨大的进步。"
      ],
      quiz: [
        { q: "What colour is the sky?", zh: "天空是什么颜色？", opts: [{ em: "🔵", label: "blue", ok: true }, { em: "🟢", label: "green" }, { em: "🔴", label: "red" }] },
        { q: "What colour is the duck?", zh: "鸭子是什么颜色？", opts: [{ em: "🟡", label: "yellow", ok: true }, { em: "🟣", label: "purple" }] },
        { q: "How many colours are there?", zh: "一共有多少种颜色？", opts: [{ em: "🔴🔵🟡🟢🟣", label: "many", ok: true }, { em: "⚫", label: "one" }] }
      ],
      pages: [
        { en: "Look at the rainbow.", zh: "看那道彩虹。", bg: "sky", words: [{ w: "rainbow", em: "🌈", zh: "彩虹" }], sc: [{ t: "p", k: "rainbow", x: 200, y: 150, s: 1.15 }, { t: "kid", who: "momo", x: 110, y: 272, s: 0.95 }, { t: "kid", who: "dodo", x: 180, y: 274, s: 0.8 }] },
        { en: "The flower is red.", zh: "花是红色的。", bg: "garden", words: [{ w: "flower", em: "🌸", zh: "花" }, { w: "red", em: "🔴", zh: "红色" }], sc: [{ t: "p", k: "flower", x: 265, y: 262, s: 1.6, color: "#e2564e" }, { t: "kid", who: "momo", x: 120, y: 268, s: 1.0 }] },
        { en: "The ball is blue.", zh: "球是蓝色的。", bg: "garden", words: [{ w: "blue", em: "🔵", zh: "蓝色" }], sc: [{ t: "p", k: "ball", x: 265, y: 268, s: 1.5, color: "#3d7ce0" }, { t: "kid", who: "leo", x: 120, y: 268, s: 1.05 }] },
        { en: "The duck is yellow.", zh: "鸭子是黄色的。", bg: "garden", words: [{ w: "duck", em: "🦆", zh: "鸭子" }, { w: "yellow", em: "🟡", zh: "黄色" }], sc: [{ t: "p", k: "stick", em: "🦆", x: 275, y: 258, s: 2.0 }, { t: "kid", who: "dodo", x: 125, y: 268, s: 1.0, opt: { face: "happy" } }] },
        { en: "The tree is green.", zh: "树是绿色的。", bg: "garden", words: [{ w: "green", em: "🟢", zh: "绿色" }], sc: [{ t: "p", k: "tree", x: 270, y: 264, s: 1.3 }, { t: "kid", who: "leo", x: 120, y: 268, s: 1.05 }] },
        { en: "The sky is blue.", zh: "天空是蓝色的。", bg: "sky", words: [{ w: "sky", em: "☁️", zh: "天空" }], sc: [{ t: "kid", who: "momo", x: 115, y: 272, s: 1.0, opt: { face: "happy" } }, { t: "kid", who: "leo", x: 190, y: 272, s: 1.0 }] },
        { en: "The kite is purple.", zh: "风筝是紫色的。", bg: "park", words: [{ w: "kite", em: "🪁", zh: "风筝" }, { w: "purple", em: "🟣", zh: "紫色" }], sc: [{ t: "p", k: "kite", x: 285, y: 100, s: 1.3 }, { t: "kid", who: "dodo", x: 130, y: 268, s: 1.0, opt: { face: "happy" } }] },
        { en: "I like all the colours.", zh: "我喜欢所有的颜色。", bg: "sky", words: [{ w: "colours", em: "🎨", zh: "颜色" }], sc: [{ t: "p", k: "rainbow", x: 200, y: 140, s: 1.0 }, { t: "kid", who: "momo", x: 100, y: 274, s: 0.95, opt: { face: "happy" } }, { t: "kid", who: "leo", x: 300, y: 274, s: 0.95, opt: { face: "happy" } }] }
      ]
    },

    /* ============ 8 ============ */
    {
      id: "good-night", em: "🌙", lv: 1,
      title: "Good Night", zh: "晚安",
      pattern: "复现句型：Good night, …",
      tip: [
        "这是最适合睡前读的一本，语速放慢，声音放轻。",
        "每一页说完 Good night 都可以亲一下小朋友，把英语和温暖连在一起。",
        "读完关灯前说一句 Good night, everyone! 作为每天的固定仪式。"
      ],
      quiz: [
        { q: "What can we see at night?", zh: "晚上能看见什么？", opts: [{ em: "🌙", label: "the moon", ok: true }, { em: "☀️", label: "the sun" }] },
        { q: "Who says good night to Fluffy?", zh: "谁跟毛毛说晚安？", opts: [{ em: "🧒", label: "Dodo", ok: true }, { em: "🐱", label: "Mimi" }] },
        { q: "Say good night:", zh: "晚安怎么说？", opts: [{ em: "🌙", label: "Good night!", ok: true }, { em: "🌅", label: "Good morning!" }] }
      ],
      pages: [
        { en: "It is night.", zh: "天黑了。", bg: "night", words: [{ w: "night", em: "🌙", zh: "夜晚" }], sc: [{ t: "kid", who: "dodo", x: 150, y: 268, s: 1.05 }] },
        { en: "The moon is up.", zh: "月亮出来了。", bg: "night", words: [{ w: "moon", em: "🌙", zh: "月亮" }], sc: [{ t: "p", k: "moon", x: 285, y: 80, s: 1.2 }, { t: "kid", who: "momo", x: 140, y: 268, s: 1.0, opt: { face: "happy" } }] },
        { en: "Good night, Mama.", zh: "晚安，妈妈。", bg: "night", words: [{ w: "good night", em: "🌙", zh: "晚安" }], sc: [{ t: "adult", who: "mama", x: 280, y: 268, s: 1.2 }, { t: "kid", who: "dodo", x: 140, y: 268, s: 1.0, opt: { face: "happy" } }] },
        { en: "Good night, Papa.", zh: "晚安，爸爸。", bg: "night", words: [{ w: "good night", em: "🌙", zh: "晚安" }], sc: [{ t: "adult", who: "papa", x: 280, y: 268, s: 1.25 }, { t: "kid", who: "momo", x: 140, y: 268, s: 1.0, opt: { face: "happy" } }] },
        { en: "Good night, Fluffy.", zh: "晚安，毛毛。", bg: "night", words: [{ w: "good night", em: "🌙", zh: "晚安" }], sc: [{ t: "p", k: "basket", x: 285, y: 276, s: 1.25 }, { t: "dog", x: 285, y: 248, s: 0.85, opt: { pose: "sleep" } }, { t: "kid", who: "dodo", x: 130, y: 268, s: 1.0 }] },
        { en: "Good night, teddy.", zh: "晚安，泰迪熊。", bg: "night", words: [{ w: "teddy", em: "🧸", zh: "泰迪熊" }], sc: [{ t: "p", k: "bed", x: 265, y: 272, s: 1.25 }, { t: "p", k: "stick", em: "🧸", x: 255, y: 208, s: 1.4 }, { t: "kid", who: "momo", x: 115, y: 268, s: 1.0 }] },
        { en: "Sleep tight, Dodo.", zh: "好好睡，豆豆。", bg: "night", words: [{ w: "sleep", em: "😴", zh: "睡觉" }], sc: [{ t: "p", k: "bed", x: 250, y: 276, s: 1.4 }, { t: "kid", who: "dodo", x: 300, y: 240, s: 0.7, opt: { lie: true } }, { t: "p", k: "zzz", x: 322, y: 150, s: 1.2 }] },
        { en: "Good night, everyone.", zh: "大家晚安。", bg: "night", words: [{ w: "everyone", em: "👨‍👩‍👧‍👦", zh: "大家" }], sc: [{ t: "p", k: "moon", x: 90, y: 70, s: 1.0 }, { t: "p", k: "bed", x: 240, y: 278, s: 1.3 }, { t: "kid", who: "momo", x: 288, y: 244, s: 0.6, opt: { lie: true } }, { t: "kid", who: "dodo", x: 308, y: 246, s: 0.52, opt: { lie: true } }] }
      ]
    }
  ];

  window.DailyTalkPicture = { CHARACTERS: CHARACTERS, BOOKS: BOOKS };
})();
