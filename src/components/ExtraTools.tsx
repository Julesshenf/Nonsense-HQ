import React, { useState, useEffect } from "react";

// ==========================================
// TYPES & CONSTANTS
// ==========================================

export interface WheelOption {
  id: string;
  name: string;
  weight: number;
}

// Map for Chinese Relationship resolution
const RELATIONSHIP_TRANSITIONS: Record<string, string> = {
  "爸爸 + 爸爸": "爷爷",
  "爸爸 + 妈妈": "奶奶",
  "爸爸 + 哥哥": "伯父",
  "爸爸 + 弟弟": "叔叔",
  "爸爸 + 姐姐": "姑姑",
  "爸爸 + 妹妹": "姑姑",
  "爸爸 + 老婆": "妈妈",
  "爸爸 + 儿子": "兄弟/自己",
  "爸爸 + 女儿": "姐妹/自己",

  "妈妈 + 爸爸": "外公",
  "妈妈 + 妈妈": "外婆",
  "妈妈 + 哥哥": "舅舅",
  "妈妈 + 弟弟": "舅舅",
  "妈妈 + 姐姐": "姨妈",
  "妈妈 + 妹妹": "姨妈",
  "妈妈 + 老公": "爸爸",
  "妈妈 + 儿子": "兄弟/自己",
  "妈妈 + 女儿": "姐妹/自己",

  // ==================== 爷爷奶奶 ====================

  "爷爷 + 爸爸": "曾祖父",
  "爷爷 + 妈妈": "曾祖母",
  "爷爷 + 哥哥": "伯祖父",
  "爷爷 + 弟弟": "叔祖父",
  "爷爷 + 姐姐": "姑祖母",
  "爷爷 + 妹妹": "姑祖母",
  "爷爷 + 老婆": "奶奶",
  "爷爷 + 儿子": "爸爸/伯父/叔叔",
  "爷爷 + 女儿": "姑姑",

  "奶奶 + 爸爸": "曾外祖父",
  "奶奶 + 妈妈": "曾外祖母",
  "奶奶 + 老公": "爷爷",
  "奶奶 + 哥哥": "舅祖父",
  "奶奶 + 弟弟": "舅祖父",
  "奶奶 + 姐姐": "姨祖母",
  "奶奶 + 妹妹": "姨祖母",
  "奶奶 + 儿子": "爸爸/伯父/叔叔",
  "奶奶 + 女儿": "姑姑",

  // ==================== 外公外婆 ====================

  "外公 + 爸爸": "外曾祖父",
  "外公 + 妈妈": "外曾祖母",
  "外公 + 老婆": "外婆",
  "外公 + 哥哥": "外伯祖父",
  "外公 + 弟弟": "外叔祖父",
  "外公 + 姐姐": "外姑祖母",
  "外公 + 妹妹": "外姑祖母",
  "外公 + 儿子": "舅舅",
  "外公 + 女儿": "妈妈/姨妈",

  "外婆 + 爸爸": "外曾外祖父",
  "外婆 + 妈妈": "外曾外祖母",
  "外婆 + 老公": "外公",
  "外婆 + 哥哥": "外舅祖父",
  "外婆 + 弟弟": "外舅祖父",
  "外婆 + 姐姐": "外姨祖母",
  "外婆 + 妹妹": "外姨祖母",
  "外婆 + 儿子": "舅舅",
  "外婆 + 女儿": "妈妈/姨妈",

  // ==================== 兄弟姐妹 ====================

  "哥哥 + 爸爸": "爸爸",
  "哥哥 + 妈妈": "妈妈",
  "哥哥 + 儿子": "侄子",
  "哥哥 + 女儿": "侄女",
  "哥哥 + 老婆": "嫂子",

  "弟弟 + 爸爸": "爸爸",
  "弟弟 + 妈妈": "妈妈",
  "弟弟 + 儿子": "侄子",
  "弟弟 + 女儿": "侄女",
  "弟弟 + 老婆": "弟妹",

  "姐姐 + 爸爸": "爸爸",
  "姐姐 + 妈妈": "妈妈",
  "姐姐 + 儿子": "外甥",
  "姐姐 + 女儿": "外甥女",
  "姐姐 + 老公": "姐夫",

  "妹妹 + 爸爸": "爸爸",
  "妹妹 + 妈妈": "妈妈",
  "妹妹 + 儿子": "外甥",
  "妹妹 + 女儿": "外甥女",
  "妹妹 + 老公": "妹夫",

  // ==================== 兄弟姐妹的配偶 ====================

  "嫂子 + 老公": "哥哥",
  "嫂子 + 儿子": "侄子",
  "嫂子 + 女儿": "侄女",

  "弟妹 + 老公": "弟弟",
  "弟妹 + 儿子": "侄子",
  "弟妹 + 女儿": "侄女",

  "姐夫 + 老婆": "姐姐",
  "姐夫 + 儿子": "外甥",
  "姐夫 + 女儿": "外甥女",

  "妹夫 + 老婆": "妹妹",
  "妹夫 + 儿子": "外甥",
  "妹夫 + 女儿": "外甥女",

  // ==================== 子女 ====================

  "儿子 + 儿子": "孙子",
  "儿子 + 女儿": "孙女",
  "儿子 + 老婆": "儿媳",

  "女儿 + 儿子": "外孙",
  "女儿 + 女儿": "外孙女",
  "女儿 + 老公": "女婿",

  // ==================== 儿媳、女婿及亲家 ====================

  "儿媳 + 老公": "儿子",
  "儿媳 + 爸爸": "亲家公",
  "儿媳 + 妈妈": "亲家母",
  "儿媳 + 儿子": "孙子",
  "儿媳 + 女儿": "孙女",

  "女婿 + 老婆": "女儿",
  "女婿 + 爸爸": "亲家公",
  "女婿 + 妈妈": "亲家母",
  "女婿 + 儿子": "外孙",
  "女婿 + 女儿": "外孙女",

  "亲家公 + 老婆": "亲家母",
  "亲家母 + 老公": "亲家公",

  // ==================== 孙辈 ====================

  "孙子 + 爸爸": "儿子",
  "孙子 + 妈妈": "儿媳",
  "孙子 + 老婆": "孙媳",
  "孙子 + 哥哥": "孙子",
  "孙子 + 弟弟": "孙子",
  "孙子 + 姐姐": "孙女",
  "孙子 + 妹妹": "孙女",
  "孙子 + 儿子": "曾孙",
  "孙子 + 女儿": "曾孙女",

  "孙女 + 爸爸": "儿子",
  "孙女 + 妈妈": "儿媳",
  "孙女 + 老公": "孙女婿",
  "孙女 + 儿子": "外曾孙",
  "孙女 + 女儿": "外曾孙女",

  "外孙 + 爸爸": "女婿",
  "外孙 + 妈妈": "女儿",
  "外孙 + 老婆": "外孙媳",
  "外孙 + 哥哥": "外孙",
  "外孙 + 弟弟": "外孙",
  "外孙 + 姐姐": "外孙女",
  "外孙 + 妹妹": "外孙女",
  "外孙 + 儿子": "曾外孙",
  "外孙 + 女儿": "曾外孙女",

  "外孙女 + 爸爸": "女婿",
  "外孙女 + 妈妈": "女儿",
  "外孙女 + 老公": "外孙女婿",

  // ==================== 曾孙辈 ====================

  "曾孙 + 爸爸": "孙子",
  "曾孙 + 妈妈": "孙媳",

  "曾孙女 + 爸爸": "孙子",
  "曾孙女 + 妈妈": "孙媳",

  "曾外孙 + 爸爸": "外孙",
  "曾外孙 + 妈妈": "外孙媳",

  "曾外孙女 + 爸爸": "外孙",
  "曾外孙女 + 妈妈": "外孙媳",

  // ==================== 丈夫一方 ====================

  "老公 + 爸爸": "公公",
  "老公 + 妈妈": "婆婆",
  "老公 + 哥哥": "大伯子",
  "老公 + 弟弟": "小叔子",
  "老公 + 姐姐": "大姑子",
  "老公 + 妹妹": "小姑子",
  "老公 + 老婆": "自己",
  "老公 + 儿子": "儿子",
  "老公 + 女儿": "女儿",

  // ==================== 妻子一方 ====================

  "老婆 + 爸爸": "岳父",
  "老婆 + 妈妈": "岳母",
  "老婆 + 哥哥": "大舅子",
  "老婆 + 弟弟": "小舅子",
  "老婆 + 姐姐": "大姨子",
  "老婆 + 妹妹": "小姨子",
  "老婆 + 老公": "自己",
  "老婆 + 儿子": "儿子",
  "老婆 + 女儿": "女儿",

  // ==================== 公公婆婆 ====================

  "公公 + 老婆": "婆婆",
  "公公 + 儿子": "老公/大伯子/小叔子",
  "公公 + 女儿": "大姑子/小姑子",

  "婆婆 + 老公": "公公",
  "婆婆 + 儿子": "老公/大伯子/小叔子",
  "婆婆 + 女儿": "大姑子/小姑子",

  // ==================== 岳父岳母 ====================

  "岳父 + 老婆": "岳母",
  "岳父 + 儿子": "大舅子/小舅子",
  "岳父 + 女儿": "老婆/大姨子/小姨子",

  "岳母 + 老公": "岳父",
  "岳母 + 儿子": "大舅子/小舅子",
  "岳母 + 女儿": "老婆/大姨子/小姨子",

  // ==================== 叔叔 ====================

  "叔叔 + 爸爸": "爷爷",
  "叔叔 + 妈妈": "奶奶",
  "叔叔 + 哥哥": "爸爸/伯父",
  "叔叔 + 弟弟": "叔叔",
  "叔叔 + 姐姐": "姑姑",
  "叔叔 + 妹妹": "姑姑",
  "叔叔 + 儿子": "堂兄弟",
  "叔叔 + 女儿": "堂姐妹",
  "叔叔 + 老婆": "婶婶",

  // ==================== 伯父 ====================

  "伯父 + 爸爸": "爷爷",
  "伯父 + 妈妈": "奶奶",
  "伯父 + 哥哥": "伯父",
  "伯父 + 弟弟": "爸爸/叔叔",
  "伯父 + 姐姐": "姑姑",
  "伯父 + 妹妹": "姑姑",
  "伯父 + 儿子": "堂兄弟",
  "伯父 + 女儿": "堂姐妹",
  "伯父 + 老婆": "伯母",

  // ==================== 姑姑 ====================

  "姑姑 + 爸爸": "爷爷",
  "姑姑 + 妈妈": "奶奶",
  "姑姑 + 哥哥": "爸爸/伯父",
  "姑姑 + 弟弟": "爸爸/叔叔",
  "姑姑 + 姐姐": "姑姑",
  "姑姑 + 妹妹": "姑姑",
  "姑姑 + 儿子": "表兄弟",
  "姑姑 + 女儿": "表姐妹",
  "姑姑 + 老公": "姑父",

  // ==================== 伯母、婶婶、姑父 ====================

  "伯母 + 老公": "伯父",
  "伯母 + 儿子": "堂兄弟",
  "伯母 + 女儿": "堂姐妹",

  "婶婶 + 老公": "叔叔",
  "婶婶 + 儿子": "堂兄弟",
  "婶婶 + 女儿": "堂姐妹",

  "姑父 + 老婆": "姑姑",
  "姑父 + 儿子": "表兄弟",
  "姑父 + 女儿": "表姐妹",

  // ==================== 舅舅 ====================

  "舅舅 + 爸爸": "外公",
  "舅舅 + 妈妈": "外婆",
  "舅舅 + 哥哥": "舅舅",
  "舅舅 + 弟弟": "舅舅",
  "舅舅 + 姐姐": "妈妈/姨妈",
  "舅舅 + 妹妹": "妈妈/姨妈",
  "舅舅 + 儿子": "表兄弟",
  "舅舅 + 女儿": "表姐妹",
  "舅舅 + 老婆": "舅妈",

  // ==================== 姨妈 ====================

  "姨妈 + 爸爸": "外公",
  "姨妈 + 妈妈": "外婆",
  "姨妈 + 哥哥": "舅舅",
  "姨妈 + 弟弟": "舅舅",
  "姨妈 + 姐姐": "妈妈/姨妈",
  "姨妈 + 妹妹": "妈妈/姨妈",
  "姨妈 + 儿子": "表兄弟",
  "姨妈 + 女儿": "表姐妹",
  "姨妈 + 老公": "姨父",

  // ==================== 舅妈、姨父 ====================

  "舅妈 + 老公": "舅舅",
  "舅妈 + 儿子": "表兄弟",
  "舅妈 + 女儿": "表姐妹",

  "姨父 + 老婆": "姨妈",
  "姨父 + 儿子": "表兄弟",
  "姨父 + 女儿": "表姐妹",

  // ==================== 侄子、侄女 ====================

  "侄子 + 爸爸": "哥哥/弟弟",
  "侄子 + 妈妈": "嫂子/弟妹",
  "侄子 + 老婆": "侄媳",
  "侄子 + 儿子": "侄孙",
  "侄子 + 女儿": "侄孙女",

  "侄女 + 爸爸": "哥哥/弟弟",
  "侄女 + 妈妈": "嫂子/弟妹",
  "侄女 + 老公": "侄女婿",
  "侄女 + 儿子": "侄外孙",
  "侄女 + 女儿": "侄外孙女",

  // ==================== 外甥、外甥女 ====================

  "外甥 + 爸爸": "姐夫/妹夫",
  "外甥 + 妈妈": "姐姐/妹妹",
  "外甥 + 老婆": "外甥媳",
  "外甥 + 儿子": "外甥孙",
  "外甥 + 女儿": "外甥孙女",

  "外甥女 + 爸爸": "姐夫/妹夫",
  "外甥女 + 妈妈": "姐姐/妹妹",
  "外甥女 + 老公": "外甥女婿",
  "外甥女 + 儿子": "外甥外孙",
  "外甥女 + 女儿": "外甥外孙女",

  // ==================== 堂亲 ====================

  "堂兄弟 + 爸爸": "伯父/叔叔",
  "堂兄弟 + 妈妈": "伯母/婶婶",
  "堂兄弟 + 老婆": "堂嫂/堂弟媳",
  "堂兄弟 + 儿子": "堂侄",
  "堂兄弟 + 女儿": "堂侄女",

  "堂姐妹 + 爸爸": "伯父/叔叔",
  "堂姐妹 + 妈妈": "伯母/婶婶",
  "堂姐妹 + 老公": "堂姐夫/堂妹夫",

  // ==================== 表亲 ====================

  "表兄弟 + 老婆": "表嫂/表弟媳",
  "表兄弟 + 儿子": "表侄",
  "表兄弟 + 女儿": "表侄女",
  "表兄弟 + 哥哥": "表兄弟",
  "表兄弟 + 弟弟": "表兄弟",
  "表兄弟 + 姐姐": "表姐妹",
  "表兄弟 + 妹妹": "表姐妹",

  "表姐妹 + 老公": "表姐夫/表妹夫",
  "表姐妹 + 儿子": "表甥",
  "表姐妹 + 女儿": "表外甥女",
  "表姐妹 + 哥哥": "表兄弟",
  "表姐妹 + 弟弟": "表兄弟",
  "表姐妹 + 姐姐": "表姐妹",
  "表姐妹 + 妹妹": "表姐妹",
};

