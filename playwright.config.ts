import { defineConfig } from "@playwright/test";

const baseURL = process.env.SMOKE_BASE_URL ?? "http://localhost:3000";

export default defineConfig({
    testDir: "./tests",
    fullyParallel: false,
    retries: 1,
    use: {
        baseURL,
        trace: "on-first-retry",
    },
    reporter: [["list"], ["html", { open: "never" }]],
});
