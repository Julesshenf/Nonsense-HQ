import React, { useState, useEffect } from "react";
import { Identity, EnergyFieldResponse, TribunalResponse, FavoriteItem, HistoryItem, Task, LongTermGoal } from "../types";
import { BOSS_VIBES } from "../data";

interface EnergyFieldModalProps {
  isOpen: boolean;
  onClose: () => void;
  identity: Identity;
  onSaveFavorite: (type: "energy", title: string, subtitle: string, data: EnergyFieldResponse) => void;
  onAddHistory: (type: "energy", title: string, subtitle: string, details: any) => void;
  isMadness: boolean;
}

const normalizeEnergyFieldResult = (data: unknown): EnergyFieldResponse => {
  const value = data && typeof data === "object" ? data as Record<string, unknown> : {};
  const threatLevel = Number(value.threatLevel);
  const survivalGuide = Array.isArray(value.survivalGuide)
    ? value.survivalGuide.filter((item): item is string => typeof item === "string")
    : [];

  const isValid = typeof value.fieldType === "string" && value.fieldType.trim().length > 0
    && Number.isFinite(threatLevel)
    && typeof value.vibeRating === "string" && value.vibeRating.trim().length > 0
    && typeof value.translation === "string" && value.translation.trim().length > 0
    && survivalGuide.length > 0
    && typeof value.slackingRisk === "string" && value.slackingRisk.trim().length > 0;

  if (!isValid) {
    throw new Error("AI returned an incomplete energy-field analysis");
  }

  return {
    fieldType: value.fieldType as string,
    threatLevel: Math.min(100, Math.max(0, threatLevel)),
    vibeRating: value.vibeRating as string,
    translation: value.translation as string,
    survivalGuide,
    slackingRisk: value.slackingRisk as string,
  };
};

