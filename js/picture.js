/* =========================================================
 * DailyTalk · 英语绘本启蒙（渲染 + 交互层）
 *
 * 组成：
 *   1) 场景渲染器：把 picture-data.js 里的场景描述画成 SVG 插画
 *      （固定小主人公 + 简单背景，原创手绘，无需任何图片素材）
 *   2) 阅读器：逐页读 / 磨耳朵(自动连读) / 跟读打分 / 小问答
 *   3) 语音：英文按词高亮朗读 + 中文解释，全部走 Web Speech API
 *
 * 依赖：js/picture-data.js（window.DailyTalkPicture）
 * ========================================================= */
(function () {
  "use strict";

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var D = window.DailyTalkPicture;
  if (!D) return;
  var BOOKS = D.BOOKS;
  var CHARS = D.CHARACTERS;

  var LS_KEY = "dailytalk_pb_progress";
  var LS_CFG = "dailytalk_pb_cfg";

  var cfg = { zh: true, sound: true, autoRead: true };
  var prog = { books: {}, speakStars: 0, earSec: 0 };

  function loadStore() {
    try { var c = JSON.parse(localStorage.getItem(LS_CFG) || "null"); if (c) cfg = Object.assign(cfg, c); } catch (e) { }
    try { var p = JSON.parse(localStorage.getItem(LS_CFG + "_p") || "null"); if (p) prog = Object.assign(prog, p); } catch (e) { }
  }
  function saveCfg() { try { localStorage.setItem(LS_CFG, JSON.stringify(cfg)); } catch (e) { } }
  function saveProg() { try { localStorage.setItem(LS_CFG + "_p", JSON.stringify(prog)); } catch (e) { } }
  function bp(id) { if (!prog.books[id]) prog.books[id] = { maxPage: 0, done: false, quiz: 0, stars: 0 }; return prog.books[id]; }

  /* =========================================================
   * 一、绘图基础
   * ========================================================= */
  var uidN = 0;
  function uid(p) { uidN++; return (p || "id") + uidN; }
  function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function n(v) { return Math.round(v * 100) / 100; }

  var C = {
    skin: "#f7d3b3", skin2: "#eec39f", blush: "#f9a8a8", ink: "#3d3229",
    momo: { hair: "#3b2a24", hair2: "#54382f", cloth: "#ff8fb1", cloth2: "#ffb7cd", shoe: "#e2564e", long: true },
    leo: { hair: "#5a3b22", hair2: "#77512f", cloth: "#5b8def", cloth2: "#8fb2f5", shoe: "#33518f" },
    dodo: { hair: "#8a5a2b", hair2: "#a97540", cloth: "#ffd23f", cloth2: "#ffe58a", shoe: "#e0a12a" },
    mama: { hair: "#4a2f28", hair2: "#63403a", cloth: "#b18cf0", cloth2: "#cbb0f8", shoe: "#6d4fa8", long: true },
    papa: { hair: "#33262a", hair2: "#4c3a3d", cloth: "#5bbf9c", cloth2: "#8ed8bf", shoe: "#2f7f68" },
    dog: { body: "#fdf3e3", shade: "#efdfc6", ear: "#d79a5b", nose: "#4a3b32" },
    cat: { body: "#d9deee", shade: "#c3cadf", ear: "#b3bcd6", nose: "#f2a3b3" }
  };

  function circle(cx, cy, r, fill, extra) { return '<circle cx="' + n(cx) + '" cy="' + n(cy) + '" r="' + n(r) + '" fill="' + fill + '"' + (extra || "") + '/>'; }
  function ellipse(cx, cy, rx, ry, fill, extra) { return '<ellipse cx="' + n(cx) + '" cy="' + n(cy) + '" rx="' + n(rx) + '" ry="' + n(ry) + '" fill="' + fill + '"' + (extra || "") + '/>'; }
  function rect(x, y, w, h, r, fill, extra) {
    return '<rect x="' + n(x) + '" y="' + n(y) + '" width="' + n(w) + '" height="' + n(h) + '" rx="' + n(r == null ? 0 : r) + '" fill="' + fill + '"' + (extra || "") + '/>';
  }
  function path(d, fill, extra) { return '<path d="' + d + '" fill="' + fill + '"' + (extra || "") + '/>'; }
  function line(x1, y1, x2, y2, w, color, cap) {
    return '<line x1="' + n(x1) + '" y1="' + n(y1) + '" x2="' + n(x2) + '" y2="' + n(y2) + '" stroke="' + color + '" stroke-width="' + n(w) + '" stroke-linecap="' + (cap || "round") + '"/>';
  }
  function text(x, y, str, size, color, weight) {
    return '<text x="' + n(x) + '" y="' + n(y) + '" text-anchor="middle" font-size="' + n(size) + '" font-weight="' + (weight || 400) + '" fill="' + color + '" font-family="Segoe UI Emoji,Apple Color Emoji,Noto Color Emoji,sans-serif">' + esc(str) + '</text>';
  }
  function g(inner, transform) { return "<g" + (transform ? ' transform="' + transform + '"' : "") + ">" + inner + "</g>"; }

  /* ---------- 人物：小朋友 / 大人 ---------- */
  /* 以「脚底」为原点，向上为负方向；整体身高约 96 */
  function drawKid(o) {
    var who = o.who || "momo";
    var c = C[who] || C.momo;
    var op = o.opt || {};
    var adult = who === "mama" || who === "papa";
    if (op.adult) adult = true;
    var H = adult ? 116 : 96;             /* 总高 */
    var headR = adult ? 19 : 17;
    var bodyTop = -H + headR * 2 + 4;
    var bodyBot = adult ? -30 : -24;
    var parts = [];

    /* 腿 */
    var legTop = bodyBot + 2, legBot = -5;
    parts.push(rect(-8, legTop, 6.5, legBot - legTop, 3, C.skin2));
    parts.push(rect(1.5, legTop, 6.5, legBot - legTop, 3, C.skin2));
    /* 鞋 */
    var shoeC = op.shoes || c.shoe;
    parts.push(ellipse(-5, -3, 7.5, 4.2, shoeC));
    parts.push(ellipse(5, -3, 7.5, 4.2, shoeC));

    /* 身体 */
    if (op.coat) {
      parts.push(path("M -15 " + bodyBot + " L -14 " + bodyTop + " Q 0 " + (bodyTop - 5) + " 14 " + bodyTop + " L 15 " + bodyBot + " Z", op.coat));
      parts.push(line(0, bodyTop + 4, 0, bodyBot - 2, 1.4, "rgba(0,0,0,.18)"));
      parts.push(circle(0, bodyTop + 14, 1.6, "rgba(0,0,0,.22)"));
      parts.push(circle(0, bodyTop + 24, 1.6, "rgba(0,0,0,.22)"));
    } else if (c.long && !adult) {
      /* 连衣裙 */
      parts.push(path("M -9 " + bodyTop + " L 9 " + bodyTop + " L 17 " + bodyBot + " L -17 " + bodyBot + " Z", c.cloth));
      parts.push(rect(-10, bodyTop - 3, 20, 7, 3.5, c.cloth2));
    } else {
      parts.push(rect(-15, bodyTop, 30, bodyBot - bodyTop, 10, c.cloth));
      parts.push(rect(-15, bodyBot - 7, 30, 7, 3.5, c.cloth2));
    }

    /* 手臂 */
    var armY = bodyTop + 9;
    if (op.wave) {
      parts.push(rect(-22, armY - 16, 6.5, 20, 3.2, C.skin, ' transform="rotate(-16 -19 ' + n(armY) + ')"'));
      parts.push(rect(15, armY - 22, 6.5, 22, 3.2, C.skin, ' transform="rotate(22 18 ' + n(armY) + ')"'));
      parts.push(circle(23, armY - 24, 4.4, C.skin));
    } else {
      parts.push(rect(-21, armY, 6.5, adult ? 26 : 22, 3.2, C.skin));
      parts.push(rect(14.5, armY, 6.5, adult ? 26 : 22, 3.2, C.skin));
    }

    /* 背包 */
    if (op.bag) {
      parts.push(rect(-17, bodyTop + 6, 34, 22, 7, "#e2564e"));
      parts.push(rect(-9, bodyTop + 9, 18, 14, 4, "#f4796f"));
      parts.push(line(-8, bodyTop + 6, -12, bodyTop - 6, 3, "#c9483f", "butt"));
    }

    /* 头 */
    var headY = -H + headR;
    parts.push(rect(-4, headY + headR - 3, 8, 8, 3, C.skin2));
    parts.push(circle(0, headY, headR, C.skin));
    /* 头发 */
    parts.push(path(
      "M " + (-headR - 0.5) + " " + (headY - 1) +
      " A " + (headR + 0.5) + " " + (headR + 2) + " 0 0 1 " + (headR + 0.5) + " " + (headY - 1) +
      " Q " + (headR - 2) + " " + (headY - 8) + " 0 " + (headY - 9) +
      " Q " + (-headR + 2) + " " + (headY - 8) + " " + (-headR - 0.5) + " " + (headY - 1) + " Z", c.hair));
    if (who === "momo") {
      parts.push(circle(-headR - 2, headY - 3, 6.2, c.hair));
      parts.push(circle(headR + 2, headY - 3, 6.2, c.hair));
      parts.push(circle(-headR - 2, headY - 3, 2.6, c.hair2));
      parts.push(circle(headR + 2, headY - 3, 2.6, c.hair2));
    } else if (who === "mama") {
      parts.push(ellipse(-headR + 2, headY + 6, 8, 13, c.hair));
      parts.push(ellipse(headR - 2, headY + 6, 8, 13, c.hair));
    } else if (who === "leo" || who === "papa") {
      parts.push(path("M " + (-headR + 1) + " " + (headY - 4) + " Q 0 " + (headY - headR - 3) + " " + (headR - 1) + " " + (headY - 4) + " Q 0 " + (headY - 8) + " " + (-headR + 1) + " " + (headY - 4) + " Z", c.hair2));
    } else {
      parts.push(path("M -3 " + (headY - headR) + " q 3 -7 6 -1 q 3 -6 5 1", c.hair2));
    }

    /* 五官 */
    var ex = 6.2, ey = headY + 1.5;
    if (op.lie) { /* 闭眼睡觉 */
      parts.push(path("M " + (-ex - 3) + " " + ey + " q 3 3 6 0", "none", ' stroke="' + C.ink + '" stroke-width="1.6" stroke-linecap="round"'));
      parts.push(path("M " + (ex - 3) + " " + ey + " q 3 3 6 0", "none", ' stroke="' + C.ink + '" stroke-width="1.6" stroke-linecap="round"'));
    } else if (op.face === "shh") {
      parts.push(circle(-ex, ey, 2.4, C.ink));
      parts.push(path("M " + (ex - 3.6) + " " + (ey - 1) + " q 3.6 -2.6 7.2 0", "none", ' stroke="' + C.ink + '" stroke-width="1.8" stroke-linecap="round"'));
    } else if (op.face === "sad") {
      parts.push(circle(-ex, ey, 2.3, C.ink));
      parts.push(circle(ex, ey, 2.3, C.ink));
      parts.push(path("M -4.5 " + (headY + 8) + " q 4.5 -4 9 0", "none", ' stroke="' + C.ink + '" stroke-width="1.8" stroke-linecap="round"'));
    } else {
      parts.push(circle(-ex, ey, op.face === "surprise" ? 3 : 2.3, C.ink));
      parts.push(circle(ex, ey, op.face === "surprise" ? 3 : 2.3, C.ink));
      if (op.face === "surprise") parts.push(ellipse(0, headY + 10, 3.4, 4, C.ink));
      else parts.push(path("M -4.5 " + (headY + 6.5) + " q 4.5 5 9 0", "none", ' stroke="' + C.ink + '" stroke-width="1.8" stroke-linecap="round"'));
      parts.push(circle(-headR + 2.5, headY + 6, 3.2, C.blush, ' opacity=".55"'));
      parts.push(circle(headR - 2.5, headY + 6, 3.2, C.blush, ' opacity=".55"'));
    }

    /* 帽子（戴在头上） */
    if (op.hat === "straw") {
      var hy = headY - headR + 1;
      parts.push(ellipse(0, hy, headR + 9, 5, "#f0c977"));
      parts.push(path("M " + (-headR + 1) + " " + hy + " q " + (headR - 1) + " -18 " + (headR * 2 - 2) + " 0 Z", "#f7dda1"));
      parts.push(rect(-headR + 1, hy - 3, headR * 2 - 2, 4, 2, "#e2564e"));
    }

    var tr;
    if (op.lie) {
      /* 躺下：整体旋转 90°，头朝左，脚在 (x,y) */
      tr = "translate(" + n(o.x) + "," + n(o.y) + ") rotate(-90) scale(" + n(o.s == null ? 1 : o.s) + ")";
    } else {
      tr = "translate(" + n(o.x) + "," + n(o.y) + ") scale(" + n(((o.s == null ? 1 : o.s)) * (op.flip ? -1 : 1)) + "," + n(o.s == null ? 1 : o.s) + ")";
    }
    return g(parts.join(""), tr);
  }

  /* ---------- 小狗 Fluffy ---------- */
  function drawDog(o) {
    var c = C.dog, op = o.opt || {}, p = [];
    var pose = op.pose || "stand";
    var s = o.s == null ? 1 : o.s;
    function leg(x, y1, y2, w) { p.push(rect(x, Math.min(y1, y2), w, Math.abs(y2 - y1), w / 2, c.body)); }
    function head(hx, hy) {
      var hp = [];
      hp.push(ellipse(hx - 8, hy - 9, 8, 10, c.ear, ' transform="rotate(-18 ' + n(hx - 8) + ' ' + n(hy - 9) + ')"'));
      hp.push(ellipse(hx + 8, hy - 10, 8, 10, c.ear, ' transform="rotate(16 ' + n(hx + 8) + ' ' + n(hy - 10) + ')"'));
      hp.push(circle(hx, hy, 15, c.body));
      hp.push(ellipse(hx - 8, hy + 5, 9, 7.5, "#fff"));
      hp.push(circle(hx - 13, hy + 2.5, 3.2, c.nose));
      hp.push(circle(hx - 4, hy - 4, 2.4, C.ink));
      hp.push(path("M " + (hx - 12) + " " + (hy + 10) + " q 6 6 12 0", "#f27b8e", ' opacity=".8"'));
      if (op.hat === "straw") {
        hp.push(ellipse(hx, hy - 15, 21, 5, "#f0c977"));
        hp.push(path("M " + (hx - 12) + " " + (hy - 15) + " q 12 -17 24 0 Z", "#f7dda1"));
      }
      if (op.face === "sad") hp.push(path("M " + (hx - 8) + " " + (hy - 9) + " q 4 -3 8 0", "none", ' stroke="' + C.ink + '" stroke-width="1.6" stroke-linecap="round"'));
      return hp.join("");
    }
    if (pose === "sleep") {          /* 卷成一团睡觉 */
      p.push(ellipse(0, -13, 26, 15, c.body));
      p.push(ellipse(-2, -8, 17, 7, c.shade, ' opacity=".5"'));
      p.push(path("M 18 -16 q 15 -3 12 -14", "none", ' stroke="' + c.body + '" stroke-width="6" stroke-linecap="round"'));
      p.push(circle(-19, -19, 12, c.body));
      p.push(ellipse(-27, -26, 6.5, 9, c.ear, ' transform="rotate(-22 -27 -26)"'));
      p.push(path("M -24 -19 q 4 3 8 0", "none", ' stroke="' + C.ink + '" stroke-width="1.6" stroke-linecap="round"'));
      p.push(ellipse(-28, -13, 6, 5, "#fff"));
      p.push(circle(-31.5, -14.5, 2.5, c.nose));
    } else if (pose === "sit") {
      leg(-16, -22, -5, 6); leg(-6, -22, -5, 6);
      p.push(ellipse(0, -18, 22, 18, c.body));
      p.push(ellipse(12, -11, 9, 8, c.shade));
      p.push(path("M 18 -28 q 13 -6 9 -17", "none", ' stroke="' + c.body + '" stroke-width="6" stroke-linecap="round"'));
      p.push(head(-21, -42));
    } else if (pose === "run") {
      leg(-16, -16, -2, 6); leg(-8, -16, -4, 6); leg(10, -16, -2, 6); leg(18, -16, -6, 6);
      p.push(ellipse(0, -28, 27, 14, c.body));
      p.push(ellipse(-6, -25, 17, 8, c.shade, ' opacity=".6"'));
      p.push(path("M 24 -32 q 15 -3 13 -14", "none", ' stroke="' + c.body + '" stroke-width="7" stroke-linecap="round"'));
      p.push(head(-25, -44));
    } else if (pose === "jump") {
      leg(-14, -18, -8, 6); leg(-6, -20, -10, 6); leg(10, -20, -10, 6); leg(17, -18, -8, 6);
      p.push(ellipse(0, -30, 26, 15, c.body));
      p.push(path("M 23 -34 q 16 -9 11 -20", "none", ' stroke="' + c.body + '" stroke-width="7" stroke-linecap="round"'));
      p.push(head(-24, -46));
    } else {                          /* stand */
      leg(-18, -18, -3, 6); leg(-8, -18, -3, 6); leg(10, -18, -3, 6); leg(19, -18, -3, 6);
      p.push(ellipse(0, -28, 27, 15, c.body));
      p.push(ellipse(-6, -25, 17, 8, c.shade, ' opacity=".6"'));
      p.push(path("M 24 -32 q 12 -6 8 -16", "none", ' stroke="' + c.body + '" stroke-width="7" stroke-linecap="round"'));
      p.push(head(-25, -44));
    }
    var tr = "translate(" + n(o.x) + "," + n(o.y) + ") scale(" + n(s * (op.flip ? -1 : 1)) + "," + n(s) + ")";
    return g(p.join(""), tr);
  }

  /* ---------- 猫咪 Mimi ---------- */
  function drawCat(o) {
    var c = C.cat, op = o.opt || {}, p = [];
    var pose = op.pose || "stand";
    p.push(ellipse(0, -24, 22, 13, c.body));
    var legs = pose === "run" ? [[-14, -4, -17], [-5, -2, -15], [8, -4, -17], [15, -8, -14]] : [[-13, -4, -15], [-4, -4, -15], [7, -4, -15], [15, -4, -15]];
    legs.forEach(function (L) { p.push(rect(Math.min(L[0], L[0]), Math.min(L[1], L[2]), 5, Math.abs(L[2] - L[1]), 2.5, c.body)); });
    p.push(path("M 20 -30 q 16 -4 12 -20", "none", ' stroke="' + c.body + '" stroke-width="6" stroke-linecap="round"'));
    p.push(circle(-16, -40, 13, c.body));
    p.push(path("M -26 -50 l -2 -12 l 11 6 Z", c.ear));
    p.push(path("M -8 -50 l 2 -12 l -11 6 Z", c.ear));
    p.push(path("M -22 -52 l 0 -6 l 5 3 Z", "#f2a3b3"));
    p.push(circle(-21, -42, 2.2, C.ink));
    p.push(circle(-11, -42, 2.2, C.ink));
    p.push(circle(-16, -37, 2.2, c.nose));
    p.push(line(-26, -38, -32, -39, 1.3, "#9aa3b8"));
    p.push(line(-26, -35, -32, -34, 1.3, "#9aa3b8"));
    p.push(line(-6, -38, 0, -39, 1.3, "#9aa3b8"));
    p.push(line(-6, -35, 0, -34, 1.3, "#9aa3b8"));
    p.push(ellipse(-6, -22, 8, 4, c.shade));
    var tr = "translate(" + n(o.x) + "," + n(o.y) + ") scale(" + n((o.s == null ? 1 : o.s) * (op.flip ? -1 : 1)) + "," + n(o.s == null ? 1 : o.s) + ")";
    return g(p.join(""), tr);
  }

  /* ---------- 道具 ---------- */
  var PROPS = {
    tree: function (o) {
      var s = o.s == null ? 1 : o.s, p = [];
      p.push(rect(-7, -46, 14, 46, 3, "#a2703f"));
      p.push(circle(0, -78, 30, "#5fbf6a"));
      p.push(circle(-24, -60, 22, "#6ecc79"));
      p.push(circle(24, -60, 22, "#6ecc79"));
      p.push(circle(-8, -96, 20, "#7ddb88"));
      p.push(circle(14, -88, 15, "#8fe69a"));
      p.push(ellipse(0, 0, 26, 6, "rgba(0,0,0,.10)"));
      return g(p.join(""), "translate(" + n(o.x) + "," + n(o.y) + ") scale(" + n(s) + ")");
    },
    swing: function (o) {
      var s = o.s == null ? 1 : o.s, p = [];
      p.push(line(-46, 0, -18, -84, 6, "#b9a06a"));
      p.push(line(46, 0, 18, -84, 6, "#b9a06a"));
      p.push(line(-18, -84, 18, -84, 6, "#b9a06a"));
      p.push(line(-30, -40, 18, -40, 5, "#b9a06a"));
      p.push(line(-9, -84, -9, -22, 2.4, "#8a8f9c"));
      p.push(line(9, -84, 9, -22, 2.4, "#8a8f9c"));
      p.push(rect(-19, -22, 38, 6, 3, "#e2564e"));
      p.push(ellipse(0, 0, 40, 6, "rgba(0,0,0,.10)"));
      return g(p.join(""), "translate(" + n(o.x) + "," + n(o.y) + ") scale(" + n(s) + ")");
    },
    bird: function (o) {
      var s = o.s == null ? 1 : o.s, p = [];
      p.push(ellipse(0, 0, 16, 11, "#63b3f5"));
      p.push(path("M 10 -6 q 14 -2 18 -10 q -6 12 -18 14 Z", "#3f97e0"));
      p.push(circle(-11, -6, 8.5, "#7cc1f8"));
      p.push(path("M -18 -6 l -7 3 l 7 3 Z", "#f5a623"));
      p.push(circle(-13, -9, 1.9, C.ink));
      p.push(path("M -2 -2 q 6 -8 12 0 q -6 5 -12 0", "#a8d8ff"));
      return g(p.join(""), "translate(" + n(o.x) + "," + n(o.y) + ") scale(" + n(s) + ")");
    },
    flower: function (o) {
      var s = o.s == null ? 1 : o.s, col = o.color || "#e2564e", p = [];
      p.push(line(0, 0, 0, -30, 4, "#5fbf6a"));
      p.push(ellipse(-9, -18, 8, 5, "#6ecc79", ' transform="rotate(-24 -9 -18)"'));
      p.push(ellipse(9, -24, 8, 5, "#6ecc79", ' transform="rotate(24 9 -24)"'));
      for (var i = 0; i < 6; i++) {
        var a = i * Math.PI / 3;
        p.push(circle(Math.cos(a) * 11, -40 + Math.sin(a) * 11, 8, col));
      }
      p.push(circle(0, -40, 7, "#ffd23f"));
      return g(p.join(""), "translate(" + n(o.x) + "," + n(o.y) + ") scale(" + n(s) + ")");
    },
    ball: function (o) {
      var s = o.s == null ? 1 : o.s, col = o.color || "#e2564e", r = 20;
      var p = [circle(0, -r, r, col)];
      /* 左上高光弧 + 高光点，让它看起来像一颗皮球 */
      p.push(path("M " + n(-r * .62) + " " + n(-r * 1.55) + " a " + n(r * .95) + " " + n(r * .95) + " 0 0 1 " + n(r * 1.05) + " .05", "none",
        ' stroke="rgba(255,255,255,.85)" stroke-width="4.5" fill="none" stroke-linecap="round"'));
      p.push(circle(-r * .4, -r * 1.42, r * .14, "#fff", ' opacity=".95"'));
      p.push(ellipse(0, 0, r * .8, 4, "rgba(0,0,0,.12)"));
      return g(p.join(""), "translate(" + n(o.x) + "," + n(o.y) + ") scale(" + n(s) + ")");
    },
    toybox: function (o) {
      var s = o.s == null ? 1 : o.s, open = o.opt && o.opt.open, p = [];
      if (open) p.push(path("M -34 -34 L 34 -34 L 24 -72 L -24 -72 Z", "#e8b04b"));
      p.push(rect(-36, -36, 72, 36, 5, "#f0a73f"));
      p.push(rect(-36, -36, 72, 9, 3, "#ffc46b"));
      p.push(rect(-6, -22, 12, 8, 3, "#d98d2a"));
      if (open) {
        p.push(circle(-16, -44, 8, "#e2564e"));
        p.push(rect(-4, -50, 14, 12, 3, "#5b8def"));
        p.push(circle(16, -46, 7, "#ffd23f"));
      } else {
        p.push(rect(-38, -44, 76, 10, 4, "#ffc46b"));
      }
      p.push(ellipse(0, 0, 34, 5, "rgba(0,0,0,.12)"));
      return g(p.join(""), "translate(" + n(o.x) + "," + n(o.y) + ") scale(" + n(s) + ")");
    },
    bed: function (o) {
      var s = o.s == null ? 1 : o.s, p = [];
      p.push(rect(-52, -34, 8, 34, 3, "#c99a6a"));
      p.push(rect(44, -46, 8, 46, 3, "#c99a6a"));
      p.push(rect(-52, -22, 104, 12, 4, "#e8d3b8"));
      p.push(rect(-52, -34, 104, 14, 5, "#7fb2f0"));
      p.push(rect(-50, -38, 26, 12, 5, "#fff"));
      p.push(ellipse(20, -30, 26, 9, "#a9c9f7"));
      return g(p.join(""), "translate(" + n(o.x) + "," + n(o.y) + ") scale(" + n(s) + ")");
    },
    table: function (o) {
      var s = o.s == null ? 1 : o.s, p = [];
      p.push(rect(-46, -46, 92, 9, 4, "#d9a86a"));
      p.push(rect(-38, -37, 7, 37, 3, "#c2904f"));
      p.push(rect(31, -37, 7, 37, 3, "#c2904f"));
      p.push(ellipse(0, 0, 44, 5, "rgba(0,0,0,.10)"));
      return g(p.join(""), "translate(" + n(o.x) + "," + n(o.y) + ") scale(" + n(s) + ")");
    },
    door: function (o) {
      var s = o.s == null ? 1 : o.s, p = [];
      p.push(rect(-34, -132, 68, 132, 5, "#f6f2ea"));
      p.push(rect(-28, -124, 56, 116, 4, "#c98f56"));
      p.push(rect(-22, -116, 44, 46, 3, "#b87f47"));
      p.push(rect(-22, -62, 44, 46, 3, "#b87f47"));
      p.push(circle(18, -62, 4, "#ffd23f"));
      return g(p.join(""), "translate(" + n(o.x) + "," + n(o.y) + ") scale(" + n(s) + ")");
    },
    basket: function (o) {
      var s = o.s == null ? 1 : o.s, p = [];
      p.push(path("M -34 -6 L 34 -6 L 26 -32 L -26 -32 Z", "#e2c188"));
      p.push(rect(-36, -10, 72, 6, 3, "#d3ac6c"));
      for (var i = -3; i <= 3; i++) p.push(line(i * 9, -32, i * 11, -6, 1.6, "#cdab7d"));
      p.push(path("M -34 -6 Q 0 -44 34 -6", "none", ' stroke="#d3ac6c" stroke-width="4" fill="none"'));
      p.push(ellipse(0, 0, 32, 5, "rgba(0,0,0,.12)"));
      return g(p.join(""), "translate(" + n(o.x) + "," + n(o.y) + ") scale(" + n(s) + ")");
    },
    moon: function (o) {
      var s = o.s == null ? 1 : o.s, p = [];
      p.push(circle(0, 0, 34, "#fff8d6", ' opacity=".22"'));
      /* 月牙：外弧（大圆）+ 内弧（更平的回弧） */
      p.push(path("M 10 -24 A 26 26 0 1 0 10 24 A 38 38 0 0 1 10 -24 Z", "#ffe9a3"));
      p.push(circle(-30, -26, 2.6, "#fff8d6"));
      p.push(circle(-40, 6, 2, "#fff8d6"));
      p.push(circle(30, -34, 2.2, "#fff8d6"));
      return g(p.join(""), "translate(" + n(o.x) + "," + n(o.y) + ") scale(" + n(s) + ")");
    },
    rainbow: function (o) {
      var s = o.s == null ? 1 : o.s, cols = ["#e2564e", "#f7913a", "#ffd23f", "#5fbf6a", "#4aa8e8", "#8e6ff0"], p = [];
      for (var i = 0; i < cols.length; i++) {
        var r = 104 - i * 12;
        p.push(path("M " + (-r) + " 0 A " + r + " " + r + " 0 0 1 " + r + " 0", "none",
          ' stroke="' + cols[i] + '" stroke-width="12" fill="none"'));
      }
      return g(p.join(""), "translate(" + n(o.x) + "," + n(o.y) + ") scale(" + n(s) + ")");
    },
    kite: function (o) {
      var s = o.s == null ? 1 : o.s, p = [];
      p.push(path("M 0 -40 L 26 0 L 0 40 L -26 0 Z", "#8e6ff0"));
      p.push(path("M 0 -40 L 26 0 L 0 0 Z", "#a98cf5"));
      p.push(line(0, -40, 0, 40, 1.4, "rgba(255,255,255,.7)"));
      p.push(line(-26, 0, 26, 0, 1.4, "rgba(255,255,255,.7)"));
      p.push(path("M 0 40 q 10 12 -2 22 q -10 10 2 20", "none", ' stroke="#9aa3b8" stroke-width="2" fill="none"'));
      p.push(path("M -6 62 l 12 5 l -7 6 Z", "#ffd23f"));
      p.push(path("M -4 84 l 12 5 l -7 6 Z", "#ff8fb1"));
      return g(p.join(""), "translate(" + n(o.x) + "," + n(o.y) + ") scale(" + n(s) + ")");
    },
    bowl: function (o) {
      var s = o.s == null ? 1 : o.s, em = o.em || "🥗", p = [];
      p.push(path("M -34 -14 A 34 22 0 0 0 34 -14 Z", "#5b8def"));
      p.push(rect(-36, -20, 72, 7, 3.5, "#7fa8f5"));
      p.push(text(0, -8, em, 22, "#000"));
      return g(p.join(""), "translate(" + n(o.x) + "," + n(o.y) + ") scale(" + n(s) + ")");
    },
    sink: function (o) {
      var s = o.s == null ? 1 : o.s, p = [];
      p.push(rect(-46, -40, 92, 40, 5, "#e8eef7"));
      p.push(rect(-46, -46, 92, 8, 4, "#cfd9e8"));
      p.push(ellipse(0, -40, 26, 8, "#bcd0e6"));
      p.push(rect(-3, -72, 6, 32, 3, "#b8c6da"));
      p.push(path("M 0 -72 q 14 0 14 10", "none", ' stroke="#b8c6da" stroke-width="6" fill="none"'));
      p.push(path("M 14 -60 q 0 8 -4 12", "none", ' stroke="#8fc7f0" stroke-width="4" fill="none"'));
      p.push(ellipse(0, 0, 42, 5, "rgba(0,0,0,.10)"));
      return g(p.join(""), "translate(" + n(o.x) + "," + n(o.y) + ") scale(" + n(s) + ")");
    },
    zzz: function (o) {
      var s = o.s == null ? 1 : o.s;
      return g(text(0, 0, "z Z z", 26, "#8fa6d8", 700), "translate(" + n(o.x) + "," + n(o.y) + ") scale(" + n(s) + ")");
    },
    qm: function (o) {
      var s = o.s == null ? 1 : o.s, p = [];
      p.push(circle(0, -18, 26, "#fff", ' opacity=".92"'));
      p.push(text(0, -8, "?", 34, "#4f6df5", 800));
      return g(p.join(""), "translate(" + n(o.x) + "," + n(o.y) + ") scale(" + n(s) + ")");
    },
    /* 通用「贴纸」道具：用 emoji 呈现具体小物件（颜色鲜艳、小朋友好认） */
    stick: function (o) {
      var s = o.s == null ? 1 : o.s, em = o.em || "⭐", r = 27;
      var p = [circle(0, -r, r, "#fff", ' opacity=".94"'), text(0, -r + 13, em, 40, "#000")];
      p.push(ellipse(0, 0, r * .8, 4, "rgba(0,0,0,.10)"));
      return g(p.join(""), "translate(" + n(o.x) + "," + n(o.y) + ") scale(" + n(s) + ")");
    }
  };

  /* ---------- 背景 ---------- */
  function bgDefs(kind) {
    var id = uid("bg");
    if (kind === "night") {
      return {
        id: id,
        defs: '<linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1c2c58"/><stop offset="1" stop-color="#3a4d85"/></linearGradient>'
      };
    }
    if (kind === "sky") {
      return {
        id: id,
        defs: '<linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fd8ff"/><stop offset="1" stop-color="#dff1ff"/></linearGradient>'
      };
    }
    return {
      id: id,
      defs: '<linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a9dcff"/><stop offset="1" stop-color="#e3f4ff"/></linearGradient>'
    };
  }

  function sun(x, y, r, soft) {
    var p = [circle(x, y, r * 1.7, "#ffe9a3", ' opacity=".35"'), circle(x, y, r, "#ffd23f")];
    if (!soft) return p.join("");
    return p.join("");
  }
  function cloud(x, y, s) {
    var p = [];
    p.push(ellipse(x, y, 26 * s, 15 * s, "#fff", ' opacity=".95"'));
    p.push(ellipse(x - 20 * s, y + 5 * s, 17 * s, 11 * s, "#fff", ' opacity=".95"'));
    p.push(ellipse(x + 20 * s, y + 5 * s, 18 * s, 12 * s, "#fff", ' opacity=".95"'));
    return p.join("");
  }

  function bgSvg(kind) {
    var b = bgDefs(kind), id = b.id, p = [];
    if (kind === "garden" || kind === "park") {
      p.push(rect(0, 0, 400, 300, 0, "url(#" + id + ")"));
      p.push(sun(kind === "park" ? 62 : 340, 52, 26));
      p.push(cloud(110, 54, 1));
      p.push(cloud(300, 90, .7));
      p.push(path("M 0 232 Q 90 200 200 226 T 400 214 L 400 300 L 0 300 Z", "#8fd88f"));
      p.push(ellipse(200, 268, 230, 40, "#7ecb7e", ' opacity=".55"'));
      if (kind === "park") {
        p.push(path("M 120 300 Q 170 250 240 238 L 300 238 Q 250 262 220 300 Z", "#f2e2bd"));
      } else {
        p.push(path("M 0 246 L 400 246", "none", ' stroke="#f2e2bd" stroke-width="0" '));
        for (var i = 0; i < 5; i++) p.push(PROPS.flower({ x: 42 + i * 82, y: 268, s: .55, color: ["#e2564e", "#ffd23f", "#ff8fb1", "#8e6ff0", "#e2564e"][i] }));
      }
    } else if (kind === "room" || kind === "kitchen") {
      p.push(rect(0, 0, 400, 300, 0, "#fdf0e2"));
      var tile = kind === "kitchen";
      if (tile) {
        for (var r = 0; r < 3; r++) for (var c = 0; c < 8; c++) {
          p.push(rect(c * 50 + 1, r * 40 + 1, 48, 38, 4, (r + c) % 2 ? "#f6f9ff" : "#eaf1fb"));
        }
      }
      p.push(rect(0, 216, 400, 84, 0, "#f2cfa3"));
      p.push(rect(0, 210, 400, 8, 0, "#e0b689"));
      for (var f = 0; f < 6; f++) p.push(line(f * 68 + 20, 218, f * 68 + 20, 300, 1.5, "rgba(190,150,110,.35)"));
      if (!tile) {
        p.push(rect(28, 54, 92, 74, 6, "#cfe6ff"));
        p.push(rect(28, 54, 92, 74, 6, "none", ' stroke="#fff" stroke-width="6"'));
        p.push(line(74, 54, 74, 128, 5, "#fff"));
        p.push(line(28, 92, 120, 92, 5, "#fff"));
        p.push(rect(30, 90, 30, 26, 2, "#9fd8ff", ' opacity=".8"'));
      }
      p.push(rect(0, 204, 400, 8, 0, "#e8d6bd"));
    } else if (kind === "night") {
      p.push(rect(0, 0, 400, 300, 0, "url(#" + id + ")"));
      var pts = [[40, 40], [110, 26], [170, 66], [250, 36], [320, 62], [370, 30], [80, 96], [210, 104], [350, 108], [140, 130], [300, 140]];
      pts.forEach(function (pt, i) {
        p.push('<path d="M ' + pt[0] + ' ' + (pt[1] - 5) + ' l 1.6 3.4 l 3.6 .5 l -2.6 2.6 l .6 3.6 l -3.2 -1.7 l -3.2 1.7 l .6 -3.6 l -2.6 -2.6 l 3.6 -.5 Z" fill="#fff8d6" opacity="' + (i % 3 ? .95 : .7) + '"/>');
      });
      p.push(PROPS.moon({ x: 332, y: 62, s: .95 }));
      p.push(rect(18, 40, 118, 92, 8, "#7f92c9", ' opacity=".9"'));
      p.push(rect(24, 46, 106, 80, 5, "#1a2748"));
      p.push(PROPS.moon({ x: 62, y: 78, s: .55 }));
      p.push(line(77, 46, 77, 126, 4, "#7f92c9"));
      p.push(line(24, 86, 130, 86, 4, "#7f92c9"));
      p.push(rect(0, 224, 400, 76, 0, "#4a5680"));
      p.push(rect(0, 216, 400, 10, 0, "#5c6a99"));
      p.push(ellipse(200, 280, 190, 26, "#3f4a70", ' opacity=".8"'));
    } else { /* sky */
      p.push(rect(0, 0, 400, 300, 0, "url(#" + id + ")"));
      p.push(sun(330, 54, 26));
      p.push(cloud(120, 70, 1.1));
      p.push(cloud(280, 130, .8));
      p.push(cloud(80, 160, .7));
      p.push(ellipse(200, 300, 250, 34, "#a8e6a1", ' opacity=".85"'));
    }
    return "<defs>" + b.defs + "</defs>" + p.join("");
  }

  /* ---------- 整页场景 ---------- */
  function sceneSvg(page, opts) {
    opts = opts || {};
    var cid = uid("clip");
    var inner = [sceneLayers(page)];
    var out = '<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid meet" role="img" aria-label="' + esc(opts.alt || page.en) + '">';
    out += "<defs>" + '<clipPath id="' + cid + '"><rect x="0" y="0" width="400" height="300" rx="14"/></clipPath>' + "</defs>";
    out += '<g clip-path="url(#' + cid + ')">' + inner.join("") + "</g></svg>";
    return out;
  }
  function sceneLayers(page) {
    var out = bgSvg(page.bg || "garden");
    /* 先画背景道具（树、门、床等），再画人物，保证人物在最前面 */
    var items = page.sc || [];
    var back = items.filter(function (it) { return it.t === "p" && ["tree", "door", "swing", "bed", "table", "sink", "rainbow", "bird", "kite", "moon", "qm", "zzz"].indexOf(it.k) >= 0; });
    var mid = items.filter(function (it) { return it.t === "p" && back.indexOf(it) < 0; });
    var folks = items.filter(function (it) { return it.t !== "p"; });
    back.forEach(function (it) { out += renderItem(it); });
    folks.forEach(function (it) { out += renderItem(it); });
    mid.forEach(function (it) { out += renderItem(it); });
    return out;
  }
  function renderItem(it) {
    if (it.t === "kid" || it.t === "adult") return drawKid(it);
    if (it.t === "dog") return drawDog(it);
    if (it.t === "cat") return drawCat(it);
    if (it.t === "p") {
      var fn = PROPS[it.k] || PROPS.stick;
      return fn(it);
    }
    return "";
  }

  /* =========================================================
   * 二、语音（英文按词高亮 + 中文解释）
   * ========================================================= */
  var voices = [];
  function loadVoices() { try { voices = window.speechSynthesis ? window.speechSynthesis.getVoices() : []; } catch (e) { voices = []; } }
  if (window.speechSynthesis) { loadVoices(); window.speechSynthesis.onvoiceschanged = loadVoices; }
  function pickVoice(lang) {
    var pre = lang.slice(0, 2).toLowerCase();
    var list = voices.filter(function (v) { return v.lang && v.lang.toLowerCase().indexOf(pre) === 0; });
    if (!list.length) return null;
    if (pre === "en") {
      var fav = list.filter(function (v) { return /google us english|samantha|zira|aria|jenny|susan|natural/i.test(v.name); });
      return fav[0] || list[0];
    }
    var favZh = list.filter(function (v) { return /xiaoxiao|huihui|yaoyao|tingting|mei|sinji|google 普通话/i.test(v.name); });
    return favZh[0] || list[0];
  }

  var seq = 0;                 /* 每次朗读的序号，用于作废旧回调 */
  function cancelSpeech() {
    seq++;
    try { if (window.speechSynthesis) window.speechSynthesis.cancel(); } catch (e) { }
    clearEst();
  }
  var est = null;
  function clearEst() { if (est) { try { clearTimeout(est.timer); clearInterval(est.timer); } catch (e) { } est = null; } }

  function speak(text, o, cb) {
    o = o || {};
    if (!cfg.sound || !window.speechSynthesis) { if (cb) setTimeout(cb, o.silentWait || 0); return; }
    var mySeq = ++seq;
    clearEst();
    try { window.speechSynthesis.cancel(); } catch (e) { }
    var u = new SpeechSynthesisUtterance(text);
    u.lang = o.lang || "en-US";
    u.rate = o.rate == null ? .92 : o.rate;
    u.pitch = o.pitch == null ? 1.05 : o.pitch;
    var v = pickVoice(u.lang); if (v) u.voice = v;
    var spans = o.spans || [];
    var words = String(text).split(/\s+/).filter(Boolean);
    var done = false;
    function finish() {
      if (done) return; done = true;
      clearEst();
      spans.forEach(function (s) { s.classList.remove("on"); });
      if (cb) cb();
    }
    u.onend = finish;
    u.onerror = finish;
    /* 按词高亮：优先用 boundary 事件；浏览器不支持时退化为「按词估算节奏」，
       保证小朋友任何时候都能看到「正在读的是哪个词」。 */
    var paint = function (k) { spans.forEach(function (s, idx) { s.classList.toggle("on", idx === k); }); };
    if (spans.length) {
      u.onstart = function () {
        if (mySeq !== seq) return;
        var per = words.map(function (w) {
          return Math.max(200, 240 + 55 * w.replace(/[^A-Za-z']/g, "").length) / (u.rate || .92);
        });
        var k = 0, t = null;
        function step() {
          if (mySeq !== seq) return;
          if (k >= words.length) { paint(-1); return; }
          paint(k);
          var d = per[k]; k++;
          t = setTimeout(step, d);
        }
        est = { timer: t, stop: function () { clearTimeout(t); } };
        step();
      };
      u.onboundary = function (e) {
        if (mySeq !== seq || typeof e.charIndex !== "number") return;
        if (est) est.stop();
        clearEst();
        var idx = String(text).slice(0, e.charIndex).split(/\s+/).filter(Boolean).length - 1;
        if (idx >= 0) paint(idx);
      };
    }
    try { window.speechSynthesis.speak(u); } catch (e) { finish(); }
  }

  /* =========================================================
   * 三、界面
   * ========================================================= */
  var el = {};
  var state = { book: 0, page: 0, mode: "read", ear: false, hear: null, speaking: false, quiz: null };

  function cache() {
    el.shelf = $("#pbShelf");
    el.reader = $("#pbReader");
    el.books = $("#pbBooks");
    el.chars = $("#pbChars");
    el.shelfStat = $("#pbShelfStat");
    el.stage = $("#pbStage");
    el.en = $("#pbEn");
    el.zh = $("#pbZh");
    el.words = $("#pbWords");
    el.panel = $("#pbPanel");
    el.title = $("#pbTitle");
    el.titleZh = $("#pbTitleZh");
    el.pageNo = $("#pbPageNo");
    el.dots = $("#pbDots");
    el.tipList = $("#pbTipList");
    el.controls = $("#pbControls");
    el.modes = $("#pbModes");
    el.btnSound = $("#pbSound");
    el.btnZh = $("#pbZhToggle");
    el.earBar = $("#pbEarBar");
  }

  /* ---------- 书架 ---------- */
  function renderShelf() {
    var read = 0; BOOKS.forEach(function (b) { if (bp(b.id).done) read++; });
    if (el.shelfStat) {
      el.shelfStat.innerHTML = "<b>" + read + "</b> / " + BOOKS.length + " 本已读 · 累计跟读 <b>⭐ " + (prog.speakStars || 0) + "</b>";
    }
    el.books.innerHTML = BOOKS.map(function (b, i) {
      var p = bp(b.id);
      var stars = "";
      for (var k = 0; k < 3; k++) stars += '<span class="pb-s' + (k < Math.min(3, p.stars || 0) ? " on" : "") + '">★</span>';
      return '<button type="button" class="pb-book" data-book="' + i + '">' +
        '<span class="pb-book-cover">' + sceneSvg(b.pages[0], { alt: b.zh }) + (p.done ? '<i class="pb-done">✓ 读完</i>' : "") + '</span>' +
        '<span class="pb-book-body">' +
        '<b class="pb-book-t">' + b.em + " " + esc(b.title) + '</b>' +
        '<span class="pb-book-zh">' + esc(b.zh) + '</span>' +
        '<span class="pb-book-pat">' + esc(b.pattern) + '</span>' +
        '<span class="pb-book-meta"><i class="pb-lv">第 ' + b.lv + " 级</i><i>" + b.pages.length + ' 页</i><i class="pb-stars">' + stars + '</i></span>' +
        '</span></button>';
    }).join("");
    $$(".pb-book", el.books).forEach(function (btn) {
      btn.addEventListener("click", function () { openBook(+btn.getAttribute("data-book"), bp(BOOKS[+btn.getAttribute("data-book")].id).maxPage || 0); });
    });
    if (el.chars) {
      el.chars.innerHTML = CHARS.map(function (c) {
        var svg = c.id === "fluffy" ? drawDog({ x: 60, y: 150, s: 1.45 }) : drawKid({ x: 60, y: 150, s: 1.15, who: c.id });
        return '<button type="button" class="pb-char" data-who="' + c.id + '">' +
          '<span class="pb-char-ava"><svg viewBox="0 0 120 170">' + svg + '</svg></span>' +
          '<b>' + esc(c.name) + '</b><span class="pb-char-zh">' + esc(c.zh) + ' · ' + esc(c.role) + '</span>' +
          '<span class="pb-char-line">"' + esc(c.line) + '"</span></button>';
      }).join("");
      $$(".pb-char", el.chars).forEach(function (btn) {
        btn.addEventListener("click", function () {
          var c = CHARS.filter(function (x) { return x.id === btn.getAttribute("data-who"); })[0];
          if (!c) return;
          toast(c.name + " · " + c.zh);
          speakRead(c.line, null, function () { speak(c.lineZh, { lang: "zh-CN", rate: .95 }); });
        });
      });
    }
  }

  /* ---------- 打开绘本 ---------- */
  function openBook(i, page) {
    state.book = i; state.page = Math.max(0, Math.min(BOOKS[i].pages.length - 1, page || 0));
    el.shelf.hidden = true; el.reader.hidden = false;
    setMode("read", true);
    showPage(state.page, true);
    if (el.tipList) el.tipList.innerHTML = BOOKS[i].tip.map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("");
  }
  function backToShelf() {
    stopEar(); cancelSpeech(); stopHear();
    el.reader.hidden = true; el.shelf.hidden = false;
    renderShelf();
  }

  function showPage(pi, silent) {
    var book = BOOKS[state.book];
    pi = Math.max(0, Math.min(book.pages.length - 1, pi));
    state.page = pi;
    var pg = book.pages[pi];
    el.title.textContent = book.title;
    el.titleZh.textContent = book.zh;
    el.pageNo.textContent = (pi + 1) + " / " + book.pages.length;
    el.stage.innerHTML = sceneSvg(pg);
    el.en.innerHTML = pg.en.split(/\s+/).map(function (w) {
      return '<span class="pb-w">' + esc(w) + "</span>";
    }).join(" ");
    el.zh.textContent = pg.zh;
    el.zh.hidden = !cfg.zh;
    el.words.innerHTML = (pg.words || []).map(function (w) {
      return '<button type="button" class="pb-word" data-w="' + esc(w.w) + '"><i>' + esc(w.em || "🔊") + '</i><b>' + esc(w.w) + '</b><span>' + esc(w.zh || "") + '</span></button>';
    }).join("") || '<span class="pb-words-empty">本页没有新单词，跟着读一遍就好～</span>';
    $$(".pb-word", el.words).forEach(function (btn) {
      btn.addEventListener("click", function () {
        var w = btn.getAttribute("data-w");
        speak(w, { rate: .75, spans: $$(".pb-w", el.en) });
        toast(w);
      });
    });
    /* 进度点 */
    el.dots.innerHTML = book.pages.map(function (_, k) {
      return '<i class="' + (k === pi ? "on" : (k < pi ? "past" : "")) + '" data-p="' + k + '"></i>';
    }).join("");
    $$("i", el.dots).forEach(function (d) {
      d.addEventListener("click", function () { stopEar(); showPage(+d.getAttribute("data-p"), true); if (cfg.autoRead && state.mode === "read") readPage(); });
    });
    var p = bp(book.id);
    if (pi > p.maxPage) p.maxPage = pi;
    if (pi === book.pages.length - 1 && !p.done) { p.done = true; saveProg(); }
    else saveProg();

    if (state.mode === "quiz" || state.mode === "speak") renderPanel();
    if (!silent && cfg.autoRead && state.mode === "read") readPage();
  }

  function readPage(slow) {
    var pg = BOOKS[state.book].pages[state.page];
    speakRead(pg.en, slow ? .72 : .92, state.mode === "read" ? null : null);
  }
  function speakRead(en, rate, cb) {
    cancelSpeech();
    var spans = $$(".pb-w", el.en);
    speak(en, { lang: "en-US", rate: rate || .92, spans: spans }, cb);
  }
  function speakZh(zh, cb) { speak(zh, { lang: "zh-CN", rate: .95, pitch: 1.1 }, cb); }

  /* ---------- 模式 ---------- */
  function setMode(m, silent) {
    if (state.mode !== m) { stopEar(); stopHear(); }
    state.mode = m;
    $$(".pb-mode", el.modes).forEach(function (b) { b.classList.toggle("on", b.getAttribute("data-mode") === m); });
    el.controls.hidden = (m === "ear");
    el.earBar.hidden = (m !== "ear");
    renderPanel();
    if (m === "ear") { if (!state.ear) startEar(false); }
    else if (m === "read" && !silent && cfg.autoRead) readPage();
  }
  /* 统一渲染「模式专属面板」，避免切换模式后残留上一个模式的内容 */
  function renderPanel() {
    var m = state.mode;
    if (m === "speak") { el.words.hidden = false; renderSpeak(); }
    else if (m === "quiz") { el.words.hidden = true; renderQuiz(); }
    else { el.words.hidden = false; el.panel.innerHTML = ""; }
  }

  /* ---------- 磨耳朵（自动连读） ---------- */
  function startEar(cont) {
    state.ear = true; state.earCont = !!cont;
    el.earBar.hidden = false;
    updateEarUI();
    requestWake();
    earPage(state.book, state.page);
  }
  function stopEar() {
    if (!state.ear) return;
    state.ear = false;
    cancelSpeech();
    clearTimeout(state.earT);
    el.earBar.hidden = true;
    releaseWake();
  }
  function updateEarUI() {
    var t = $("#pbEarText");
    if (t) t.innerHTML = '🎧 正在磨耳朵… <b>' + esc(BOOKS[state.book].title) + '</b> · 第 ' + (state.page + 1) + ' 页' +
      (state.earCont ? ' <i>（读完自动换下一本）</i>' : '');
  }
  function earPage(bi, pi) {
    if (!state.ear) return;
    var book = BOOKS[bi];
    if (pi >= book.pages.length) {
      if (state.earCont && bi + 1 < BOOKS.length) { state.book = bi + 1; showPage(0, true); earPage(bi + 1, 0); return; }
      stopEar(); toast("🎧 磨耳朵完成，真棒！"); return;
    }
    if (state.book !== bi) state.book = bi;
    showPage(pi, true);
    updateEarUI();
    var spans = $$(".pb-w", el.en);
    var pg = book.pages[pi];
    speak(pg.en, { lang: "en-US", rate: .7, spans: spans }, function () {
      state.earT = setTimeout(function () {
        if (!state.ear) return;
        speak(pg.en, { lang: "en-US", rate: .95, spans: spans }, function () {
          state.earT = setTimeout(function () {
            if (!state.ear) return;
            speak(pg.zh, { lang: "zh-CN", rate: .95, pitch: 1.1 }, function () {
              state.earT = setTimeout(function () { earPage(bi, pi + 1); }, 620);
            });
          }, 260);
        });
      }, 340);
    });
  }

  /* 屏幕常亮（支持时） */
  var wl = null;
  function requestWake() { try { if (navigator.wakeLock && !wl) navigator.wakeLock.request("screen").then(function (w) { wl = w; w.addEventListener("release", function () { wl = null; }); }).catch(function () { }); } catch (e) { } }
  function releaseWake() { try { if (wl) { wl.release(); wl = null; } } catch (e) { } }

  /* ---------- 跟读 ---------- */
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  var recog = null;
  function stopHear() { try { if (recog) { recog.abort(); recog = null; } } catch (e) { } state.hear = null; }
  function renderSpeak() {
    var pg = BOOKS[state.book].pages[state.page];
    var supported = !!SR;
    el.panel.innerHTML =
      '<div class="pb-speak">' +
      '<p class="pb-speak-tip">' + (supported ? "点 🎤 让小朋友跟着读一遍，看看星星！" : "当前浏览器不支持语音识别，请用 Chrome / Edge / Safari 打开；也可以先用「磨耳朵」跟着读。") + '</p>' +
      '<div class="pb-speak-row">' +
      '<button type="button" class="pb-mic" id="pbMic"' + (supported ? "" : " disabled") + '>🎤</button>' +
      '<button type="button" class="btn btn-ghost btn-sm" id="pbListen">🔊 再听一次</button>' +
      '</div>' +
      '<div class="pb-speak-out" id="pbSpeakOut"></div>' +
      '</div>';
    var mic = $("#pbMic");
    if (mic) mic.addEventListener("click", function () { startHear(); });
    var lis = $("#pbListen");
    if (lis) lis.addEventListener("click", function () { speakRead(pg.en, .78); });
  }
  function startHear() {
    if (!SR) return;
    var pg = BOOKS[state.book].pages[state.page];
    stopHear();
    try { cancelSpeech(); } catch (e) { }
    recog = new SR();
    recog.lang = "en-US"; recog.interimResults = false; recog.maxAlternatives = 3; recog.continuous = false;
    state.hear = "listening";
    var mic = $("#pbMic"); if (mic) mic.classList.add("rec");
    var out = $("#pbSpeakOut"); if (out) out.innerHTML = '<span class="pb-listen">🎧 正在听…请大声读一遍</span>';
    recog.onresult = function (e) {
      var cands = [];
      for (var i = 0; i < e.results[0].length; i++) cands.push(e.results[0][i].transcript);
      judge(pg, cands);
    };
    recog.onerror = function (e) {
      if (mic) mic.classList.remove("rec");
      if (out) out.innerHTML = '<span class="pb-warn">没有听清（' + esc(e.error || "error") + '），再试一次吧～</span>';
    };
    recog.onend = function () { if (mic) mic.classList.remove("rec"); };
    try { recog.start(); } catch (e) { }
  }
  function judge(pg, cands) {
    function norm(s) { return String(s).toLowerCase().replace(/[^a-z ]/g, " ").split(/\s+/).filter(Boolean); }
    var target = norm(pg.en);
    var best = { pct: 0, text: cands[0] || "" };
    cands.forEach(function (c) {
      var got = norm(c), hit = 0;
      target.forEach(function (w) { if (got.indexOf(w) >= 0) hit++; });
      var pct = Math.round(hit / Math.max(1, target.length) * 100);
      if (pct > best.pct) best = { pct: pct, text: c };
    });
    var stars = best.pct >= 80 ? 3 : (best.pct >= 50 ? 2 : 1);
    var book = BOOKS[state.book];
    var p = bp(book.id);
    p.stars = Math.max(p.stars || 0, stars); prog.speakStars = (prog.speakStars || 0) + 1;
    saveProg();
    var praise = stars === 3 ? "太棒了！Well done! 🌟" : (stars === 2 ? "很好！Good job! 👍" : "不错，再来一次会更好～ 💪");
    var out = $("#pbSpeakOut");
    if (out) out.innerHTML =
      '<div class="pb-judge">' +
      '<div class="pb-judge-stars">' + "★★★".slice(0, stars).split("").map(function () { return "⭐"; }).join("") + "☆".repeat(3 - stars) + '</div>' +
      '<p class="pb-judge-praise">' + praise + '</p>' +
      '<p class="pb-judge-line">我听到：<b>"' + esc(best.text || "—") + '"</b></p>' +
      '<p class="pb-judge-line">原句：<b>' + esc(pg.en) + '</b> · 匹配度 ' + best.pct + '%</p>' +
      '<p class="pb-judge-zh">' + esc(pg.zh) + '</p>' +
      '</div>';
    if (best.pct >= 80) speak("Great job!", { rate: .95 });
  }

  /* ---------- 小问答 ---------- */
  function renderQuiz() {
    var book = BOOKS[state.book];
    if (!state.quiz || state.quiz.book !== state.book) state.quiz = { book: state.book, i: 0, right: 0, answered: false };
    var q = book.quiz[state.quiz.i];
    el.panel.innerHTML =
      '<div class="pb-quiz">' +
      '<div class="pb-quiz-head"><b>📝 小问答 ' + (state.quiz.i + 1) + " / " + book.quiz.length + '</b>' +
      '<button type="button" class="btn btn-ghost btn-sm" id="pbQuizPlay">🔊 再听问题</button></div>' +
      '<p class="pb-quiz-q">' + esc(q.q) + '</p>' +
      '<p class="pb-quiz-zh">' + esc(q.zh) + '</p>' +
      '<div class="pb-quiz-opts">' + q.opts.map(function (o, k) {
        return '<button type="button" class="pb-opt" data-k="' + k + '"><i>' + esc(o.em) + '</i><b>' + esc(o.label) + '</b></button>';
      }).join("") + '</div>' +
      '<div class="pb-quiz-out" id="pbQuizOut"></div>' +
      '</div>';
    var pl = $("#pbQuizPlay");
    if (pl) pl.addEventListener("click", function () { speak(q.q, { rate: .82 }); });
    speak(q.q, { rate: .82 });
    $$(".pb-opt", el.panel).forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (state.quiz.answered) return;
        state.quiz.answered = true;
        var k = +btn.getAttribute("data-k");
        var ok = q.opts[k].ok;
        $$(".pb-opt", el.panel).forEach(function (b) {
          b.classList.toggle("ok", !!q.opts[+b.getAttribute("data-k")].ok);
          b.classList.toggle("no", b === btn && !ok);
        });
        if (ok) state.quiz.right++;
        var out = $("#pbQuizOut");
        if (out) out.innerHTML = ok
          ? '<b class="pb-ok">✅ 答对啦！' + esc(q.opts[k].label) + '</b>'
          : '<b class="pb-no">再想想～ 正确答案是 ' + esc(q.opts.filter(function (o) { return o.ok; })[0].label) + '</b>';
        speak(ok ? "Yes! Well done!" : "Try again next time!", { rate: .9 });
        setTimeout(nextQuiz, 1500);
      });
    });
  }
  function nextQuiz() {
    var book = BOOKS[state.book];
    if (state.quiz.i + 1 < book.quiz.length) { state.quiz.i++; state.quiz.answered = false; renderQuiz(); return; }
    var p = bp(book.id);
    p.quiz = Math.max(p.quiz || 0, state.quiz.right);
    saveProg();
    el.panel.innerHTML =
      '<div class="pb-quiz pb-quiz-done">' +
      '<div class="pb-quiz-big">' + (state.quiz.right === book.quiz.length ? "🎉" : "👏") + '</div>' +
      '<h3>答对 ' + state.quiz.right + " / " + book.quiz.length + ' 题</h3>' +
      '<p class="pb-quiz-zh">' + (state.quiz.right === book.quiz.length ? "全对！小朋友理解得非常好～" : "很好了，再读一遍绘本会更清楚哦～") + '</p>' +
      '<div class="pb-quiz-acts"><button type="button" class="btn btn-ghost" id="pbQuizAgain">↺ 再答一次</button>' +
      '<button type="button" class="btn btn-primary" id="pbQuizNext">读下一本 →</button></div></div>';
    speak(state.quiz.right === book.quiz.length ? "Perfect! You are great!" : "Good try!", { rate: .9 });
    var ag = $("#pbQuizAgain"), nx = $("#pbQuizNext");
    if (ag) ag.addEventListener("click", function () { state.quiz = null; renderQuiz(); });
    if (nx) nx.addEventListener("click", function () {
      state.quiz = null;
      var n = (state.book + 1) % BOOKS.length;
      openBook(n, 0);
    });
  }

  /* ---------- 提示 ---------- */
  function toast(msg) {
    var t = $("#toast");
    if (!t) return;
    t.textContent = msg; t.hidden = false;
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { t.hidden = true; }, 2000);
  }

  /* =========================================================
   * 四、初始化与对外接口
   * ========================================================= */
  function init() {
    cache();
    if (!el.books) return;
    loadStore();
    renderShelf();
    /* 控件 */
    if (el.btnSound) {
      el.btnSound.textContent = cfg.sound ? "🔊 声音开" : "🔇 声音关";
      el.btnSound.addEventListener("click", function () {
        cfg.sound = !cfg.sound; saveCfg();
        el.btnSound.textContent = cfg.sound ? "🔊 声音开" : "🔇 声音关";
        if (!cfg.sound) cancelSpeech();
      });
    }
    if (el.btnZh) {
      el.btnZh.textContent = cfg.zh ? "🈶 中文开" : "🈚 中文关";
      el.btnZh.addEventListener("click", function () {
        cfg.zh = !cfg.zh; saveCfg();
        el.btnZh.textContent = cfg.zh ? "🈶 中文开" : "🈚 中文关";
        el.zh.hidden = !cfg.zh;
      });
    }
    var back = $("#pbBack"); if (back) back.addEventListener("click", backToShelf);
    var prev = $("#pbPrev"), next = $("#pbNext");
    if (prev) prev.addEventListener("click", function () { stopEar(); if (state.page > 0) showPage(state.page - 1); else toast("已经是第一页啦"); });
    if (next) next.addEventListener("click", function () {
      stopEar();
      if (state.page + 1 < BOOKS[state.book].pages.length) showPage(state.page + 1);
      else { toast("🎉 读完整本书！试试「小问答」吧"); setMode("quiz"); }
    });
    var play = $("#pbPlay"); if (play) play.addEventListener("click", function () { readPage(false); });
    var slow = $("#pbSlow"); if (slow) slow.addEventListener("click", function () { cancelSpeech(); speakRead(BOOKS[state.book].pages[state.page].en, .68); });
    var stop = $("#pbEarStop"); if (stop) stop.addEventListener("click", function () { stopEar(); toast("已停止磨耳朵"); });
    $$(".pb-mode", el.modes).forEach(function (b) {
      b.addEventListener("click", function () { setMode(b.getAttribute("data-mode")); });
    });
    var earAll = $("#pbEarAll");
    if (earAll) earAll.addEventListener("click", function () {
      el.shelf.hidden = true; el.reader.hidden = false;
      state.book = 0; state.page = 0; setMode("ear", true); startEar(true);
    });
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) { stopEar(); cancelSpeech(); stopHear(); }
    });
    window.addEventListener("blur", function () { });
  }

  window.DailyTalkPictureApp = {
    onShow: function () { renderShelf(); },
    onHide: function () { stopEar(); cancelSpeech(); stopHear(); },
    open: openBook,
    state: state,
    _scene: sceneSvg
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
