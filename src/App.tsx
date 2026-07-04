import { useState, useEffect } from "react";
import { Identity, Task, LongTermGoal, FavoriteItem, HistoryItem } from "./types";
import { 
  DEFAULT_STUDENT_TASKS, 
  DEFAULT_WORKER_TASKS, 
  DEFAULT_STUDENT_GOALS, 
  DEFAULT_WORKER_GOALS 
} from "./data";
import { Header } from "./components/Header";
import { TabHome } from "./components/TabHome";
import { TabTools } from "./components/TabTools";
import { TabRankings } from "./components/TabRankings";
import { TabMy } from "./components/TabMy";
import {
  EnergyFieldModal,
  TribunalModal,
  FavoritesModal,
  HistoryModal,
  BeggingModal,
  TaskGoalModal,
} from "./components/Modals";

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<"home" | "tools" | "rankings" | "my">("home");

  // Core Identity & Theme
  const [identity, setIdentity] = useState<Identity>("Student");
  const [isMadness, setIsMadness] = useState<boolean>(false);

  // Profile data
  const [userName, setUserName] = useState("Alex 摸鱼大师");
  const [userTitle, setUserTitle] = useState("无情摸鱼大师");
  const [userMotto, setUserMotto] = useState("深耕于“高效休息”领域的艺术家");
  const [userHours, setUserHours] = useState(42.5);

  // Checkbox Lists (Tasks & Goals)
  const [studentTasks, setStudentTasks] = useState<Task[]>(DEFAULT_STUDENT_TASKS);
  const [workerTasks, setWorkerTasks] = useState<Task[]>(DEFAULT_WORKER_TASKS);
  const [studentGoals, setStudentGoals] = useState<LongTermGoal[]>(DEFAULT_STUDENT_GOALS);
  const [workerGoals, setWorkerGoals] = useState<LongTermGoal[]>(DEFAULT_WORKER_GOALS);

  // Cloud Persistence / Local Storage lists
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Modal display toggles
  const [isEnergyModalOpen, setIsEnergyModalOpen] = useState(false);
  const [isTribunalModalOpen, setIsTribunalModalOpen] = useState(false);
  const [isFavoritesModalOpen, setIsFavoritesModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isBeggingModalOpen, setIsBeggingModalOpen] = useState(false);
  const [isTaskGoalModalOpen, setIsTaskGoalModalOpen] = useState(false);

  // Initialize and load from local storage
  useEffect(() => {
    try {
      const storedIdentity = localStorage.getItem("dw_identity") as Identity;
      if (storedIdentity) setIdentity(storedIdentity);

      const storedMadness = localStorage.getItem("dw_madness");
      if (storedMadness) {
        const parsed = JSON.parse(storedMadness);
        setIsMadness(parsed);
        if (parsed) {
          document.documentElement.classList.add("madness-theme");
        }
      }

      const storedName = localStorage.getItem("dw_user_name");
      if (storedName) setUserName(storedName);

      const storedTitle = localStorage.getItem("dw_user_title");
      if (storedTitle) setUserTitle(storedTitle);

      const storedMotto = localStorage.getItem("dw_user_motto");
      if (storedMotto) setUserMotto(storedMotto);

      const storedHours = localStorage.getItem("dw_user_hours");
      if (storedHours) setUserHours(Number(storedHours));

      const storedStudentTasks = localStorage.getItem("dw_student_tasks");
      if (storedStudentTasks) setStudentTasks(JSON.parse(storedStudentTasks));

      const storedWorkerTasks = localStorage.getItem("dw_worker_tasks");
      if (storedWorkerTasks) setWorkerTasks(JSON.parse(storedWorkerTasks));

      const storedStudentGoals = localStorage.getItem("dw_student_goals");
      if (storedStudentGoals) setStudentGoals(JSON.parse(storedStudentGoals));

      const storedWorkerGoals = localStorage.getItem("dw_worker_goals");
      if (storedWorkerGoals) setWorkerGoals(JSON.parse(storedWorkerGoals));

      const storedFavorites = localStorage.getItem("dw_favorites");
      if (storedFavorites) setFavorites(JSON.parse(storedFavorites));

      const storedHistory = localStorage.getItem("dw_history");
      if (storedHistory) setHistory(JSON.parse(storedHistory));
    } catch (e) {
      console.error("Failed to load local storage data", e);
    }
  }, []);

  // Sync to local storage handlers
  const saveTasks = (newTasks: Task[], id: Identity) => {
    if (id === "Student") {
      setStudentTasks(newTasks);
      localStorage.setItem("dw_student_tasks", JSON.stringify(newTasks));
    } else {
      setWorkerTasks(newTasks);
      localStorage.setItem("dw_worker_tasks", JSON.stringify(newTasks));
    }
  };

  const handleIdentityChange = (newId: Identity) => {
    setIdentity(newId);
    localStorage.setItem("dw_identity", newId);
    
    // Automatically match appropriate title class if user hasn't customized it
    if (userName === "Alex 摸鱼大师" || userName === "无名牛马") {
      if (newId === "Student") {
        setUserName("Alex 摸鱼大师");
        setUserTitle("学术逃生舱员");
        setUserMotto("导师不找，绝不现身；导师一找，当场装死。");
        localStorage.setItem("dw_user_name", "Alex 摸鱼大师");
        localStorage.setItem("dw_user_title", "学术逃生舱员");
        localStorage.setItem("dw_user_motto", "导师不找，绝不现身；导师一找，当场装死。");
      } else {
        setUserName("Alex 摸鱼大师");
        setUserTitle("带薪拉屎专家");
        setUserMotto("深耕于“高效休息”领域的艺术家");
        localStorage.setItem("dw_user_name", "Alex 摸鱼大师");
        localStorage.setItem("dw_user_title", "带薪拉屎专家");
        localStorage.setItem("dw_user_motto", "深耕于“高效休息”领域的艺术家");
      }
    }
  };

  const handleToggleTask = (taskId: string) => {
    const currentTasks = identity === "Student" ? studentTasks : workerTasks;
    const updated = currentTasks.map((t) => 
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    saveTasks(updated, identity);
  };

  const handleAddTask = (text: string) => {
    const currentTasks = identity === "Student" ? studentTasks : workerTasks;
    const newTask: Task = {
      id: `task_${Date.now()}`,
      text,
      completed: false,
      isCustom: true,
    };
    const updated = [...currentTasks, newTask];
    saveTasks(updated, identity);
  };

  const handleToggleGoal = (goalId: string) => {
    const currentGoals = identity === "Student" ? studentGoals : workerGoals;
    const updated = currentGoals.map((g) => 
      g.id === goalId ? { ...g, completed: !g.completed } : g
    );
    if (identity === "Student") {
      setStudentGoals(updated);
      localStorage.setItem("dw_student_goals", JSON.stringify(updated));
    } else {
      setWorkerGoals(updated);
      localStorage.setItem("dw_worker_goals", JSON.stringify(updated));
    }
  };

  const handleAddGoal = (text: string) => {
    const currentGoals = identity === "Student" ? studentGoals : workerGoals;
    const newGoal: LongTermGoal = {
      id: `goal_${Date.now()}`,
      text,
      completed: false,
    };
    const updated = [...currentGoals, newGoal];
    if (identity === "Student") {
      setStudentGoals(updated);
      localStorage.setItem("dw_student_goals", JSON.stringify(updated));
    } else {
      setWorkerGoals(updated);
      localStorage.setItem("dw_worker_goals", JSON.stringify(updated));
    }
  };

  const handleToggleMadness = () => {
    const nextVal = !isMadness;
    setIsMadness(nextVal);
    localStorage.setItem("dw_madness", JSON.stringify(nextVal));
    if (nextVal) {
      document.documentElement.classList.add("madness-theme");
    } else {
      document.documentElement.classList.remove("madness-theme");
    }
  };

  const handleUpdateProfile = (name: string, title: string, motto: string) => {
    setUserName(name);
    setUserTitle(title);
    setUserMotto(motto);
    localStorage.setItem("dw_user_name", name);
    localStorage.setItem("dw_user_title", title);
    localStorage.setItem("dw_user_motto", motto);
  };

  const handleAddSlackingHours = (hours: number) => {
    const updated = Number((userHours + hours).toFixed(1));
    setUserHours(updated);
    localStorage.setItem("dw_user_hours", String(updated));
  };

  const handleSaveFavorite = (type: "energy" | "tribunal", title: string, subtitle: string, data: any) => {
    const newFav: FavoriteItem = {
      id: `fav_${Date.now()}`,
      type,
      title,
      subtitle,
      timestamp: Date.now(),
      data,
    };
    const updated = [newFav, ...favorites];
    setFavorites(updated);
    localStorage.setItem("dw_favorites", JSON.stringify(updated));
  };

  const handleRemoveFavorite = (id: string) => {
    const updated = favorites.filter((fav) => fav.id !== id);
    setFavorites(updated);
    localStorage.setItem("dw_favorites", JSON.stringify(updated));
  };

  const handleAddHistory = (type: "energy" | "tribunal" | "slack_session", title: string, subtitle: string, details: any) => {
    const newHistory: HistoryItem = {
      id: `hist_${Date.now()}`,
      type,
      title,
      subtitle,
      timestamp: Date.now(),
      details,
    };
    const updated = [newHistory, ...history];
    setHistory(updated);
    localStorage.setItem("dw_history", JSON.stringify(updated));
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem("dw_history");
  };

  const handleResetAllData = () => {
    localStorage.clear();
    setIdentity("Student");
    setIsMadness(false);
    document.documentElement.classList.remove("madness-theme");
    setUserName("Alex 摸鱼大师");
    setUserTitle("学术逃生舱员");
    setUserMotto("导师不找，绝不现身；导师一找，当场装死。");
    setUserHours(42.5);
    setStudentTasks(DEFAULT_STUDENT_TASKS);
    setWorkerTasks(DEFAULT_WORKER_TASKS);
    setStudentGoals(DEFAULT_STUDENT_GOALS);
    setWorkerGoals(DEFAULT_WORKER_GOALS);
    setFavorites([]);
    setHistory([]);
    setActiveTab("home");
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case "home":
        return (
          <TabHome
            identity={identity}
            setIdentity={handleIdentityChange}
            isMadness={isMadness}
            toggleMadness={handleToggleMadness}
            tasks={identity === "Student" ? studentTasks : workerTasks}
            onToggleTask={handleToggleTask}
            onAddTask={handleAddTask}
            onOpenEnergyModal={() => setIsEnergyModalOpen(true)}
            onOpenTribunalModal={() => setIsTribunalModalOpen(true)}
            onOpenTaskGoalModal={() => setIsTaskGoalModalOpen(true)}
          />
        );
      case "tools":
        return (
          <TabTools
            identity={identity}
            isMadness={isMadness}
            onOpenEnergyModal={() => setIsEnergyModalOpen(true)}
            onOpenTribunalModal={() => setIsTribunalModalOpen(true)}
            onAddSlackingHours={handleAddSlackingHours}
            onAddHistory={handleAddHistory}
          />
        );
      case "rankings":
        return (
          <TabRankings
            userHours={userHours}
            userName={userName}
            userTitle={userTitle}
            isMadness={isMadness}
          />
        );
      case "my":
        return (
          <TabMy
            userHours={userHours}
            userName={userName}
            userMotto={userMotto}
            userTitle={userTitle}
            onUpdateProfile={handleUpdateProfile}
            isMadness={isMadness}
            onOpenFavorites={() => setIsFavoritesModalOpen(true)}
            onOpenHistory={() => setIsHistoryModalOpen(true)}
            onOpenBegging={() => setIsBeggingModalOpen(true)}
            onResetData={handleResetAllData}
          />
        );
      default:
        return null;
    }
  };

  const getHeaderTitle = () => {
    if (activeTab === "tools") return "摸鱼工具箱";
    if (activeTab === "rankings") return "摸鱼大亨排行榜";
    if (activeTab === "my") return "摸鱼大师空间";
    return "Deep Work";
  };

  return (
    <div className={`min-h-screen bg-bg-base text-on-surface flex flex-col transition-colors duration-300 ${isMadness ? "bg-red-50/10" : ""}`}>
      {/* Dynamic Header */}
      <Header
        title={getHeaderTitle()}
        isMadness={isMadness}
        onHistoryClick={() => setIsHistoryModalOpen(true)}
        onFavoritesClick={() => setIsFavoritesModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 pt-20 pb-28 px-4 w-full max-w-[480px] mx-auto overflow-y-auto">
        {renderActiveTab()}
      </main>

      {/* Bottom Sticky Tab Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center py-2 pb-safe bg-white/80 backdrop-blur-xl shadow-[0_-4px_20px_rgba(31,41,55,0.05)] border-t border-gray-100 rounded-t-3xl">
        <button
          onClick={() => setActiveTab("home")}
          className={`flex flex-col items-center justify-center px-4 py-1.5 rounded-2xl active:scale-95 transition-all duration-200 cursor-pointer ${
            activeTab === "home"
              ? isMadness
                ? "bg-red-600 text-white shadow-sm"
                : "bg-blue-600 text-white shadow-sm"
              : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
          }`}
          id="nav-home"
        >
          <span className={`material-symbols-outlined text-[22px] ${activeTab === "home" && "material-fill"}`}>home</span>
          <span className="text-[10px] font-bold mt-1 tracking-wider uppercase">首页</span>
        </button>

        <button
          onClick={() => setActiveTab("tools")}
          className={`flex flex-col items-center justify-center px-4 py-1.5 rounded-2xl active:scale-95 transition-all duration-200 cursor-pointer ${
            activeTab === "tools"
              ? isMadness
                ? "bg-red-600 text-white shadow-sm"
                : "bg-blue-600 text-white shadow-sm"
              : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
          }`}
          id="nav-tools"
        >
          <span className={`material-symbols-outlined text-[22px] ${activeTab === "tools" && "material-fill"}`}>widgets</span>
          <span className="text-[10px] font-bold mt-1 tracking-wider uppercase">工具</span>
        </button>

        <button
          onClick={() => setActiveTab("rankings")}
          className={`flex flex-col items-center justify-center px-4 py-1.5 rounded-2xl active:scale-95 transition-all duration-200 cursor-pointer ${
            activeTab === "rankings"
              ? isMadness
                ? "bg-red-600 text-white shadow-sm"
                : "bg-blue-600 text-white shadow-sm"
              : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
          }`}
          id="nav-rankings"
        >
          <span className={`material-symbols-outlined text-[22px] ${activeTab === "rankings" && "material-fill"}`}>leaderboard</span>
          <span className="text-[10px] font-bold mt-1 tracking-wider uppercase">排名</span>
        </button>

        <button
          onClick={() => setActiveTab("my")}
          className={`flex flex-col items-center justify-center px-4 py-1.5 rounded-2xl active:scale-95 transition-all duration-200 cursor-pointer ${
            activeTab === "my"
              ? isMadness
                ? "bg-red-600 text-white shadow-sm"
                : "bg-blue-600 text-white shadow-sm"
              : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
          }`}
          id="nav-my"
        >
          <span className={`material-symbols-outlined text-[22px] ${activeTab === "my" && "material-fill"}`}>person</span>
          <span className="text-[10px] font-bold mt-1 tracking-wider uppercase">我的</span>
        </button>
      </nav>

      {/* Pop-up Modals Integration */}
      <EnergyFieldModal
        isOpen={isEnergyModalOpen}
        onClose={() => setIsEnergyModalOpen(false)}
        identity={identity}
        onSaveFavorite={handleSaveFavorite}
        onAddHistory={handleAddHistory}
        isMadness={isMadness}
      />

      <TribunalModal
        isOpen={isTribunalModalOpen}
        onClose={() => setIsTribunalModalOpen(false)}
        identity={identity}
        onSaveFavorite={handleSaveFavorite}
        onAddHistory={handleAddHistory}
        isMadness={isMadness}
      />

      <FavoritesModal
        isOpen={isFavoritesModalOpen}
        onClose={() => setIsFavoritesModalOpen(false)}
        favorites={favorites}
        onRemoveFavorite={handleRemoveFavorite}
        isMadness={isMadness}
      />

      <HistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        history={history}
        onClearHistory={handleClearHistory}
        isMadness={isMadness}
      />

      <BeggingModal
        isOpen={isBeggingModalOpen}
        onClose={() => setIsBeggingModalOpen(false)}
        onDonate={(gift) => handleAddHistory("slack_session", `虚拟打赏成功: ${gift}`, `向作者投喂了 ${gift}`, { gift })}
        isMadness={isMadness}
      />

      <TaskGoalModal
        isOpen={isTaskGoalModalOpen}
        onClose={() => setIsTaskGoalModalOpen(false)}
        identity={identity}
        tasks={identity === "Student" ? studentTasks : workerTasks}
        goals={identity === "Student" ? studentGoals : workerGoals}
        onToggleGoal={handleToggleGoal}
        onAddGoal={handleAddGoal}
        isMadness={isMadness}
      />
    </div>
  );
}
