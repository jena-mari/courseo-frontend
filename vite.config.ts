import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import fs from "node:fs/promises";
import path from "node:path";

function localGeminiKeySettings() {
  return {
    name: "courseo-local-gemini-key-settings",
    configureServer(server: { middlewares: { use: (handler: (req: any, res: any, next: () => void) => void) => void } }) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url !== "/api/local/gemini-key" || req.method !== "PUT") return next();

        try {
          let body = "";
          for await (const chunk of req) body += chunk;
          const apiKey = String(JSON.parse(body).apiKey ?? "").trim();
          if (!apiKey || /[\r\n]/.test(apiKey)) {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            return res.end(JSON.stringify({ detail: "Enter a Gemini API key on a single line." }));
          }

          const envPath = path.resolve(process.cwd(), "../intelli-study-planner-brain/.env");
          let contents = "";
          try { contents = await fs.readFile(envPath, "utf8"); } catch (error: any) {
            if (error?.code !== "ENOENT") throw error;
          }
          const entry = `GEMINI_API_KEY=${apiKey}`;
          contents = /^GEMINI_API_KEY=.*$/m.test(contents)
            ? contents.replace(/^GEMINI_API_KEY=.*$/m, entry)
            : `${contents}${contents && !contents.endsWith("\n") ? "\n" : ""}${entry}\n`;
          await fs.writeFile(envPath, contents, { mode: 0o600 });
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ saved: true, restart_required: false }));
        } catch (error) {
          const message = error instanceof Error ? error.message : "Unknown local configuration error";
          server.config.logger.error(`[Gemini key settings] ${message}`);
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({
            detail: `Could not update the brain service .env file: ${message}`,
          }));
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [localGeminiKeySettings(), react(), tailwindcss()],
  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:7777",
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: [{ find: "@", replacement: "/src" }],
  },
});
