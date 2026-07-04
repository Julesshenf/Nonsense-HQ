import React, { useState } from "react";
import { SLACK_TITLES, MOCK_LEADERBOARD } from "../data";

interface TabRankingsProps {
  userHours: number;
  userName: string;
  userTitle: string;
  isMadness: boolean;
}

export const TabRankings: React.FC<TabRankingsProps> = ({
  userHours,
  userName,
  userTitle,
  isMadness,
}) => {
  const [submissionFeedback, setSubmissionFeedback] = useState<string | null>(null);

  // Combine user's real stats with mock entries dynamically and sort them by hours!
  const getSortedLeaderboard = () => {
    const list = [...MOCK_LEADERBOARD];
    // Find if current user is represented, overwrite with actual real states
    const index = list.findIndex((item) => item.isCurrentUser);
    if (index !== -1) {
      list[index] = {
        name: userName || "Alex 摸鱼大师",
        title: userTitle || "无情摸鱼大师",
        hours: userHours,
        isCurrentUser: true,
      };
    }
    // Sort descending by hours
    return list.sort((a, b) => b.hours - a.hours);
  };

  const sortedList = getSortedLeaderboard();
  const userRank = sortedList.findIndex((item) => item.isCurrentUser) + 1;

  const handleSubmitScore = () => {
    const funnyMessages = [
      `委员会鉴定：你在“带薪拉屎”及“假装思考”方面的突出成就已录入牛马名人堂！特此通报表彰！`,
      `惊心动魄！摸鱼统计局核准：你在不惊动任何传感器的情况下成功耗费 ${userHours}小时，堪称深海幽灵！`,
      `经过量子风控委员会审核：当前摸鱼时间健康，离被HR谈话还有23h安全边际，请加大渗透深度！`,
      `导师已将你标记为：‘该生整天在工位上，却完全不知道在忙什么’神秘等级SS。恭喜继续稳居风云榜！`
    ];
    setSubmissionFeedback(funnyMessages[Math.floor(Math.random() * funnyMessages.length)]);
    setTimeout(() => setSubmissionFeedback(null), 6000);
  };

  const getMedalColor = (rank: number) => {
    if (rank === 1) return "bg-amber-100 text-amber-700 border-amber-200";
    if (rank === 2) return "bg-slate-100 text-slate-700 border-slate-200";
    if (rank === 3) return "bg-orange-100 text-orange-700 border-orange-200";
    return "bg-gray-100 text-gray-500 border-gray-100";
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Dynamic Summary Plate */}
      <section className="glass-card rounded-3xl p-5 shadow-sm border border-gray-100 flex items-center gap-4 relative overflow-hidden">
        <div className={`absolute right-0 bottom-0 translate-x-1/3 translate-y-1/3 w-28 h-28 rounded-full blur-3xl opacity-20 ${isMadness ? "bg-red-500" : "bg-blue-500"}`}></div>
        
        <span className="material-symbols-outlined text-4xl text-yellow-500 animate-bounce shrink-0">
          emoji_events
        </span>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-gray-800">
            我的摸鱼战绩: 第 <span className={`text-lg font-black ${isMadness ? "text-red-600" : "text-blue-600"}`}>{userRank}</span> 名
          </h4>
          <p className="text-xs text-gray-500 mt-1">
            累计带薪摸鱼时间 <strong className="text-gray-800">{userHours}h</strong>，领跑全省 {98 - userRank * 3}% 的牛马。
          </p>
        </div>
      </section>

      {/* Submission Feedback Banner */}
      {submissionFeedback && (
        <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-2xl text-xs text-yellow-800 font-bold leading-relaxed text-center animate-fade-in">
          {submissionFeedback}
        </div>
      )}

      {/* Leaderboard Table */}
      <section className="glass-card rounded-3xl p-5 shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base font-bold text-gray-800 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-yellow-500">leaderboard</span>
            牛马/学术摸鱼风云排行榜
          </h3>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-sans">
            DAILY RANKING
          </span>
        </div>

        <div className="space-y-2.5">
          {sortedList.map((row, idx) => {
            const rank = idx + 1;
            return (
              <div
                key={row.name}
                className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
                  row.isCurrentUser
                    ? isMadness
                      ? "bg-red-50 border-red-200"
                      : "bg-blue-50 border-blue-200"
                    : "bg-white/50 border-gray-100 hover:bg-white"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Rank badge */}
                  <span className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-black shrink-0 ${getMedalColor(rank)}`}>
                    {rank}
                  </span>

                  <div className="min-w-0">
                    <span className={`text-xs font-bold text-gray-800 truncate block ${row.isCurrentUser && "font-extrabold"}`}>
                      {row.name} {row.isCurrentUser && " (你)"}
                    </span>
                    <span className="text-[10px] text-gray-400 block mt-0.5">{row.title}</span>
                  </div>
                </div>

                <div className="text-right shrink-0 ml-2">
                  <span className={`text-sm font-black ${row.isCurrentUser ? "text-orange-600" : "text-gray-700"}`}>
                    {row.hours} <span className="text-[10px] font-semibold text-gray-400">小时</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Button to Submit daily results */}
      <button
        onClick={handleSubmitScore}
        className={`w-full py-4 rounded-xl text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 ${
          isMadness ? "bg-red-600 shadow-red-100" : "bg-blue-600 shadow-blue-100"
        }`}
      >
        <span className="material-symbols-outlined text-base">cloud_upload</span>
        同步并上报今日摸鱼数据
      </button>

      <div className="text-center">
        <p className="text-[10px] text-gray-400 leading-relaxed max-w-xs mx-auto">
          🔒 本榜单已经量子多重哈希匿名加密，绝不会向您的顶头上司、学术导师或任何HR披露。祝摸鱼愉快！
        </p>
      </div>
    </div>
  );
};
