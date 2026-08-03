export type NavLink = { label: string; href: string };

export const mainNav: NavLink[] = [
  { label: "Course", href: "/brain-training-course" },
  { label: "Curriculum", href: "/curriculum" },
  { label: "Free Challenge", href: "/sample-challenge" },
  { label: "Pricing", href: "/pricing" },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
];

export const footerNav: { title: string; links: NavLink[] }[] = [
  {
    title: "Product",
    links: [
      { label: "Brain Training Course", href: "/brain-training-course" },
      { label: "Curriculum", href: "/curriculum" },
      { label: "Free Challenge", href: "/sample-challenge" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Contact & Support", href: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms & Conditions", href: "/legal/terms" },
      { label: "Privacy Policy", href: "/legal/privacy" },
      { label: "Refund & Cancellation Policy", href: "/legal/refund-policy" },
      { label: "Educational Disclaimer", href: "/legal/disclaimer" },
      { label: "Cookie Policy", href: "/legal/cookie-policy" },
    ],
  },
];
