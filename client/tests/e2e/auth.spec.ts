import { test, expect } from "@playwright/test";
import { mockApi, mockAuthUser } from "./mockApi";

test("header shows a login link when logged out", async ({ page }) => {
  await mockApi(page);
  await page.goto("/");
  await expect(page.getByRole("link", { name: "Log in" })).toBeVisible();
});

test("login form rejects an invalid email and a wrong password", async ({ page }) => {
  await mockApi(page);
  await page.goto("/login");

  await page.locator("#login-email").fill("not-an-email");
  await page.locator("#login-password").fill("something");
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page.getByText(/enter a valid email address/i)).toBeVisible();

  await page.locator("#login-email").fill(mockAuthUser.email);
  await page.locator("#login-password").fill("wrong-password");
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page.getByText(/incorrect email or password/i)).toBeVisible();
});

test("logging in updates the header and logging out reverts it", async ({ page }) => {
  await mockApi(page);
  await page.goto("/login");

  await page.locator("#login-email").fill(mockAuthUser.email);
  await page.locator("#login-password").fill("correctH0rse1");
  await page.getByRole("button", { name: "Log in" }).click();

  await expect(page).toHaveURL("/");
  await expect(page.getByText(`Hi, ${mockAuthUser.name.split(" ")[0]}`)).toBeVisible();

  await page.getByRole("button", { name: "Log out" }).click();
  await expect(page.getByRole("link", { name: "Log in" })).toBeVisible();
});

test("register form validates a weak password before submitting", async ({ page }) => {
  await mockApi(page);
  await page.goto("/register");

  await page.locator("#register-name").fill("Asha Rao");
  await page.locator("#register-email").fill("asha@example.com");
  await page.locator("#register-password").fill("weak");
  await page.getByRole("button", { name: "Create account" }).click();

  await expect(page.getByText(/password must be at least 8 characters/i)).toBeVisible();
});

test("register succeeds and logs the user in", async ({ page }) => {
  await mockApi(page);
  await page.goto("/register");

  await page.locator("#register-name").fill(mockAuthUser.name);
  await page.locator("#register-email").fill(mockAuthUser.email);
  await page.locator("#register-password").fill("correctH0rse1");
  await page.getByRole("button", { name: "Create account" }).click();

  await expect(page).toHaveURL("/");
  await expect(page.getByText(`Hi, ${mockAuthUser.name.split(" ")[0]}`)).toBeVisible();
});

test("forgot password shows a generic confirmation regardless of the email", async ({ page }) => {
  await mockApi(page);
  await page.goto("/forgot-password");

  await page.locator("#forgot-email").fill("unknown@example.com");
  await page.getByRole("button", { name: "Send reset link" }).click();

  await expect(page.getByText(/check your email/i)).toBeVisible();
});

test("reset password without a token shows an error instead of a form", async ({ page }) => {
  await mockApi(page);
  await page.goto("/reset-password");
  await expect(page.getByText(/missing a reset token/i)).toBeVisible();
});

test("reset password with a token submits successfully", async ({ page }) => {
  await mockApi(page);
  await page.goto("/reset-password?token=abc123");

  await page.getByLabel("New password").fill("correctH0rse1");
  await page.getByRole("button", { name: "Set password" }).click();

  await expect(page).toHaveURL("/");
});

test("verify email page confirms a valid token", async ({ page }) => {
  await mockApi(page);
  await page.goto("/verify-email?token=abc123");
  await expect(page.getByRole("heading", { name: /email verified/i })).toBeVisible();
});

test("verify email page shows an error without a token", async ({ page }) => {
  await mockApi(page);
  await page.goto("/verify-email");
  await expect(page.getByRole("heading", { name: /verification failed/i })).toBeVisible();
});
