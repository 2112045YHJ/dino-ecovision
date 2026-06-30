/// <reference types="vitest/config" />
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: "jsdom",
    globals: true,
    // Playwright E2E(e2e/**)는 vitest가 아닌 @playwright/test로 실행하므로 제외한다.
    exclude: ["e2e/**", "node_modules/**"],
  },
});