// Adjacent sibling relations at the same level cancel each other out.
const OPPOSITE_PEER_RELATIONS: Record<string, string> = {
  "哥哥": "弟弟",
  "弟弟": "哥哥",
  "姐姐": "妹妹",
  "妹妹": "姐姐",
};

const simplifyRelationshipChain = (relations: string[]): string[] => {
  const simplified: string[] = [];

  for (const relation of relations) {
    const previous = simplified[simplified.length - 1];
    if (previous && OPPOSITE_PEER_RELATIONS[previous] === relation) {
      simplified.pop();
    } else {
      simplified.push(relation);
    }
  }

  return simplified;
};

// Gender Predictor Relatives Database
const GENDER_RELATIVES = [
  { name: "爸爸", gender: "男", desc: "父亲，你生命中不可或缺的严厉或温和支柱。" },
  { name: "妈妈", gender: "女", desc: "母亲，为你提供无微不至关怀与唠叨的爱意来源。" },
  { name: "爷爷", gender: "男", desc: "祖父，父亲的父亲，沉稳而慈祥的老人家。" },
  { name: "奶奶", gender: "女", desc: "祖母，父亲的母亲，总觉得你吃不饱的温和长辈。" },
  { name: "外公", gender: "男", desc: "外祖父，母亲的父亲，饱经沧桑却笑脸迎人的老人。" },
  { name: "外婆", gender: "女", desc: "外祖母，母亲的母亲，充满慈爱与人间烟火气的长辈。" },
  { name: "叔叔", gender: "男", desc: "叔父，父亲的弟弟，往往是家庭里跟你没大没小的玩伴。" },
  { name: "伯父", gender: "男", desc: "伯父，父亲的哥哥，威严且稳重，对晚辈爱护有加。" },
  { name: "姑姑", gender: "女", desc: "姑母，父亲的姐妹，对你呵护备至、疼爱有加的长辈。" },
  { name: "舅舅", gender: "男", desc: "母舅，母亲的兄弟，古语称‘天上雷公，地上舅公’。" },
  { name: "姨妈", gender: "女", desc: "姨母，母亲的姐妹，最像母亲、对你关怀备至的人。" },
  { name: "哥哥", gender: "男", desc: "胞兄，走在你前面、能替你遮风挡雨的年长兄弟。" },
  { name: "弟弟", gender: "男", desc: "胞弟，活泼调皮、偶尔抢你零食的年轻兄弟。" },
  { name: "姐姐", gender: "女", desc: "胞姐，像第二个小妈妈一样关怀你、欺负你的温馨存在。" },
  { name: "妹妹", gender: "女", desc: "胞妹，乖巧可爱或傲娇调皮，让你充满保护欲的妹妹。" },
  { name: "老公", gender: "男", desc: "丈夫，执子之手、与子偕老的男性终身伴侣。" },
  { name: "老婆", gender: "女", desc: "妻子，风雨同舟、相濡以沫的女性终身伴侣。" },
  { name: "儿子", gender: "男", desc: "犬子，继承你优良基因（或奇妙性格）的男性子嗣。" },
  { name: "女儿", gender: "女", desc: "千金，你贴心的小棉袄、掌上明珠一般的女性子嗣。" },
  { name: "侄子", gender: "男", desc: "兄弟的儿子，亲切伶俐的家族男性后代。" },
  { name: "侄女", gender: "女", desc: "兄弟的女儿，乖巧可爱的家族女性后代。" },
  { name: "外甥", gender: "男", desc: "姐妹的儿子，聪明淘气的家族年轻成员。" },
  { name: "外甥女", gender: "女", desc: "姐妹的女儿，温柔温润的家族年轻成员。" }
];

