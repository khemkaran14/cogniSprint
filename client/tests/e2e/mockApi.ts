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

export async function mockApi(page: Page, options: { enrollmentOpen?: boolean } = {}) {
  await page.route("**/api/auth/me", (route) => route.fulfill({ json: { user: { id: "learner_1", name: "Test Customer", email: "test@example.com", role: "learner", timezone: "UTC", emailVerified: true } } }));
  await page.route("**/api/products", (route) => route.fulfill({ json: options.enrollmentOpen ? [mockProduct] : [] }));
  await page.route("**/api/products/cognisprint-complete", (route) => options.enrollmentOpen ? route.fulfill({ json: mockProduct }) : route.fulfill({ status: 404, json: { error: "Enrollment is currently closed." } }));
  await page.route("**/api/curriculum", (route) => route.fulfill({ json: mockModules }));
  await page.route(/\/api\/faq(\?.*)?$/, (route) => route.fulfill({ json: mockFaq }));
  await page.route("**/api/blog", (route) => route.fulfill({ json: [mockBlogArticle] }));
  await page.route(`**/api/blog/${mockBlogArticle.slug}`, (route) => route.fulfill({ json: mockBlogArticle }));
  await page.route("**/api/newsletter", (route) => route.fulfill({ json: { success: true } }));
  await page.route("**/api/contact", (route) => route.fulfill({ json: { success: true } }));
  await page.route("**/api/checkout/create-order", (route) =>
    route.fulfill({
      status: options.enrollmentOpen ? 503 : 404,
      json: {
        error: "Enrollment is currently closed while launch content is reviewed.",
      },
    })
  );
}