export const EnergyFieldModal: React.FC<EnergyFieldModalProps> = ({
  isOpen,
  onClose,
  identity,
  onSaveFavorite,
  onAddHistory,
  isMadness,
}) => {
  const [quote, setQuote] = useState("");
  const [vibeId, setVibeId] = useState(BOSS_VIBES[0].id);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [result, setResult] = useState<EnergyFieldResponse | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const loadingMessages = [
    "正在分析导师/老板的本周画饼配方...",
    "正在通过量子力学推演其血压指数...",
    "正在对比历史年终奖发放记录...",
    "正在匹配摸鱼防抓逃生路线...",
    "正在加载牛马生存指南核心模块...",
  ];

  useEffect(() => {
    let interval: any;
    if (isLoading) {
      setLoadingMsg(loadingMessages[0]);
      let idx = 1;
      interval = setInterval(() => {
        setLoadingMsg(loadingMessages[idx % loadingMessages.length]);
        idx++;
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  if (!isOpen) return null;

  const selectedVibe = BOSS_VIBES.find((v) => v.id === vibeId) || BOSS_VIBES[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quote.trim()) return;

    setIsLoading(true);
    setResult(null);
    setIsSaved(false);
    setErrorMessage("");

    try {
      const response = await fetch("/api/energy-field", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identity,
          quote,
          vibe: selectedVibe.label,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        const normalizedResult = normalizeEnergyFieldResult(data);
        setResult(normalizedResult);
        onAddHistory(
          "energy",
          normalizedResult.fieldType,
          `${identity === "Student" ? "导师" : "老板"}能量场分析: 危机指数 ${normalizedResult.threatLevel}%`,
          normalizedResult
        );
      } else {
        throw new Error(data.error || "Request failed");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("这次 AI 没有生成有效的分析结果，请稍后重试。你的原话不会被替换成演示内容。");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    if (!result) return;
    onSaveFavorite(
      "energy",
      result.fieldType,
      `${identity === "Student" ? "导师" : "老板"}: "${quote.substring(0, 15)}..."`,
      result
    );
    setIsSaved(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-100 flex flex-col my-8 animate-fade-in">
        {/* Modal Header */}
        <div className={`p-6 text-white flex justify-between items-center ${isMadness ? "bg-red-600" : "bg-blue-600"}`}>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-2xl">bolt</span>
            <h3 className="text-lg font-bold">老板/老师能量场分析</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/15 active:scale-90 transition-all">
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-4">
              <div className={`w-16 h-16 rounded-full border-4 border-t-transparent animate-spin ${isMadness ? "border-red-600" : "border-blue-600"}`}></div>
              <p className="text-gray-600 text-sm font-medium animate-pulse text-center">{loadingMsg}</p>
            </div>
          ) : result ? (
            /* Results View */
            <div className="space-y-5 animate-fade-in">
              <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-orange-800 uppercase tracking-widest bg-orange-100 px-2 py-0.5 rounded-full">
                    能量场类型
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-500">危机指数:</span>
                    <span className="text-sm font-bold text-red-600">{result.threatLevel}%</span>
                  </div>
                </div>
                <h4 className="text-xl font-bold text-gray-900">{result.fieldType}</h4>
                
                {/* Danger progress bar */}
                <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-1000" 
                    style={{ 
                      width: `${result.threatLevel}%`,
                      backgroundColor: result.threatLevel > 75 ? '#dc2626' : result.threatLevel > 45 ? '#ea580c' : '#16a34a' 
                    }}
                  ></div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">气场波动评估</h5>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100">{result.vibeRating}</p>
                </div>

                <div>
                  <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">黑话翻译器 (真意)</h5>
                  <p className="text-sm italic font-medium text-gray-800 bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                    {result.translation}
                  </p>
                </div>

                <div>
                  <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">牛马存活指南</h5>
                  <ol className="space-y-2.5">
                    {result.survivalGuide.map((guide, idx) => (
                      <li key={idx} className="text-sm text-gray-700 flex gap-2.5 items-start">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 mt-0.5 ${isMadness ? "bg-red-600" : "bg-blue-600"}`}>
                          {idx + 1}
                        </span>
                        <span>{guide}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="pt-2 border-t border-gray-100">
                  <h5 className="text-xs font-bold text-red-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">warning</span>
                    摸鱼风控预警
                  </h5>
                  <p className="text-xs text-red-700 bg-red-50 p-3 rounded-xl border border-red-100 font-medium">
                    {result.slackingRisk}
                  </p>
                </div>
              </div>

              {/* Action buttons inside result */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaved}
                  className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border transition-all ${
                    isSaved 
                      ? "bg-green-50 text-green-700 border-green-200 cursor-default" 
                      : isMadness 
                        ? "bg-white text-red-600 border-red-200 hover:bg-red-50" 
                        : "bg-white text-blue-600 border-blue-200 hover:bg-blue-50"
                  }`}
                >
                  <span className="material-symbols-outlined text-lg">{isSaved ? "check" : "grade"}</span>
                  {isSaved ? "已保存到我的收藏" : "收藏本篇指南"}
                </button>
                <button
                  type="button"
                  onClick={() => { setResult(null); setQuote(""); }}
                  className={`px-6 py-3 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 active:scale-95 ${
                    isMadness ? "bg-red-600 shadow-red-100" : "bg-blue-600 shadow-blue-100"
                  }`}
                >
                  再次分析
                </button>
              </div>
            </div>
          ) : (
            /* Input Form View */
            <form onSubmit={handleSubmit} className="space-y-5">
              {errorMessage && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {errorMessage}
                </div>
              )}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                  输入{identity === "Student" ? "导师/学术顾问" : "老板/主管"}的近期发言 / 指示
                </label>
                <textarea
                  required
                  rows={3}
                  value={quote}
                  onChange={(e) => setQuote(e.target.value)}
                  placeholder={
                    identity === "Student"
                      ? "例如：‘最近实验进展如何？周五开会简单过一下PPT...’"
                      : "例如：‘这个周末辛苦大家推进一下进度，下周一晨会讨论成果...’"
                  }
                  className="w-full p-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none text-sm resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                  观察到的即时神态 / 气场
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {BOSS_VIBES.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setVibeId(v.id)}
                      className={`p-3 rounded-xl border text-left flex flex-col transition-all ${
                        vibeId === v.id
                          ? isMadness
                            ? "border-red-500 bg-red-50/50"
                            : "border-blue-500 bg-blue-50/50"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <span className="text-sm font-bold text-gray-900">{v.label}</span>
                      <span className="text-xs text-gray-500 mt-0.5">{v.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className={`w-full py-4 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-95 active:scale-95 cursor-pointer ${
                  isMadness ? "bg-red-600 shadow-lg shadow-red-100" : "bg-blue-600 shadow-lg shadow-blue-100"
                }`}
              >
                <span className="material-symbols-outlined text-lg">psychology</span>
                量子AI，启动分析
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------- */

interface TribunalModalProps {
  isOpen: boolean;
  onClose: () => void;
  identity: Identity;
  onSaveFavorite: (type: "tribunal", title: string, subtitle: string, data: TribunalResponse) => void;
  onAddHistory: (type: "tribunal", title: string, subtitle: string, details: any) => void;
  isMadness: boolean;
}

export const TribunalModal: React.FC<TribunalModalProps> = ({
  isOpen,
  onClose,
  identity,
  onSaveFavorite,
  onAddHistory,
  isMadness,
}) => {
  const [incident, setIncident] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [result, setResult] = useState<TribunalResponse | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const loadingMessages = [
    "传唤当事小事...",
    "法官正在细心梳妆并戴上18世纪假发...",
    "正在翻阅《当代牛马尊严保护大法》第99卷...",
    "正在测算其引发的心理阴影面积及摸鱼需求...",
    "正义虽然磨叽，但绝对足够离谱，请稍候...",
  ];

  useEffect(() => {
    let interval: any;
    if (isLoading) {
      setLoadingMsg(loadingMessages[0]);
      let idx = 1;
      interval = setInterval(() => {
        setLoadingMsg(loadingMessages[idx % loadingMessages.length]);
        idx++;
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incident.trim()) return;

    setIsLoading(true);
    setResult(null);
    setIsSaved(false);

    try {
      const response = await fetch("/api/tribunal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          incident,
          identity,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setResult(data);
        onAddHistory(
          "tribunal",
          data.caseName,
          `小事判决书: 精神抚慰指数 ${data.catharsisIndex}%`,
          data
        );
      } else {
        throw new Error(data.error || "Request failed");
      }
    } catch (err) {
      console.error(err);
      const mockResult: TribunalResponse = {
        caseName: "茶水间极寒牛奶离奇盗失侵害案",
        defendant: "不知名‘茶水间牛奶特工’",
        crime: "肆意掠夺牛马生存续命物资罪、公然践踏冰箱财产公约罪",
        verdict: "证据确凿！被告趁当事人沉浸于PPT写字之时，私自抽取冰箱内贴有‘Alex’标签的牛奶加入其速溶咖啡，性质极其恶劣，罪不可赦！",
        sentence: "判处该嫌疑被告人在接下来的三周内：写的所有代码全编译报错（且均是由找不到括号引起的），每次排队打饭都被食堂阿姨抖勺抖掉80%的肉，并且其个人的办公椅气压杆被调到最低位置，使其保持蹲马步姿势办公整整两周！",
        catharsisIndex: 98,
        judgeNotes: "正义或有迟到，但咖啡决不能无奶！愿这纸判决能抚平你微凉的脊椎。退庭！"
      };
      setResult(mockResult);
      onAddHistory(
        "tribunal",
        mockResult.caseName,
        `小事判决书 (演示数据): 精神抚慰指数 ${mockResult.catharsisIndex}%`,
        mockResult
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    if (!result) return;
    onSaveFavorite(
      "tribunal",
      result.caseName,
      `审判: "${incident.substring(0, 15)}..."`,
      result
    );
    setIsSaved(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-100 flex flex-col my-8 animate-fade-in">
        {/* Modal Header */}
        <div className={`p-6 text-white flex justify-between items-center ${isMadness ? "bg-red-600" : "bg-blue-600"}`}>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-2xl">gavel</span>
            <h3 className="text-lg font-bold">小事审判庭</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/15 active:scale-90 transition-all">
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-4">
              <div className={`w-16 h-16 rounded-full border-4 border-t-transparent animate-spin ${isMadness ? "border-red-600" : "border-blue-600"}`}></div>
              <p className="text-gray-600 text-sm font-medium animate-pulse text-center">{loadingMsg}</p>
            </div>
          ) : result ? (
            /* Results View */
            <div className="space-y-5 animate-fade-in">
              <div className="p-5 bg-purple-50 rounded-2xl border border-purple-100 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-purple-800 uppercase tracking-widest bg-purple-100 px-2 py-0.5 rounded-full">
                    最高法庭判决书
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-500">精神抚慰度:</span>
                    <span className="text-sm font-bold text-purple-700">{result.catharsisIndex}%</span>
                  </div>
                </div>
                <h4 className="text-lg font-bold text-gray-900 flex items-center gap-1.5 leading-tight">
                  <span className="material-symbols-outlined text-purple-600 shrink-0">gavel</span>
                  {result.caseName}
                </h4>
                
                {/* Catharsis progress bar */}
                <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-purple-600 rounded-full transition-all duration-1000" 
                    style={{ width: `${result.catharsisIndex}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider mb-0.5">被告人 / 物</span>
                    <span className="text-sm font-bold text-gray-800">{result.defendant}</span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider mb-0.5">公诉罪名</span>
                    <span className="text-sm font-bold text-red-600">{result.crime}</span>
                  </div>
                </div>

                <div>
                  <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">法庭事实调查与判词</h5>
                  <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-xl border border-gray-100 leading-relaxed">
                    {result.verdict}
                  </p>
                </div>

                <div>
                  <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1 text-purple-700">
                    <span className="material-symbols-outlined text-sm">balance</span>
                    判决书最终裁决 (处罚方式)
                  </h5>
                  <p className="text-sm font-bold text-purple-900 bg-purple-50/70 p-4 rounded-xl border border-purple-100 leading-relaxed shadow-sm">
                    {result.sentence}
                  </p>
                </div>

                <div className="pt-2 border-t border-gray-100">
                  <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">大法官结案陈词</h5>
                  <p className="text-xs text-gray-600 italic bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                    {result.judgeNotes}
                  </p>
                </div>
              </div>

              {/* Action buttons inside result */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaved}
                  className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border transition-all ${
                    isSaved 
                      ? "bg-green-50 text-green-700 border-green-200 cursor-default" 
                      : isMadness 
                        ? "bg-white text-red-600 border-red-200 hover:bg-red-50" 
                        : "bg-white text-blue-600 border-blue-200 hover:bg-blue-50"
                  }`}
                >
                  <span className="material-symbols-outlined text-lg">{isSaved ? "check" : "grade"}</span>
                  {isSaved ? "已保存判决" : "收藏本案判决书"}
                </button>
                <button
                  type="button"
                  onClick={() => { setResult(null); setIncident(""); }}
                  className={`px-6 py-3 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 active:scale-95 ${
                    isMadness ? "bg-red-600 shadow-red-100" : "bg-blue-600 shadow-blue-100"
                  }`}
                >
                  起诉新案
                </button>
              </div>
            </div>
          ) : (
            /* Input Form View */
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                  在此写下今日惹恼你的小事 / 办公室小矛盾 / 奇葩委屈
                </label>
                <textarea
                  required
                  rows={4}
                  value={incident}
                  onChange={(e) => setIncident(e.target.value)}
                  placeholder={
                    identity === "Student"
                      ? "例如：‘实验室师兄偷偷拿走了我标有名字的牛奶加入他的黑咖啡里，还装傻说不知道...’"
                      : "例如：‘主管在周五下午5点55分在群里发了三个Excel，让我们在下班前做完数据对齐，明明都是些无聊的格式整理...’"
                  }
                  className="w-full p-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none text-sm resize-none"
                />
              </div>

              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <h4 className="text-xs font-bold text-gray-500 flex items-center gap-1 mb-1">
                  <span className="material-symbols-outlined text-sm text-blue-500">info</span>
                  审判法庭说明
                </h4>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  本庭致力于处理诸如“抢咖啡机、群消息已读不回、下班前开会、论文拼写挑刺”等不入刑法但痛入骨髓的日常摩擦。我们将使用终极宏大的神圣法庭力量，还给牛马应有的尊严！
                </p>
              </div>

              <button
                type="submit"
                className={`w-full py-4 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-95 active:scale-95 cursor-pointer ${
                  isMadness ? "bg-red-600 shadow-lg shadow-red-100" : "bg-blue-600 shadow-lg shadow-blue-100"
                }`}
              >
                <span className="material-symbols-outlined text-lg">gavel</span>
                敲响法槌，请求审判
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------- */

interface FavoritesModalProps {
  isOpen: boolean;
  onClose: () => void;
  favorites: FavoriteItem[];
  onRemoveFavorite: (id: string) => void;
  isMadness: boolean;
}

export const FavoritesModal: React.FC<FavoritesModalProps> = ({
  isOpen,
  onClose,
  favorites,
  onRemoveFavorite,
  isMadness,
}) => {
  const [selectedFav, setSelectedFav] = useState<FavoriteItem | null>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-100 flex flex-col my-8 animate-fade-in h-[80vh]">
        {/* Header */}
        <div className={`p-5 text-white flex justify-between items-center ${isMadness ? "bg-red-600" : "bg-blue-600"}`}>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-2xl">grade</span>
            <h3 className="text-lg font-bold">我的收藏</h3>
          </div>
          <button 
            onClick={selectedFav ? () => setSelectedFav(null) : onClose} 
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/15 active:scale-90 transition-all"
          >
            <span className="material-symbols-outlined text-xl">{selectedFav ? "arrow_back" : "close"}</span>
          </button>
        </div>

        {/* List or Detail View */}
        <div className="flex-1 overflow-y-auto p-5">
          {selectedFav ? (
            /* Selected Favorite Detail */
            <div className="space-y-4 animate-fade-in">
              <button 
                onClick={() => setSelectedFav(null)} 
                className="text-xs font-bold text-gray-400 flex items-center gap-1 hover:text-gray-600"
              >
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                返回收藏列表
              </button>

              {selectedFav.type === "energy" ? (
                /* Energy Response card */
                <div className="space-y-4">
                  <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100 space-y-2">
                    <span className="text-[10px] font-bold text-orange-800 bg-orange-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      能量场分析
                    </span>
                    <h4 className="text-lg font-bold text-gray-900">{selectedFav.data.fieldType}</h4>
                    <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
                      <span>危机指数: <strong className="text-red-600">{selectedFav.data.threatLevel}%</strong></span>
                      <span>保存于: {new Date(selectedFav.timestamp).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div>
                      <strong className="text-xs text-gray-400 uppercase tracking-wider block mb-0.5">神态评估</strong>
                      <p className="bg-gray-50 p-3 rounded-xl border border-gray-100">{selectedFav.data.vibeRating}</p>
                    </div>
                    <div>
                      <strong className="text-xs text-gray-400 uppercase tracking-wider block mb-0.5">真意翻译</strong>
                      <p className="bg-blue-50/50 p-3 rounded-xl border border-blue-100 italic">{selectedFav.data.translation}</p>
                    </div>
                    <div>
                      <strong className="text-xs text-gray-400 uppercase tracking-wider block mb-1">生存指南</strong>
                      <ul className="space-y-2">
                        {selectedFav.data.survivalGuide.map((g: string, i: number) => (
                          <li key={i} className="flex gap-2 items-start text-xs text-gray-700">
                            <span className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px] shrink-0 mt-0.5">{i+1}</span>
                            <span>{g}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="pt-2 border-t border-gray-100">
                      <strong className="text-xs text-red-600 uppercase tracking-wider block mb-0.5">摸鱼风控</strong>
                      <p className="bg-red-50 text-red-700 p-3 rounded-xl border border-red-100 text-xs">{selectedFav.data.slackingRisk}</p>
                    </div>
                  </div>
                </div>
              ) : (
                /* Tribunal Response card */
                <div className="space-y-4">
                  <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100 space-y-2">
                    <span className="text-[10px] font-bold text-purple-800 bg-purple-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      小事判决书
                    </span>
                    <h4 className="text-lg font-bold text-gray-900">{selectedFav.data.caseName}</h4>
                    <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
                      <span>精神抚慰度: <strong className="text-purple-600">{selectedFav.data.catharsisIndex}%</strong></span>
                      <span>保存于: {new Date(selectedFav.timestamp).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="text-[9px] text-gray-400 uppercase block font-bold">被告人</span>
                        <span className="text-xs font-bold text-gray-800">{selectedFav.data.defendant}</span>
                      </div>
                      <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="text-[9px] text-gray-400 uppercase block font-bold">公诉罪名</span>
                        <span className="text-xs font-bold text-red-600">{selectedFav.data.crime}</span>
                      </div>
                    </div>
                    <div>
                      <strong className="text-xs text-gray-400 uppercase tracking-wider block mb-0.5">审判事实</strong>
                      <p className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-xs leading-relaxed">{selectedFav.data.verdict}</p>
                    </div>
                    <div>
                      <strong className="text-xs text-purple-700 uppercase tracking-wider block mb-0.5">处罚结果</strong>
                      <p className="bg-purple-50 text-purple-900 p-3.5 rounded-xl border border-purple-100 text-xs font-bold leading-relaxed">{selectedFav.data.sentence}</p>
                    </div>
                    <div>
                      <strong className="text-xs text-gray-400 uppercase tracking-wider block mb-0.5">法官寄语</strong>
                      <p className="bg-gray-50/50 p-2.5 rounded-xl border border-gray-100 text-xs italic">{selectedFav.data.judgeNotes}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : favorites.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-3 text-center">
              <span className="material-symbols-outlined text-6xl text-gray-200">folder_open</span>
              <p className="text-gray-400 text-sm">暂无收藏指南</p>
              <p className="text-xs text-gray-400 max-w-xs">你可以使用首页的【能量场分析】或【小事审判庭】生成指南，并收藏在此！</p>
            </div>
          ) : (
            /* Favorites List */
            <div className="space-y-3 animate-fade-in">
              {favorites.map((fav) => (
                <div 
                  key={fav.id} 
                  className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex justify-between items-center hover:bg-gray-100 transition-all cursor-pointer group"
                >
                  <div className="flex-1 min-w-0" onClick={() => setSelectedFav(fav)}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className={`material-symbols-outlined text-base ${fav.type === "energy" ? "text-orange-500" : "text-purple-500"}`}>
                        {fav.type === "energy" ? "bolt" : "gavel"}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {fav.type === "energy" ? "能量场分析" : "小事审判"}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-gray-800 truncate leading-snug">{fav.title}</h4>
                    <p className="text-xs text-gray-500 mt-0.5 truncate italic">{fav.subtitle}</p>
                  </div>
                  
                  <button 
                    onClick={() => onRemoveFavorite(fav.id)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 shrink-0 ml-2 transition-all active:scale-90"
                    title="移除收藏"
                  >
                    <span className="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------- */

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onClearHistory: () => void;
  isMadness: boolean;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  onClearHistory,
  isMadness,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-100 flex flex-col my-8 animate-fade-in h-[80vh]">
        {/* Header */}
        <div className={`p-5 text-white flex justify-between items-center ${isMadness ? "bg-red-600" : "bg-blue-600"}`}>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-2xl">history</span>
            <h3 className="text-lg font-bold">历史记录</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/15 active:scale-90 transition-all">
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col">
          {history.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center space-y-3 text-center">
              <span className="material-symbols-outlined text-6xl text-gray-200">history</span>
              <p className="text-gray-400 text-sm">暂无历史行为记录</p>
              <p className="text-xs text-gray-400 max-w-xs">你的摸鱼打卡、任务完成、AI判决都会写进这里的防篡改档案！</p>
            </div>
          ) : (
            <div className="space-y-4 flex-1">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gray-400">{history.length} 条记录</span>
                <button 
                  onClick={onClearHistory}
                  className="text-xs font-bold text-red-500 hover:text-red-700 hover:underline flex items-center gap-0.5"
                >
                  <span className="material-symbols-outlined text-sm">delete_sweep</span>
                  清空历史
                </button>
              </div>

              <div className="space-y-3">
                {history.map((item) => (
                  <div key={item.id} className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 flex gap-3">
                    <div className="shrink-0">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                        item.type === "slack_session" 
                          ? "bg-green-100 text-green-700" 
                          : item.type === "energy" 
                            ? "bg-orange-100 text-orange-700" 
                            : "bg-purple-100 text-purple-700"
                      }`}>
                        <span className="material-symbols-outlined text-lg">
                          {item.type === "slack_session" ? "timer" : item.type === "energy" ? "bolt" : "gavel"}
                        </span>
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-gray-800 leading-snug">{item.title}</h4>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{item.subtitle}</p>
                      <span className="text-[9px] text-gray-400 block mt-1.5">
                        {new Date(item.timestamp).toLocaleString("zh-CN", {
                          month: "numeric",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------- */

interface BeggingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDonate: (giftName: string) => void;
  isMadness: boolean;
}

export const BeggingModal: React.FC<BeggingModalProps> = ({
  isOpen,
  onClose,
  onDonate,
  isMadness,
}) => {
  const [giftResult, setGiftResult] = useState<string | null>(null);

  if (!isOpen) return null;

  const gifts = [
    { name: "🍌 1根新鲜香蕉", key: "banana", price: "￥0.00 (免费支持)", desc: "喂食程序员，大幅减少Bug产生概率", response: "【程序员Alex满足地嚼着香蕉】：‘唔，精神力量+1！今晚的Bug数量已经减半！感谢大侠喂养！’" },
    { name: "☕ 1杯冰美式", key: "coffee", price: "￥12.00 (虚拟慷慨)", desc: "牛马的心灵圣水，注入24小时摸鱼动力", response: "【Alex一口闷下冰美式，眼神恢复焦距】：‘续命成功！这就是打工人的洗礼！我感觉自己甚至能再写50个React组件！大侠大气！’" },
    { name: "🛠️ 1个紧急Bug修复", key: "bugfix", price: "￥50.00 (打工尊严)", desc: "雇佣Alex在线修掉一个折磨你3天的Bug", response: "【Alex面部狰狞地打开编辑器】：‘什么？！这个Bug居然敢折磨我的救命恩人？！看我一套降龙十八码修掉它！(啪啪啪敲击键盘) 好了恩公，完美解决！’" },
    { name: "🥧 1吨量子画饼", key: "pie", price: "￥9999.00 (免费回赠)", desc: "回敬老板和导师，让他们也尝尝被画饼的滋味", response: "【Alex开始撰写极其宏伟的三年PPT战略】：‘明白！我已将‘量子区块链摸鱼云端大协同方案’写进战略。保证导师看完脑瓜嗡嗡，直接给你评定为年度最佳研究员！’" }
  ];

  const handleSelectGift = (gift: any) => {
    setGiftResult(gift.response);
    onDonate(gift.name);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-100 flex flex-col my-8 animate-fade-in">
        {/* Header */}
        <div className={`p-5 text-white flex justify-between items-center ${isMadness ? "bg-red-600" : "bg-blue-600"}`}>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-2xl">volunteer_activism</span>
            <h3 className="text-lg font-bold">打赏乞讨 (Buy Me Coffee)</h3>
          </div>
          <button 
            onClick={giftResult ? () => setGiftResult(null) : onClose} 
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/15 active:scale-90 transition-all"
          >
            <span className="material-symbols-outlined text-xl">{giftResult ? "arrow_back" : "close"}</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {giftResult ? (
            <div className="py-8 text-center space-y-5 animate-fade-in">
              <span className="material-symbols-outlined text-7xl text-yellow-500 animate-bounce">redeem</span>
              <h4 className="text-xl font-bold text-gray-900">投喂/求助成功！</h4>
              <p className="text-sm bg-gray-50 p-4 rounded-2xl border border-gray-100 text-gray-700 font-medium italic leading-relaxed whitespace-pre-line">
                {giftResult}
              </p>
              <button
                onClick={() => setGiftResult(null)}
                className={`py-2 px-6 rounded-xl font-bold text-xs text-white transition-all ${isMadness ? "bg-red-600" : "bg-blue-600"}`}
              >
                继续投喂
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center pb-2">
                <p className="text-sm font-semibold text-gray-700">“摸鱼不是退缩，是灵魂的定期除尘。”</p>
                <p className="text-xs text-gray-500 mt-1">这里是一张免费的虚拟打赏摊位，打赏不需要付真钱（只是点击打个卡），只为了博你一笑！</p>
              </div>

              <div className="space-y-3">
                {gifts.map((g) => (
                  <button
                    key={g.key}
                    onClick={() => handleSelectGift(g)}
                    className="w-full text-left p-4 rounded-2xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50/20 transition-all flex justify-between items-center group active:scale-98"
                  >
                    <div className="space-y-0.5">
                      <span className="text-sm font-bold text-gray-900 block">{g.name}</span>
                      <span className="text-xs text-gray-500 block">{g.desc}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-blue-600 block group-hover:underline">{g.price}</span>
                      <span className="text-[10px] text-gray-400 block mt-0.5">投喂 →</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------- */

interface TaskGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  identity: Identity;
  tasks: Task[];
  goals: LongTermGoal[];
  onToggleGoal: (id: string) => void;
  onAddGoal: (text: string) => void;
  isMadness: boolean;
}

export const TaskGoalModal: React.FC<TaskGoalModalProps> = ({
  isOpen,
  onClose,
  identity,
  tasks,
  goals,
  onToggleGoal,
  onAddGoal,
  isMadness,
}) => {
  const [newGoalText, setNewGoalText] = useState("");

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalText.trim()) return;
    onAddGoal(newGoalText.trim());
    setNewGoalText("");
  };

  const completedGoals = goals.filter(g => g.completed).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-100 flex flex-col my-8 animate-fade-in h-[80vh]">
        {/* Header */}
        <div className={`p-5 text-white flex justify-between items-center ${isMadness ? "bg-red-600" : "bg-blue-600"}`}>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-2xl">flag</span>
            <h3 className="text-lg font-bold">长期大计 & 愿景板</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/15 active:scale-90 transition-all">
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 flex gap-3 items-center">
            <span className="material-symbols-outlined text-3xl text-blue-600">rocket_launch</span>
            <div>
              <h4 className="text-sm font-bold text-blue-900">宏伟目标进度</h4>
              <p className="text-xs text-blue-700 mt-0.5">
                已达标 {completedGoals} / {goals.length} 个终极目标。{completedGoals === goals.length ? "恭喜你！牛马修成正果！" : "生活在疯狂中，计划仍需稳步咬牙。"}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider block">我的终极宏图愿景清单</h5>
            
            <div className="space-y-2">
              {goals.map((g) => (
                <label 
                  key={g.id} 
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors border border-gray-100"
                >
                  <input 
                    type="checkbox"
                    checked={g.completed}
                    onChange={() => onToggleGoal(g.id)}
                    className="w-5 h-5 rounded-md border-2 border-blue-600 text-blue-600 focus:ring-0 cursor-pointer"
                  />
                  <span className={`text-sm text-gray-800 ${g.completed ? "line-through opacity-50 font-medium" : "font-semibold"}`}>
                    {g.text}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <form onSubmit={handleAdd} className="space-y-2 pt-2 border-t border-gray-100">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
              添加属于你的终极愿景
            </label>
            <div className="flex gap-2">
              <input 
                type="text"
                required
                value={newGoalText}
                onChange={(e) => setNewGoalText(e.target.value)}
                placeholder="例如：在海边买套小房子、存满10万、转行去当面包师..."
                className="flex-1 p-3 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
              />
              <button 
                type="submit"
                className={`px-4 py-3 rounded-xl text-white font-bold text-xs transition-all hover:opacity-90 active:scale-95 shrink-0 ${isMadness ? "bg-red-600" : "bg-blue-600"}`}
              >
                立下誓言
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