// Helper to convert resolved relations to reverse
const getReverseCall = (relation: string, myGender: "male" | "female"): string => {
  if (!relation || relation === "自己") return "自己";
  if (relation.includes("无效") || relation.includes("前卫")) return relation;

  const lastChar = relation.slice(-2);
  const isFemale = myGender === "female";

  if (relation === "爸爸" || relation === "妈妈") {
    return isFemale ? "女儿" : "儿子";
  }
  if (relation === "儿子" || relation === "女儿") {
    return isFemale ? "妈妈" : "爸爸";
  }
  if (relation === "爷爷" || relation === "奶奶") {
    return isFemale ? "孙女" : "孙子";
  }
  if (relation === "外公" || relation === "外婆") {
    return isFemale ? "外孙女" : "外孙";
  }
  if (relation === "哥哥" || relation === "姐姐") {
    return isFemale ? "妹妹" : "弟弟";
  }
  if (relation === "弟弟" || relation === "妹妹") {
    return isFemale ? "姐姐" : "哥哥";
  }
  if (relation === "老公") return "老婆";
  if (relation === "老婆") return "老公";
  
  if (relation === "伯父" || relation === "叔叔" || relation === "姑姑") {
    return isFemale ? "侄女" : "侄子";
  }
  if (relation === "舅舅" || relation === "姨妈") {
    return isFemale ? "外甥女" : "外甥";
  }
  if (relation === "公公" || relation === "婆婆") {
    return "儿媳";
  }
  if (relation === "岳父" || relation === "岳母") {
    return "女婿";
  }
  if (relation === "儿媳") {
    return isFemale ? "婆婆" : "公公";
  }
  if (relation === "女婿") {
    return isFemale ? "岳母" : "岳父";
  }

  // Generic fallback guessing based on last tokens
  if (relation.endsWith("子")) {
    return isFemale ? "阿姨" : "叔叔";
  }
  if (relation.endsWith("女")) {
    return isFemale ? "阿姨" : "叔叔";
  }

  return isFemale ? "晚辈 (女)" : "晚辈 (男)";
};

