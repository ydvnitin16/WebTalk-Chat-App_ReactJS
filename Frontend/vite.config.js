import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
    base: "/",
    plugins: [
        react(),
        tailwindcss(),
        VitePWA({
            registerType: "autoUpdate",
            manifest: {
                name: "SendX",
                short_name: "SendX",
                display: "standalone",
                theme_color: "#0f0f0f",
                icons: [
                    {
                        src: "/favicon.png",
                        sizes: "192x192",
                        type: "image/png",
                    },
                    {
                        src: "/favicon.png",
                        sizes: "512x512",
                        type: "image/png",
                    },
                ],
            },
        }),
    ],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    server: {
        host: true,
    },
});
