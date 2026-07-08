import { Task, LongTermGoal } from "./types";

export const DEFAULT_STUDENT_TASKS: Task[] = [
  { id: "s1", text: "阅读一篇高难英文文献（并用机器翻译应付）", completed: false },
  { id: "s2", text: "深呼吸，告诉自己世界很美好，学业自有定数", completed: true },
  { id: "s3", text: "反思为什么我还没毕业就已经开始盘算退休生活", completed: false },
  { id: "s4", text: "给导师发一句：‘收到，正在全力修改中！’", completed: false },
  { id: "s5", text: "在饭堂排队时构思今天摸鱼的10个借口", completed: false },
];

export const DEFAULT_WORKER_TASKS: Task[] = [
  { id: "w1", text: "完成今日份的“牛马”日报/周报KPI", completed: false },
  { id: "w2", text: "深呼吸，告诉自己世界很美好，工作只是赚钱工具", completed: true },
  { id: "w3", text: "反思为什么我还没退休（明明卡里只有三位数）", completed: false },
  { id: "w4", text: "双击打开微信和IDE窗口，实现光速切屏防御", completed: false },
  { id: "w5", text: "在带薪拉屎的过程中，领悟生命与工作的终极真谛", completed: false },
];

export const DEFAULT_STUDENT_GOALS: LongTermGoal[] = [
  { id: "g_s1", text: "顺利混过导师这一关，顺利拿到学位证", completed: false },
  { id: "g_s2", text: "在学术圈优雅退场，绝不再读第二个博士/硕士", completed: false },
  { id: "g_s3", text: "实现早睡早起，拯救日渐退后的发际线", completed: false },
  { id: "g_s4", text: "暴富并彻底告别周报和实验报告", completed: false },
];

export const DEFAULT_WORKER_GOALS: LongTermGoal[] = [
  { id: "g_w1", text: "攒够两年的基础生活费，随时准备向老板扔辞职信", completed: false },
  { id: "g_w2", text: "争取在 35 岁之前退休（或者被退休）", completed: false },
  { id: "g_w3", text: "绝不加班！捍卫下班后的精神自由与躺平权", completed: false },
  { id: "g_w4", text: "买彩票中一等奖，买下公司并开除所有乱开会的主管", completed: false },
];

export interface SlackTitle {
  id: string;
  name: string;
  desc: string;
  minHours: number;
}

export const SLACK_TITLES: SlackTitle[] = [
  { id: "t1", name: "学术逃生舱员", desc: "主打一个导师不找，绝不现身；导师一找，当场装死。", minHours: 0 },
  { id: "t2", name: "带薪拉屎专家", desc: "在马桶上思考宇宙和人生，是每天雷打不动的15分钟圣餐礼。", minHours: 5 },
  { id: "t3", name: "键盘疯狂乐手", desc: "打字声如疾风骤雨，其实只是在写匿名吐槽和灌水论坛。", minHours: 15 },
  { id: "t4", name: "茶水间常客", desc: "每天接水8次，去咖啡机前驻足10分钟，被怀疑正在暗中兼职保洁。", minHours: 35 },
  { id: "t5", name: "无情摸鱼大师", desc: "深谙高效休息之精髓，人机合一，眼神呆滞却指尖起舞。", minHours: 60 },
  { id: "t6", name: "薪水终极刺客", desc: "摸鱼的艺术已达至化境，上班8小时，实际产出15分钟，全身而退。", minHours: 120 },
];

export const SLACKING_QUOTES: string[] = [
  "“摸鱼是为了更长远的努力。”",
  "“只要我不够努力，老板就永远过不上想要的生活。”",
  "“今天工作不努力，明天公司就倒闭？太好了，明天不用上班了！”",
  "“打工是不可能打工的，这辈子就指望着摸鱼勉强维持生活了。”",
  "“带薪拉屎十五分钟，是当代牛马对资本剥削最无声也最坚决的抗议。”",
  "“导师的饼画得再大，也填不饱我这颗向往假期和自由的胃。”",
  "“工作是谋生的手段，摸鱼才是人生的主旋律。”",
  "“在疯狂的 grind 中，保持优雅而平静地活着，这就是至高智慧。”",
];

export const MOCK_LEADERBOARD = [
  { name: "Alex 摸鱼大师", title: "无情摸鱼大师", hours: 256, isCurrentUser: true },
  { name: "PPT 纺织女工", title: "薪水终极刺客", hours: 214, isCurrentUser: false },
  { name: "Bug 制造专家", title: "键盘疯狂乐手", hours: 189, isCurrentUser: false },
  { name: "带薪拉屎一姐", title: "带薪拉屎专家", hours: 155, isCurrentUser: false },
  { name: "汇报PPT粉刷匠", title: "茶水间常客", hours: 123, isCurrentUser: false },
  { name: "文献收割机", title: "学术逃生舱员", hours: 98, isCurrentUser: false },
  { name: "摸鱼界的新星", title: "带薪拉屎专家", hours: 44, isCurrentUser: false },
];

export const BOSS_VIBES = [
  { id: "v1", label: "微操型（Micromanaging）", desc: "恨不得把进度盯着按秒算，隔5分钟问一句进展" },
  { id: "v2", label: "喜怒无常型（Unpredictable）", desc: "一会儿和蔼可亲说没事，一会儿突然发飙要结果" },
  { id: "v3", label: "死亡微笑型（Fake Smile）", desc: "总是笑眯眯地走过来，给你塞一个周末急活" },
  { id: "v4", label: "死寂无声型（Dead Silent）", desc: "群里发了通知从来不说话，但会在暗中记小本本" },
  { id: "v5", label: "学术宏图型（Academic Baker）", desc: "老师拉着你讲诺贝尔奖级构想，明天却要见初稿" },
];

export const VENT_BACKGROUND_COMMENTS = [
  "为什么每周五下午6点雷打不动要开会？！",
  "教授，我只是个凡人，写不出Science！",
  "又在群里发‘收到请回复’了，装作没看到中...",
  "今天食堂的菜比我的学术前途还要难以下咽。",
  "带薪拉屎第25分钟，外面有人敲门，危！",
  "老板刚才往我工位看了三次，他是爱上我了吗？",
  "天天写PPT，我感觉自己像一个流水线粉刷匠。",
  "如果写Bug是一种才华，我已经富可敌国了。",
  "学术界已经不缺我这一个牛马了，放我走吧！",
  "我的工作主要是负责坐在工位上呼吸。",
];