// ==========================================
// 1. LUCKY WHEEL (大转盘) COMPONENT
// ==========================================

export const LuckyWheel: React.FC<{ isMadness: boolean }> = ({ isMadness }) => {
  const [options, setOptions] = useState<WheelOption[]>([
    { id: "1", name: "带薪拉屎 20分钟", weight: 30 },
    { id: "2", name: "去茶水间漫长接水", weight: 20 },
    { id: "3", name: "疯狂敲击空白键盘装忙", weight: 25 },
    { id: "4", name: "直面惨淡人生，开始干活", weight: 10 },
    { id: "5", name: "盯着电脑屏幕放空灵魂", weight: 15 }
  ]);

  const [newName, setNewName] = useState("");
  const [newWeight, setNewWeight] = useState(10);
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState<string | null>(null);

  const handleAddOption = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const newOpt: WheelOption = {
      id: Date.now().toString(),
      name: newName.trim(),
      weight: Math.max(1, newWeight)
    };
    setOptions([...options, newOpt]);
    setNewName("");
    setNewWeight(10);
  };

  const handleRemoveOption = (id: string) => {
    if (options.length <= 2) {
      alert("大转盘至少需要保留2个选项！");
      return;
    }
    setOptions(options.filter((o) => o.id !== id));
  };

  const spin = () => {
    if (isSpinning || options.length === 0) return;
    setIsSpinning(true);
    setSpinResult(null);

    // Compute weights
    const totalWeight = options.reduce((sum, o) => sum + o.weight, 0);
    let randomVal = Math.random() * totalWeight;
    
    let selectedIdx = 0;
    for (let i = 0; i < options.length; i++) {
      randomVal -= options[i].weight;
      if (randomVal <= 0) {
        selectedIdx = i;
        break;
      }
    }

    const selectedOption = options[selectedIdx];
    
    // Calculate rotation angle
    // Each option occupies an angle proportional to its weight
    const segmentAngles: { start: number; end: number }[] = [];
    let currentAngle = 0;
    options.forEach((opt) => {
      const size = (opt.weight / totalWeight) * 360;
      segmentAngles.push({ start: currentAngle, end: currentAngle + size });
      currentAngle += size;
    });

    const targetSeg = segmentAngles[selectedIdx];
    const middleAngle = (targetSeg.start + targetSeg.end) / 2;
    
    // In canvas rotation, 0 deg is at the top (or right depending on layout)
    // To land on pointer (usually at top, i.e., 270 deg or 90 deg), we adjust:
    const targetAngleOnWheel = 360 - middleAngle; 
    const extraSpins = 360 * 5; // 5 full spins
    const finalRotation = rotation + extraSpins + (targetAngleOnWheel - (rotation % 360));

    setRotation(finalRotation);

    setTimeout(() => {
      setIsSpinning(false);
      setSpinResult(selectedOption.name);
    }, 4000); // match 4s CSS transition
  };

  // Build conic-gradient css dynamically based on options and weights
  const totalWeight = options.reduce((sum, o) => sum + o.weight, 0);
  const colors = [
    "#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", 
    "#ec4899", "#14b8a6", "#6366f1", "#f97316", "#84cc16"
  ];
  
  let gradientParts: string[] = [];
  let accumulatedPercent = 0;
  options.forEach((opt, idx) => {
    const sizePercent = (opt.weight / totalWeight) * 100;
    const nextPercent = accumulatedPercent + sizePercent;
    const color = colors[idx % colors.length];
    gradientParts.push(`${color} ${accumulatedPercent.toFixed(1)}% ${nextPercent.toFixed(1)}%`);
    accumulatedPercent = nextPercent;
  });

  const conicStyle = {
    background: `conic-gradient(${gradientParts.join(", ")})`,
    transform: `rotate(${rotation}deg)`,
    transition: "transform 4s cubic-bezier(0.15, 0.85, 0.15, 1)"
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="text-center">
        <h4 className="text-sm font-bold text-gray-800">🔮 命运大转盘</h4>
        <p className="text-[10px] text-gray-400 mt-1">纠结终结者！概率可调，看看今天命运怎么安排你的摸鱼时间。</p>
      </div>

      {/* Visual Wheel Display */}
      <div className="flex flex-col items-center justify-center py-4 relative">
        {/* Pointer */}
        <div className="absolute top-2 z-20 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-amber-500 filter drop-shadow-sm"></div>
        
        {/* Wheel circle */}
        <div className="w-56 h-56 rounded-full border-4 border-white shadow-lg relative overflow-hidden flex items-center justify-center">
          <div style={conicStyle} className="w-full h-full absolute inset-0 rounded-full"></div>
          {/* Inner small hub */}
          <div className="w-12 h-12 rounded-full bg-white border border-gray-100 shadow-md z-10 flex items-center justify-center">
            <button
              onClick={spin}
              disabled={isSpinning}
              className={`w-10 h-10 rounded-full text-[10px] font-black text-white flex items-center justify-center cursor-pointer select-none transition-all ${
                isSpinning ? "bg-gray-400" : isMadness ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              SPIN
            </button>
          </div>
        </div>

        {/* Output Result */}
        {spinResult && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-xl text-center text-xs font-bold text-amber-800 animate-bounce">
            🎉 恭喜获得：{spinResult}
          </div>
        )}
      </div>

      {/* Options List & Customization Panel */}
      <div className="bg-white/50 border border-gray-100 rounded-2xl p-4">
        <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2.5">
          转盘选项及权重设置 (总计: {totalWeight})
        </h5>
        
        {/* List */}
        <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
          {options.map((opt, idx) => (
            <div key={opt.id} className="flex items-center justify-between p-2 bg-white rounded-xl border border-gray-100 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colors[idx % colors.length] }}></span>
                <span className="font-semibold text-gray-700 truncate max-w-[150px]">{opt.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-gray-400 font-mono">权重: {opt.weight}</span>
                <button
                  onClick={() => handleRemoveOption(opt.id)}
                  className="text-red-500 hover:text-red-700 transition-colors cursor-pointer text-sm"
                  title="删除"
                >
                  <span className="material-symbols-outlined text-base">delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add option form */}
        <form onSubmit={handleAddOption} className="mt-3 grid grid-cols-12 gap-2">
          <input
            type="text"
            required
            placeholder="新选项内容"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="col-span-6 p-2 border border-gray-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-blue-500"
          />
          <div className="col-span-4 flex items-center gap-1">
            <span className="text-[10px] text-gray-400 font-bold">权重:</span>
            <input
              type="number"
              min={1}
              max={100}
              required
              value={newWeight}
              onChange={(e) => setNewWeight(Number(e.target.value))}
              className="w-full p-2 border border-gray-200 rounded-xl text-xs font-mono outline-none"
            />
          </div>
          <button
            type="submit"
            className={`col-span-2 rounded-xl text-white font-bold text-xs flex items-center justify-center cursor-pointer ${
              isMadness ? "bg-red-600" : "bg-blue-600"
            }`}
          >
            +
          </button>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 2. FINGER CALCULATOR (手指计算器) COMPONENT
// ==========================================

export const FingerCalculator: React.FC = () => {
  const [display, setDisplay] = useState("0");
  const [expression, setExpression] = useState("");
  const [resetOnNext, setResetOnNext] = useState(false);

  // Compute finger graphics based on the current parsed display number
  const getFingerEmojis = () => {
    const num = parseFloat(display);
    if (isNaN(num)) return "🤷";
    if (num < 0) return "✊ (负数折合拳头)";
    if (num === 0) return "✊ (握拳)";
    
    const count = Math.min(100, Math.floor(num));
    if (count === 0) return "✊";

    // Build combinations of 10s and units
    const tens = Math.floor(count / 10);
    const remainder = count % 10;

    let emojis = "";
    // Represent 10s as double hands up 🙌 or 👐
    for (let i = 0; i < tens; i++) {
      emojis += "👐";
    }

    if (remainder > 0) {
      if (remainder === 5) emojis += "🖐️";
      else if (remainder === 1) emojis += "☝️";
      else if (remainder === 2) emojis += "✌️";
      else if (remainder === 3) emojis += "🤟";
      else if (remainder === 4) emojis += "✊🖐️"; // 4 fingers approx
      else if (remainder === 6) emojis += "🤙"; // shaka sign
      else if (remainder === 7) emojis += "🤞";
      else if (remainder === 8) emojis += "👉";
      else if (remainder === 9) emojis += "👌"; // roughly
      else {
        // Fallback multiple counts
        for (let j = 0; j < remainder; j++) emojis += "🖕"; // wait, let's use safer finger emojis: ☝️
      }
    }

    return `${emojis} (合计: ${count} 根手指)`;
  };

  const handleInput = (char: string) => {
    if (resetOnNext) {
      setDisplay(char);
      setResetOnNext(false);
      return;
    }
    if (display === "0" && char !== ".") {
      setDisplay(char);
    } else {
      setDisplay(display + char);
    }
  };

  const handleOp = (op: string) => {
    setExpression(display + " " + op + " ");
    setResetOnNext(true);
  };

  const handleClear = () => {
    setDisplay("0");
    setExpression("");
    setResetOnNext(false);
  };

  const handleBackspace = () => {
    if (display.length <= 1) {
      setDisplay("0");
    } else {
      setDisplay(display.slice(0, -1));
    }
  };

  const calculate = () => {
    if (!expression) return;
    try {
      const fullExp = expression + display;
      // Sanitize evaluation
      const cleanExp = fullExp.replace(/[^0-9.+\-*/\s]/g, "");
      // eslint-disable-next-line no-eval
      const result = eval(cleanExp);
      const formatted = Number(Number(result).toFixed(4)).toString();
      setDisplay(formatted);
      setExpression("");
      setResetOnNext(true);
    } catch {
      setDisplay("错误");
      setExpression("");
      setResetOnNext(true);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="text-center">
        <h4 className="text-sm font-bold text-gray-800">🖐️ 量子手指计算器</h4>
        <p className="text-[10px] text-gray-400 mt-1">牛马打工，唯有用手指拼命计算。不仅算出数字，还贴心告诉你需要动用几根手指。</p>
      </div>

      {/* Screen displays */}
      <div className="p-4 bg-gray-900 rounded-2xl border border-gray-950 text-right space-y-1 shadow-inner relative overflow-hidden">
        {/* Finger representation feedback strip */}
        <div className="text-[10px] text-orange-400 font-semibold truncate block text-left mb-1 font-mono">
          {getFingerEmojis()}
        </div>

        <div className="text-[10px] text-gray-500 font-mono h-4 truncate">
          {expression}
        </div>
        <div className="text-2xl font-black font-mono text-white tracking-wide truncate">
          {display}
        </div>
      </div>

      {/* Keyboard Grid */}
      <div className="grid grid-cols-4 gap-2">
        <button onClick={handleClear} className="p-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl font-bold text-xs cursor-pointer active:scale-95 transition-all">AC</button>
        <button onClick={handleBackspace} className="p-3 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-xl font-bold text-xs cursor-pointer active:scale-95 transition-all">⌫</button>
        <button onClick={() => handleOp("/")} className="p-3 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl font-bold text-xs cursor-pointer active:scale-95 transition-all">÷</button>
        <button onClick={() => handleOp("*")} className="p-3 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl font-bold text-xs cursor-pointer active:scale-95 transition-all">×</button>

        <button onClick={() => handleInput("7")} className="p-3 bg-white hover:bg-gray-50 text-gray-700 rounded-xl border border-gray-100 font-bold text-xs cursor-pointer active:scale-95 transition-all">7</button>
        <button onClick={() => handleInput("8")} className="p-3 bg-white hover:bg-gray-50 text-gray-700 rounded-xl border border-gray-100 font-bold text-xs cursor-pointer active:scale-95 transition-all">8</button>
        <button onClick={() => handleInput("9")} className="p-3 bg-white hover:bg-gray-50 text-gray-700 rounded-xl border border-gray-100 font-bold text-xs cursor-pointer active:scale-95 transition-all">9</button>
        <button onClick={() => handleOp("-")} className="p-3 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl font-bold text-xs cursor-pointer active:scale-95 transition-all">−</button>

        <button onClick={() => handleInput("4")} className="p-3 bg-white hover:bg-gray-50 text-gray-700 rounded-xl border border-gray-100 font-bold text-xs cursor-pointer active:scale-95 transition-all">4</button>
        <button onClick={() => handleInput("5")} className="p-3 bg-white hover:bg-gray-50 text-gray-700 rounded-xl border border-gray-100 font-bold text-xs cursor-pointer active:scale-95 transition-all">5</button>
        <button onClick={() => handleInput("6")} className="p-3 bg-white hover:bg-gray-50 text-gray-700 rounded-xl border border-gray-100 font-bold text-xs cursor-pointer active:scale-95 transition-all">6</button>
        <button onClick={() => handleOp("+")} className="p-3 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl font-bold text-xs cursor-pointer active:scale-95 transition-all">+</button>

        <button onClick={() => handleInput("1")} className="p-3 bg-white hover:bg-gray-50 text-gray-700 rounded-xl border border-gray-100 font-bold text-xs cursor-pointer active:scale-95 transition-all">1</button>
        <button onClick={() => handleInput("2")} className="p-3 bg-white hover:bg-gray-50 text-gray-700 rounded-xl border border-gray-100 font-bold text-xs cursor-pointer active:scale-95 transition-all">2</button>
        <button onClick={() => handleInput("3")} className="p-3 bg-white hover:bg-gray-50 text-gray-700 rounded-xl border border-gray-100 font-bold text-xs cursor-pointer active:scale-95 transition-all">3</button>
        <button onClick={calculate} className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs cursor-pointer active:scale-95 transition-all row-span-2 flex items-center justify-center">=</button>

        <button onClick={() => handleInput("0")} className="p-3 bg-white hover:bg-gray-50 text-gray-700 rounded-xl border border-gray-100 font-bold text-xs cursor-pointer active:scale-95 transition-all col-span-2">0</button>
        <button onClick={() => handleInput(".")} className="p-3 bg-white hover:bg-gray-50 text-gray-700 rounded-xl border border-gray-100 font-bold text-xs cursor-pointer active:scale-95 transition-all">.</button>
      </div>
    </div>
  );
};

// ==========================================
// 3. RELATIONSHIP CALCULATOR (亲戚计算器) COMPONENT
// ==========================================

export const RelationshipCalculator: React.FC<{ isMadness: boolean }> = ({ isMadness }) => {
  const [myGender, setMyGender] = useState<"male" | "female">("male");
  const [perspective, setPerspective] = useState<"call" | "reversed">("call"); // Call (我称呼他) vs Reversed (他称呼我)
  const [chain, setChain] = useState<string[]>([]);
  const [result, setResult] = useState<string>("自己");

  const handleAddRelation = (relation: string) => {
    // Basic relationship syntax guard
    if (chain.length >= 6) {
      alert("亲戚关系链路过长，防风控自动拦截！");
      return;
    }
    const updated = [...chain, relation];
    setChain(updated);
  };

  const handleBackspace = () => {
    if (chain.length > 0) {
      setChain(chain.slice(0, -1));
    }
  };

  const handleReset = () => {
    setChain([]);
    setResult("自己");
  };

  const handleCalculate = () => {
    const simplifiedChain = simplifyRelationshipChain(chain);

    if (simplifiedChain.length === 0) {
      setResult("自己");
      return;
    }

    // Solve "我称呼他" relationship sequence
    let current = "";
    const first = simplifiedChain[0];

    // Quick validations
    if (first === "老公" && myGender === "male") {
      setResult("无效关系 (男性不能有老公)");
      return;
    }
    if (first === "老婆" && myGender === "female") {
      setResult("无效关系 (女性不能有老婆)");
      return;
    }

    current = first;

    for (let i = 1; i < simplifiedChain.length; i++) {
      const next = simplifiedChain[i];
      const key = `${current} + ${next}`;
      const mapped = RELATIONSHIP_TRANSITIONS[key];
      if (mapped) {
        current = mapped;
      } else {
        current = `${current}的${next}`;
      }
    }

    if (perspective === "reversed") {
      // Find "he/she calls me" reverse mapping
      const reversedResult = getReverseCall(current, myGender);
      setResult(reversedResult);
    } else {
      setResult(current);
    }
  };

  // Run automatically when inputs change for a fluid SPA feel
  useEffect(() => {
    handleCalculate();
  }, [chain, myGender, perspective]);

  const formatChain = () => {
    if (chain.length === 0) return "我";
    return "我 的 " + chain.join(" 的 ");
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Top Description */}
      <div className="text-center">
        <h4 className="text-sm font-bold text-gray-800">🧑‍🤝‍🧑 亲戚称呼计算器</h4>
        <p className="text-[10px] text-gray-400 mt-1">
          走亲访友必备黑科技！不管是大伯的小舅子，还是姑姑的二姨，一键算出体面称呼。
        </p>
      </div>

      {/* Screen Panel */}
      <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl space-y-1.5 shadow-sm">
        {/* Gender / Perspective Labels */}
        <div className="flex justify-between items-center text-[10px] text-gray-400 font-bold uppercase tracking-wider">
          <span className="flex items-center gap-1">
            我是: <strong className={myGender === "male" ? "text-blue-500" : "text-pink-500"}>{myGender === "male" ? "男 ♂️" : "女 ♀️"}</strong>
          </span>
          <span>
            模式: <strong className="text-amber-600">{perspective === "call" ? "我 ➔ 他 (我称呼他)" : "他 ➔ 我 (他称呼我)"}</strong>
          </span>
        </div>

        {/* Expression */}
        <div className="text-xs text-gray-500 font-semibold font-sans leading-relaxed break-all bg-white p-2 rounded-xl border border-gray-100 shadow-inner">
          {formatChain()}
        </div>

        {/* Result Output */}
        <div className="pt-1 flex justify-between items-center">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">称呼结果</span>
          <span className={`text-base font-black ${isMadness ? "text-red-600" : "text-blue-600"}`}>{result}</span>
        </div>
      </div>

      {/* Top Controls Grid: (我是)男女 (左上角) + Perspective Switcher */}
      <div className="flex gap-2">
        {/* Gender Selector: (我是)男女 (左上角) */}
        <div className="flex bg-gray-100 p-1 rounded-xl shrink-0">
          <button
            onClick={() => setMyGender("male")}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
              myGender === "male" ? "bg-blue-600 text-white shadow-xs" : "text-gray-500"
            }`}
          >
            男 ♂️
          </button>
          <button
            onClick={() => setMyGender("female")}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
              myGender === "female" ? "bg-pink-600 text-white shadow-xs" : "text-gray-500"
            }`}
          >
            女 ♀️
          </button>
        </div>

        {/* Direction switch label indicator */}
        <button
          onClick={() => setPerspective(perspective === "call" ? "reversed" : "call")}
          className="flex-1 px-3 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-100 text-amber-800 text-[10px] font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 active:scale-95"
        >
          <span className="material-symbols-outlined text-sm">sync_alt</span>
          {perspective === "call" ? "切换: 他称呼我" : "切换: 我称呼他"}
        </button>
      </div>

      {/* Keypad Grid (爸爸, 妈妈, 哥哥, 姐姐, 弟弟, 妹妹, 老公, 老婆, 儿子, 女儿) */}
      <div className="grid grid-cols-5 gap-1.5">
        <button
          onClick={() => handleAddRelation("爸爸")}
          className="p-2.5 bg-white hover:bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-700 cursor-pointer active:scale-95 transition-all"
        >
          爸爸
        </button>
        <button
          onClick={() => handleAddRelation("妈妈")}
          className="p-2.5 bg-white hover:bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-700 cursor-pointer active:scale-95 transition-all"
        >
          妈妈
        </button>
        <button
          onClick={() => handleAddRelation("哥哥")}
          className="p-2.5 bg-white hover:bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-700 cursor-pointer active:scale-95 transition-all"
        >
          哥哥
        </button>
        <button
          onClick={() => handleAddRelation("姐姐")}
          className="p-2.5 bg-white hover:bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-700 cursor-pointer active:scale-95 transition-all"
        >
          姐姐
        </button>
        <button
          onClick={() => handleAddRelation("弟弟")}
          className="p-2.5 bg-white hover:bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-700 cursor-pointer active:scale-95 transition-all"
        >
          弟弟
        </button>

        <button
          onClick={() => handleAddRelation("妹妹")}
          className="p-2.5 bg-white hover:bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-700 cursor-pointer active:scale-95 transition-all"
        >
          妹妹
        </button>
        <button
          onClick={() => handleAddRelation("老公")}
          className="p-2.5 bg-white hover:bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-700 cursor-pointer active:scale-95 transition-all"
        >
          老公
        </button>
        <button
          onClick={() => handleAddRelation("老婆")}
          className="p-2.5 bg-white hover:bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-700 cursor-pointer active:scale-95 transition-all"
        >
          老婆
        </button>
        <button
          onClick={() => handleAddRelation("儿子")}
          className="p-2.5 bg-white hover:bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-700 cursor-pointer active:scale-95 transition-all"
        >
          儿子
        </button>
        <button
          onClick={() => handleAddRelation("女儿")}
          className="p-2.5 bg-white hover:bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-700 cursor-pointer active:scale-95 transition-all"
        >
          女儿
        </button>
      </div>

      {/* Control Buttons Grid: 切换, 回退, 重置, 等于 */}
      <div className="grid grid-cols-4 gap-2 pt-2 border-t border-gray-100">
        <button
          onClick={() => setPerspective(perspective === "call" ? "reversed" : "call")}
          className="p-3 bg-amber-50 text-amber-700 font-bold hover:bg-amber-100 rounded-xl text-xs cursor-pointer active:scale-95 transition-all"
        >
          切换模式
        </button>
        <button
          onClick={handleBackspace}
          className="p-3 bg-gray-100 text-gray-600 font-bold hover:bg-gray-200 rounded-xl text-xs cursor-pointer active:scale-95 transition-all"
        >
          回退
        </button>
        <button
          onClick={handleReset}
          className="p-3 bg-red-50 text-red-600 font-bold hover:bg-red-100 rounded-xl text-xs cursor-pointer active:scale-95 transition-all"
        >
          重置
        </button>
        <button
          onClick={handleCalculate}
          className={`p-3 text-white font-black rounded-xl text-xs cursor-pointer active:scale-95 transition-all shadow-xs ${
            isMadness ? "bg-red-600" : "bg-blue-600"
          }`}
        >
          等于
        </button>
      </div>
    </div>
  );
};

// ==========================================
// 4. GENDER PREDICTOR (性别预测) COMPONENT
// ==========================================

export const GenderPredictor: React.FC = () => {
  const [selectedRelative, setSelectedRelative] = useState(GENDER_RELATIVES[0].name);

  const matched = GENDER_RELATIVES.find((r) => r.name === selectedRelative) || GENDER_RELATIVES[0];

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="text-center">
        <h4 className="text-sm font-bold text-gray-800">🧬 量子性别预测</h4>
        <p className="text-[10px] text-gray-400 mt-1">
          根据所选亲戚称谓，运用深奥的量子称谓逻辑学，100%精准推断预测其生理与社会性别。
        </p>
      </div>

      {/* Relative Selector Selector Dropdown or Grid */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
          选择目标亲戚
        </label>
        <select
          value={selectedRelative}
          onChange={(e) => setSelectedRelative(e.target.value)}
          className="w-full p-3 border border-gray-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 bg-white"
        >
          {GENDER_RELATIVES.map((rel) => (
            <option key={rel.name} value={rel.name}>
              {rel.name}
            </option>
          ))}
        </select>
      </div>

      {/* Prediction Output Card */}
      <div className="p-5 bg-white border border-gray-100 shadow-sm rounded-2xl relative overflow-hidden flex items-center gap-4">
        {/* Watermark blur bg */}
        <div className={`absolute -right-4 -bottom-4 w-16 h-16 rounded-full blur-2xl opacity-25 ${
          matched.gender === "男" ? "bg-blue-500" : "bg-pink-500"
        }`}></div>

        {/* Mascot Icon */}
        <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl font-black shrink-0 shadow-inner ${
          matched.gender === "男" ? "bg-blue-50 text-blue-600 border border-blue-100" : "bg-pink-50 text-pink-600 border border-pink-100"
        }`}>
          {matched.gender === "男" ? "♂️" : "♀️"}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-500">称呼:</span>
            <span className="text-sm font-black text-gray-800">{matched.name}</span>
          </div>

          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-bold text-gray-500">预测性别:</span>
            <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
              matched.gender === "男" ? "bg-blue-100 text-blue-800" : "bg-pink-100 text-pink-800"
            }`}>
              {matched.gender}性
            </span>
          </div>

          <p className="text-[10px] text-gray-400 mt-2 leading-relaxed">
            💡 {matched.desc}
          </p>
        </div>
      </div>

      <div className="p-3 bg-emerald-50/70 border border-emerald-100 text-[10px] text-emerald-800 font-medium rounded-xl leading-relaxed text-center">
        ⚡ 预测原理：基于华夏数千年沉淀之尊称词组语义场。由于「{matched.name}」中富含特定的辈分语境，该算力节点以 100.00% 的准确率推断其生理性别的概率坍缩为「{matched.gender}」。
      </div>
    </div>
  );
};
