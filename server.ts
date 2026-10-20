import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { analyzeCompensableFactorsWithGemini } from "./src/server/compensableFactorsService.ts";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // API routes FIRST
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.post("/api/compensable-factors/analyze", async (req, res) => {
    try {
      const context = req.body;
      if (!context || typeof context !== "object") {
        return res.status(400).json({ error: "Invalid Job Description context payload." });
      }
      const analysis = await analyzeCompensableFactorsWithGemini(context);
      return res.json(analysis);
    } catch (error: any) {
      console.error("Server error analyzing compensable factors:", error);
      return res.status(500).json({
        error: "Failed to perform compensable factor analysis",
        message: error?.message || "Unknown error",
      });
    }
  });

  // Vite middleware for development vs static serve for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
