import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("delta_companions.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS companions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    avatar TEXT,
    tags TEXT,
    rating REAL,
    price INTEGER,
    description TEXT,
    video_url TEXT,
    audio_url TEXT,
    role TEXT DEFAULT 'companion'
  )
`);

// Seed initial data if empty
const count = db.prepare("SELECT COUNT(*) as count FROM companions").get() as { count: number };
if (count.count === 0) {
  const insert = db.prepare(`
    INSERT INTO companions (name, avatar, tags, rating, price, description, video_url, audio_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insert.run(
    "幽灵-Ghost", 
    "https://picsum.photos/seed/ghost/200/200", 
    "狙击手,意识流,全图精通", 
    4.9, 
    50, 
    "前职业选手，擅长长距离狙击，带你体验无声暗杀。",
    "https://www.w3schools.com/html/mov_bbb.mp4",
    "https://www.w3schools.com/html/horse.ogg"
  );
  insert.run(
    "火花-Spark", 
    "https://picsum.photos/seed/spark/200/200", 
    "突击手,刚枪王,人狠话不多", 
    5.0, 
    60, 
    "暴力突击，带你横扫战场，所有资源都是你的。",
    "https://www.w3schools.com/html/mov_bbb.mp4",
    "https://www.w3schools.com/html/horse.ogg"
  );
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '50mb' }));
  const PORT = 3000;

  // API Routes
  app.get("/api/companions", (req, res) => {
    const companions = db.prepare("SELECT * FROM companions").all();
    res.json(companions);
  });

  app.get("/api/companions/:id", (req, res) => {
    const companion = db.prepare("SELECT * FROM companions WHERE id = ?").get(req.params.id);
    res.json(companion);
  });

  app.post("/api/companions/:id", (req, res) => {
    const { name, description, tags, price, video_url, audio_url } = req.body;
    const update = db.prepare(`
      UPDATE companions 
      SET name = ?, description = ?, tags = ?, price = ?, video_url = ?, audio_url = ?
      WHERE id = ?
    `);
    update.run(name, description, tags, price, video_url, audio_url, req.params.id);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
