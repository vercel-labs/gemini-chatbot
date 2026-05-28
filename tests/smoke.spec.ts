import { expect, test } from "@playwright/test";

test.describe("Smoke", () => {
    test("home page responds", async ({ page }) => {
        const res = await page.goto("/");
        expect(res?.ok()).toBeTruthy();
    });

    // test("login page responds", async ({ page }) => {
    //     const res = await page.goto("/login");
    //     expect(res?.ok()).toBeTruthy();
    // });

    // test("chat api rejects unauthenticated user", async ({ request }) => {
    //     const res = await request.post("/api/chat", {
    //         data: {
    //             id: "smoke-test-chat",
    //             messages: [{ role: "user", content: "hello" }],
    //         },
    //     });

    //     expect(res.status()).toBe(401);
    // });

    // test("onboarding chat api rejects unauthenticated user", async ({ request }) => {
    //     const res = await request.post("/onboarding/api/chat", {
    //         data: {
    //             id: "smoke-test-onboarding",
    //             sessionId: "00000000-0000-0000-0000-000000000000",
    //             messages: [{ role: "user", content: "start onboarding" }],
    //         },
    //     });

    //     expect([401, 403, 404]).toContain(res.status());
    // });
});
