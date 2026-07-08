import express from "express";
import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;
const DATA_DIR = path.join(process.cwd(), "data");
const ACCOUNTS_FILE = path.join(DATA_DIR, "accounts.json");

interface PlayerAccount {
  name: string;
  passwordHash: string;
  motto: string;
  title?: string;
  createdAt: number;
  updatedAt: number;
}

async function ensureAccountsFile() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(ACCOUNTS_FILE);
  } catch {
    await fs.writeFile(ACCOUNTS_FILE, "[]\n", "utf-8");
  }
}

async function readAccounts(): Promise<PlayerAccount[]> {
  await ensureAccountsFile();
  const raw = await fs.readFile(ACCOUNTS_FILE, "utf-8");
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeAccounts(accounts: PlayerAccount[]) {
  await ensureAccountsFile();
  await fs.writeFile(ACCOUNTS_FILE, `${JSON.stringify(accounts, null, 2)}\n`, "utf-8");
}

function publicAccount(account: PlayerAccount) {
  return {
    name: account.name,
    motto: account.motto,
    title: account.title,
    createdAt: account.createdAt,
    updatedAt: account.updatedAt,
  };
}

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function hashPassword(password: string) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

// Lazy initialize Gemini client safely
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not defined. AI features will fail until a key is added.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "MOCK_KEY_PLACEHOLDER",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

app.get("/api/accounts/check", async (req, res) => {
  try {
    const name = normalizeText(req.query.name);
    const password = normalizeText(req.query.password);
    if (!name) {
      return res.status(400).json({ error: "名称不能为空" });
    }

    const accounts = await readAccounts();
    const account = accounts.find((account) => account.name === name);
    res.json({
      exists: Boolean(account),
      passwordMatches: Boolean(account && password && account.passwordHash === hashPassword(password)),
    });
  } catch (error: any) {
    console.error("Error in /api/accounts/check:", error);
    res.status(500).json({ error: "账号检查失败", details: error.message });
  }
});

app.post("/api/accounts/register", async (req, res) => {
  try {
    const name = normalizeText(req.body.name);
    const password = normalizeText(req.body.password);
    const motto = normalizeText(req.body.motto);

    if (!name || !password) {
      return res.status(400).json({ error: "请填写名称和密码" });
    }

    const accounts = await readAccounts();
    if (accounts.some((account) => account.name === name)) {
      return res.status(409).json({ error: "这个名称已经注册过了" });
    }

    const now = Date.now();
    const account: PlayerAccount = {
      name,
      passwordHash: hashPassword(password),
      motto,
      title: "新晋摸鱼玩家",
      createdAt: now,
      updatedAt: now,
    };

    accounts.push(account);
    await writeAccounts(accounts);
    res.status(201).json({ account: publicAccount(account) });
  } catch (error: any) {
    console.error("Error in /api/accounts/register:", error);
    res.status(500).json({ error: "注册失败", details: error.message });
  }
});

app.post("/api/accounts/login", async (req, res) => {
  try {
    const name = normalizeText(req.body.name);
    const password = normalizeText(req.body.password);
    const motto = normalizeText(req.body.motto);

    if (!name || !password) {
      return res.status(400).json({ error: "请填写名称和密码" });
    }

    const accounts = await readAccounts();
    const accountIndex = accounts.findIndex((account) => account.name === name);
    if (accountIndex === -1) {
      return res.status(404).json({ error: "这个账号还没有注册" });
    }

    if (accounts[accountIndex].passwordHash !== hashPassword(password)) {
      return res.status(401).json({ error: "密码不正确" });
    }

    accounts[accountIndex] = {
      ...accounts[accountIndex],
      motto: motto || accounts[accountIndex].motto,
      updatedAt: Date.now(),
    };
    await writeAccounts(accounts);

    res.json({ account: publicAccount(accounts[accountIndex]) });
  } catch (error: any) {
    console.error("Error in /api/accounts/login:", error);
    res.status(500).json({ error: "登录失败", details: error.message });
  }
});

app.put("/api/accounts/:name", async (req, res) => {
  try {
    const currentName = normalizeText(req.params.name);
    const nextName = normalizeText(req.body.name);
    const motto = normalizeText(req.body.motto);
    const title = normalizeText(req.body.title);
    const password = normalizeText(req.body.password);

    if (!currentName || !nextName) {
      return res.status(400).json({ error: "请填写名称" });
    }

    const accounts = await readAccounts();
    const accountIndex = accounts.findIndex((account) => account.name === currentName);
    if (accountIndex === -1) {
      return res.status(404).json({ error: "账号不存在" });
    }

    const nameTaken = accounts.some((account, index) => index !== accountIndex && account.name === nextName);
    if (nameTaken) {
      return res.status(409).json({ error: "这个名称已经注册过了" });
    }

    accounts[accountIndex] = {
      ...accounts[accountIndex],
      name: nextName,
      motto,
      title: title || accounts[accountIndex].title,
      passwordHash: password ? hashPassword(password) : accounts[accountIndex].passwordHash,
      updatedAt: Date.now(),
    };

    await writeAccounts(accounts);
    res.json({ account: publicAccount(accounts[accountIndex]) });
  } catch (error: any) {
    console.error("Error in /api/accounts/:name:", error);
    res.status(500).json({ error: "资料更新失败", details: error.message });
  }
});

app.delete("/api/accounts/:name", async (req, res) => {
  try {
    const name = normalizeText(req.params.name);
    if (!name) {
      return res.status(400).json({ error: "名称不能为空" });
    }

    const accounts = await readAccounts();
    const nextAccounts = accounts.filter((account) => account.name !== name);
    if (nextAccounts.length === accounts.length) {
      return res.status(404).json({ error: "账号不存在" });
    }

    await writeAccounts(nextAccounts);
    res.json({ ok: true });
  } catch (error: any) {
    console.error("Error in DELETE /api/accounts/:name:", error);
    res.status(500).json({ error: "注销账号失败", details: error.message });
  }
});

// 1. Boss / Teacher Energy Field Analysis Endpoint
app.post("/api/energy-field", async (req, res) => {
  try {
    const { identity, quote, vibe } = req.body;
    if (!quote || !vibe) {
      return res.status(400).json({ error: "Missing required fields: quote and vibe" });
    }

    const ai = getGeminiClient();
    
    const prompt = `Analyze the "energy field" and subtext of a spoken statement from a ${identity === "Student" ? "Teacher / Academic Advisor" : "Boss / Corporate Manager"}.
Statement: "${quote}"
Observed Vibe/Behavior: "${vibe}"

Analyze this thoroughly but with a highly relatable, sharp, humorous, and slightly satirical tone matching the "cow and horse" (牛马) demographic of stressed workers and students. Decipher what they *actually* mean, calculate the danger level, and give slacking (摸鱼) tips.
Please output strictly in the requested JSON structure.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an expert slacking consultant and humorous workplace/academic advisor. You speak fluent Chinese, incorporating popular Chinese workplace/school slang (e.g. 牛马, 摸鱼, 薪水小偷, 画饼, 卷). Return highly structured, engaging responses.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            fieldType: { type: Type.STRING, description: "Humorous, exaggerated name of the boss/teacher's energy field (e.g., '无缝压榨防御结界', 'PPT终极画饼风暴')" },
            threatLevel: { type: Type.INTEGER, description: "Danger/Threat level for the worker/student from 0 to 100" },
            vibeRating: { type: Type.STRING, description: "A witty, sarcastic summary rating of their actual mood/vibe" },
            translation: { type: Type.STRING, description: "The cynical, real translation of what they actually mean (what lies behind their words)" },
            survivalGuide: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3 highly actionable, hilarious tips to survive this wave of energy (how to answer, how to pretend to be busy, or how to safely slack off)"
            },
            slackingRisk: { type: Type.STRING, description: "A funny, dramatic advisory or prediction on what happens if you attempt to slack off right now" }
          },
          required: ["fieldType", "threatLevel", "vibeRating", "translation", "survivalGuide", "slackingRisk"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("No response text returned from Gemini API");
    }

    const data = JSON.parse(resultText);
    res.json(data);
  } catch (error: any) {
    console.error("Error in /api/energy-field:", error);
    res.status(500).json({ 
      error: "AI analysis failed", 
      details: error.message,
      mockData: {
        fieldType: "量子幻象画饼结界",
        threatLevel: 88,
        vibeRating: "表面和蔼，内心急躁，KPI饥渴症晚期",
        translation: "不要以为你今天能准时下班，还有三个PPT等着你重做，但我假装在征求你的意见。",
        survivalGuide: [
          "立刻在桌上放一杯冒热气的热水，起身边走边捏太阳穴，营造出脑力耗尽的劳碌感。",
          "回复消息时加入‘收到！正全力推进中！’，即便你只是建了个文件夹。",
          "把IDE或Excel表格放大到全屏，遇到询问就皱眉叹气，表现出被技术难题困扰的崇高感。"
        ],
        slackingRisk: "此时摸鱼一旦被抓，可能会被委任为‘周报格式优化总监’，请务必保持谨慎！"
      }
    });
  }
});

// 2. Small Things Tribunal (小事审判庭) Endpoint
app.post("/api/tribunal", async (req, res) => {
  try {
    const { incident, identity } = req.body;
    if (!incident) {
      return res.status(400).json({ error: "Missing required field: incident" });
    }

    const ai = getGeminiClient();

    const prompt = `Act as the Supreme Judge of the "Small Things Tribunal" (小事审判庭), a court dedicated to rendering majestic, hilarious, and dramatically over-the-top justice for the trivial, annoying incidents of daily school and office grind.
Incident: "${incident}"
Complainant Identity: "${identity}"

Judge this incident with extreme theatrical grandeur. Declare the offender guilty, name their bizarre crime, render a hilarious sentence/punishment, and give an emotional soothing score. 
Please output strictly in the requested JSON structure.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are the Dramatic Supreme Judge of the Small Things Tribunal. You speak majestic, hilarious, classical-meets-modern Chinese courtroom jargon. You sentence offenders to absurd, satisfyingly cruel modern punishments (e.g., debugging raw binary with a quill pen, listening to elevator jazz for 72 hours, writing PPT slide transitions with scissors).",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            caseName: { type: Type.STRING, description: "Grand, theatrical legal title of the case (e.g., '冷藏室牛奶不翼而飞重大侵害案', '微信群已阅不回特大冷漠罪')" },
            defendant: { type: Type.STRING, description: "Who or what is the defendant (e.g., '不知名的冷藏室盗贼', '微信群里假装没看见的群成员')" },
            crime: { type: Type.STRING, description: "The exaggerated crime description using dramatic legal-satirical words" },
            verdict: { type: Type.STRING, description: "The grand guilty declaration and general indictment" },
            sentence: { type: Type.STRING, description: "A highly creative, custom-designed, hilarious and absurd punishment for the offender" },
            catharsisIndex: { type: Type.INTEGER, description: "Emotional healing/catharsis rating for the user, from 0 to 100" },
            judgeNotes: { type: Type.STRING, description: "A concluding, dramatic quote, blessing, or word of supreme wisdom from the Judge" }
          },
          required: ["caseName", "defendant", "crime", "verdict", "sentence", "catharsisIndex", "judgeNotes"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("No response text returned from Gemini API");
    }

    const data = JSON.parse(resultText);
    res.json(data);
  } catch (error: any) {
    console.error("Error in /api/tribunal:", error);
    res.status(500).json({
      error: "Tribunal setup failed",
      details: error.message,
      mockData: {
        caseName: "茶水间极寒之地奶源侵害特大悬案",
        defendant: "代号‘茶水间闪电手’的未知嫌疑人",
        crime: "肆意践踏私人财产安全罪、引发午后咖啡无奶化人道主义危机罪",
        verdict: "证据确凿，虽无法定位具体嫌疑人，但其贪婪行径已严重扰乱打工人心灵秩序，宣判被告构成一级茶水间重罪！",
        sentence: "罚该被告在接下来的两周内，每次冲泡咖啡都只能买到保质期还有10分钟的脱脂酸牛奶，且所有外卖均被配送员延迟30分钟送达！",
        catharsisIndex: 95,
        judgeNotes: "正义虽迟但到，愿温热的咖啡终能配上属于你的全脂厚乳。退庭！"
      }
    });
  }
});

// Serve frontend with Vite middleware in dev or static files in prod
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Deep Work server running on http://localhost:${PORT}`);
  });
}

startServer();
