import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";

// #region agent log
fetch("http://127.0.0.1:7242/ingest/9681846e-5185-4c8d-b254-1ffe62866ff5", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
        location: "vite.config.js",
        message: "Vite config loaded",
        data: { nodeEnv: process.env.NODE_ENV, base: "/", file: "Frontend/vite.config.js" },
        timestamp: Date.now(),
    }),
}).catch(() => {});
// #endregion

// https://vite.dev/config/
export default defineConfig({
    base: "/",
    plugins: [react(), tailwindcss()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    server: {
        host: true,
    },
});
