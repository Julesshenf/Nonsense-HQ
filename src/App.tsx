import { useState, useEffect, useRef } from "react";
import { Identity, FavoriteItem, HistoryItem, PlayerAccount } from "./types";
import { Header } from "./components/Header";
import { TabTools } from "./components/TabTools";
import { TabRankings } from "./components/TabRankings";
import { TabMy } from "./components/TabMy";
import { LoginModal } from "./components/LoginModal";
import {
  EnergyFieldModal,
  TribunalModal,
  FavoritesModal,
  HistoryModal,
  BeggingModal,
} from "./components/Modals";

const getStoredAccount = (): PlayerAccount | null => {
  try {
    const raw = localStorage.getItem("dw_account_profile");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const isNightTime = () => {
  const hour = new Date().getHours();
  return hour < 6 || hour >= 18;
};

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<"tools" | "rankings" | "my">("tools");

  // Core Identity & Theme
  const [identity, setIdentity] = useState<Identity>("Student");
  const [isMadness, setIsMadness] = useState<boolean>(false);
  const [automaticIsNight, setAutomaticIsNight] = useState(isNightTime);
  const [manualIsNight, setManualIsNight] = useState<boolean | null>(null);
  const previousAutomaticTheme = useRef(automaticIsNight);
  const isNight = manualIsNight ?? automaticIsNight;

  // Profile data
  const [userName, setUserName] = useState("Alex 摸鱼大师");
  const [userTitle, setUserTitle] = useState("无情摸鱼大师");
  const [userMotto, setUserMotto] = useState("深耕于“高效休息”领域的艺术家");
  const [userHours, setUserHours] = useState(42.5);
  const [currentAccount, setCurrentAccount] = useState<PlayerAccount | null>(() => getStoredAccount());
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(() => !getStoredAccount());

  // Cloud Persistence / Local Storage lists
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Modal display toggles
  const [isEnergyModalOpen, setIsEnergyModalOpen] = useState(false);
  const [isTribunalModalOpen, setIsTribunalModalOpen] = useState(false);
  const [isFavoritesModalOpen, setIsFavoritesModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isBeggingModalOpen, setIsBeggingModalOpen] = useState(false);

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

      const storedFavorites = localStorage.getItem("dw_favorites");
      if (storedFavorites) setFavorites(JSON.parse(storedFavorites));

      const storedHistory = localStorage.getItem("dw_history");
      if (storedHistory) setHistory(JSON.parse(storedHistory));

      const storedAccount = getStoredAccount();
      if (storedAccount) {
        setCurrentAccount(storedAccount);
        setUserName(storedAccount.name);
        setUserTitle(storedAccount.title || "新晋摸鱼玩家");
        setUserMotto(storedAccount.motto);
        setIsLoginModalOpen(false);
      }
    } catch (e) {
      console.error("Failed to load local storage data", e);
    }
  }, []);

  useEffect(() => {
    const updateThemeByTime = () => setAutomaticIsNight(isNightTime());
    const timer = window.setInterval(updateThemeByTime, 60_000);

    updateThemeByTime();
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (previousAutomaticTheme.current !== automaticIsNight) {
      previousAutomaticTheme.current = automaticIsNight;
      setManualIsNight(null);
    }
  }, [automaticIsNight]);

  useEffect(() => {
    document.documentElement.classList.toggle("night-theme", isNight);
    return () => document.documentElement.classList.remove("night-theme");
  }, [isNight]);

  const handleThemeToggle = () => {
    setManualIsNight((currentTheme) => !(currentTheme ?? automaticIsNight));
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

  const handleIdentityChange = (nextIdentity: Identity) => {
    setIdentity(nextIdentity);
    localStorage.setItem("dw_identity", nextIdentity);
  };

  const handleAuthenticated = (account: PlayerAccount) => {
    setCurrentAccount(account);
    setUserName(account.name);
    setUserTitle(account.title || "新晋摸鱼玩家");
    setUserMotto(account.motto);
    localStorage.setItem("dw_account_profile", JSON.stringify(account));
    localStorage.setItem("dw_current_account", account.name);
    localStorage.setItem("dw_user_name", account.name);
    localStorage.setItem("dw_user_title", account.title || "新晋摸鱼玩家");
    localStorage.setItem("dw_user_motto", account.motto);
    setIsLoginModalOpen(false);
  };

  const handleUpdateProfile = async (name: string, title: string, motto: string, password?: string) => {
    setUserName(name);
    setUserTitle(title);
    setUserMotto(motto);
    localStorage.setItem("dw_user_name", name);
    localStorage.setItem("dw_user_title", title);
    localStorage.setItem("dw_user_motto", motto);

    if (!currentAccount) return;

    try {
      const response = await fetch(`/api/accounts/${encodeURIComponent(currentAccount.name)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, title, motto, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to update account");
      setCurrentAccount(data.account);
      localStorage.setItem("dw_account_profile", JSON.stringify(data.account));
      localStorage.setItem("dw_current_account", data.account.name);
    } catch (error) {
      console.error("Failed to sync account profile", error);
    }
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

  const handleLogout = () => {
    localStorage.removeItem("dw_account_profile");
    localStorage.removeItem("dw_current_account");
    setCurrentAccount(null);
    setIsLoginModalOpen(true);
  };

  const handleDeleteAccount = async () => {
    const accountToDelete = currentAccount?.name;
    if (accountToDelete) {
      try {
        const response = await fetch(`/api/accounts/${encodeURIComponent(accountToDelete)}`, {
          method: "DELETE",
        });
        if (!response.ok && response.status !== 404) {
          const data = await response.json();
          throw new Error(data.error || "Failed to delete account");
        }
      } catch (error) {
        console.error("Failed to delete account", error);
        alert("注销账号失败，绝对不是套路，请稍后再试。");
        return;
      }
    }

    localStorage.clear();
    setCurrentAccount(null);
    setIsLoginModalOpen(true);
    setIdentity("Student");
    setIsMadness(false);
    document.documentElement.classList.remove("madness-theme");
    setUserName("Alex 摸鱼大师");
    setUserTitle("学术逃生舱员");
    setUserMotto("导师不找，绝不现身；导师一找，当场装死。");
    setUserHours(42.5);
    setFavorites([]);
    setHistory([]);
    setActiveTab("tools");
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case "tools":
        return (
          <TabTools
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
            identity={identity}
            onIdentityChange={handleIdentityChange}
            userHours={userHours}
            userName={userName}
            userMotto={userMotto}
            userTitle={userTitle}
            onUpdateProfile={handleUpdateProfile}
            isMadness={isMadness}
            onOpenFavorites={() => setIsFavoritesModalOpen(true)}
            onOpenHistory={() => setIsHistoryModalOpen(true)}
            onOpenBegging={() => setIsBeggingModalOpen(true)}
            onLogout={handleLogout}
            onDeleteAccount={handleDeleteAccount}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen bg-bg-base text-on-surface flex flex-col transition-colors duration-300 ${isNight ? "night-theme" : ""} ${isMadness ? "bg-red-50/10" : ""}`}>
      {/* Dynamic Header */}
      <Header
        isMadness={isMadness}
        activeTab={activeTab}
        onMyClick={() => setActiveTab((currentTab) => currentTab === "my" ? "tools" : "my")}
        onRankingsClick={() => setActiveTab("rankings")}
        onThemeToggle={handleThemeToggle}
      />

      {/* Main Container */}
      <main className="flex-1 pt-20 pb-8 px-4 w-full max-w-[480px] mx-auto overflow-y-auto md:max-w-none md:px-8 lg:px-10">
        {renderActiveTab()}
      </main>

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

      <LoginModal
        isOpen={isLoginModalOpen}
        isMadness={isMadness}
        onAuthenticated={handleAuthenticated}
      />
    </div>
  );
}
