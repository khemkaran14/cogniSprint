import type { Page } from "@playwright/test";

const productId = "prod_1";

export const mockProduct = {
  _id: productId,
  slug: "cognisprint-complete",
  name: "CogniSprint Complete Brain Training Program",
  shortName: "CogniSprint Complete",
  tagline: "365 days of guided and structured brain-training practice.",
  description: "A full 12-month program.",
  productType: "bundle",
  accessDuration: "lifetime",
  status: "active",
  includes: [
    { key: "workbook", label: "Downloadable workbook (PDF)", enabled: true },
    { key: "certificate", label: "Completion certificate", enabled: true },
  ],
  price: {
    _id: "price_1",
    productId,
    currency: "INR",
    regularAmount: 249900,
    launchAmount: 99900,
    active: true,
  },
};

export const mockModules = Array.from({ length: 3 }).map((_, i) => ({
  _id: `mod_${i + 1}`,
  position: i + 1,
  slug: `module-${i + 1}`,
  title: `Module ${i + 1}`,
  description: `Description for module ${i + 1}.`,
  skills: ["mental-math"],
  lessonCount: 10,
  exerciseCount: 100,
  difficulty: "beginner",
  estimatedMinutes: 60,
  previewAvailable: true,
  phase: "guided_learning",
}));

export const mockFaq = [
  { _id: "faq_1", category: "general", question: "How much time does this take each day?", answer: "About 15 minutes." },
  { _id: "faq_2", category: "purchase", question: "Is payment secure?", answer: "Yes, via Razorpay." },
];

export const mockBlogArticle = {
  _id: "blog_1",
  slug: "mental-math-exercises-for-adults",
  title: "7 Mental Math Exercises That Actually Help Adults",
  description: "Practical mental math exercises for adults.",
  category: "Mental Math",
  author: "CogniSprint Team",
  publishedAt: "2026-05-12T00:00:00.000Z",
  updatedAt2: "2026-06-30T00:00:00.000Z",
  readingTimeMinutes: 7,
  coverImage: "/images/blog/mental-math-adults.svg",
  sections: [{ heading: "Why mental math still matters", paragraphs: ["Some useful paragraph text."] }],
};

export const mockAuthUser = {
  id: "user_1",
  name: "Asha Rao",
  email: "asha@example.com",
  role: "student" as const,
  emailVerified: true,
};

export async function mockApi(page: Page) {
  await page.route("**/api/products", (route) => route.fulfill({ json: [mockProduct] }));
  await page.route("**/api/products/cognisprint-complete", (route) => route.fulfill({ json: mockProduct }));
  await page.route("**/api/curriculum", (route) => route.fulfill({ json: mockModules }));
  await page.route(/\/api\/faq(\?.*)?$/, (route) => route.fulfill({ json: mockFaq }));
  await page.route("**/api/blog", (route) => route.fulfill({ json: [mockBlogArticle] }));
  await page.route(`**/api/blog/${mockBlogArticle.slug}`, (route) => route.fulfill({ json: mockBlogArticle }));
  await page.route("**/api/newsletter", (route) => route.fulfill({ json: { success: true } }));
  await page.route("**/api/contact", (route) => route.fulfill({ json: { success: true } }));
  await page.route("**/api/checkout/create-order", (route) =>
    route.fulfill({
      status: 501,
      json: {
        error: "payment_provider_not_configured",
        message: "Payment processing is not connected in this environment yet.",
      },
    })
  );

  // Logged-out by default — individual tests can call mockLoggedIn(page) or
  // drive the real login/register mocks below to flip this.
  let loggedIn = false;

  await page.route("**/api/auth/me", (route) => {
    if (loggedIn) return route.fulfill({ json: { user: mockAuthUser } });
    return route.fulfill({ status: 401, json: { error: "Please log in to continue." } });
  });

  await page.route("**/api/auth/login", (route) => {
    const body = route.request().postDataJSON() as { email: string; password: string };
    if (body.email === mockAuthUser.email && body.password === "correctH0rse1") {
      loggedIn = true;
      return route.fulfill({ json: { user: mockAuthUser } });
    }
    return route.fulfill({ status: 401, json: { error: "Incorrect email or password." } });
  });

  await page.route("**/api/auth/register", (route) => {
    loggedIn = true;
    return route.fulfill({ status: 201, json: { user: mockAuthUser } });
  });

  await page.route("**/api/auth/logout", (route) => {
    loggedIn = false;
    return route.fulfill({ json: { success: true } });
  });

  await page.route("**/api/auth/forgot-password", (route) => route.fulfill({ json: { success: true } }));
  await page.route("**/api/auth/reset-password", (route) => route.fulfill({ json: { user: mockAuthUser } }));
  await page.route("**/api/auth/verify-email", (route) => route.fulfill({ json: { success: true } }));
}
