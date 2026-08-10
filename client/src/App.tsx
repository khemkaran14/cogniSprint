import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { ScrollToTop } from "@/components/shared/ScrollToTop";
import { LoadingState } from "@/components/shared/QueryStates";

const HomePage = lazy(() => import("@/pages/HomePage"));
const CoursePage = lazy(() => import("@/pages/CoursePage"));
const CurriculumPage = lazy(() => import("@/pages/CurriculumPage"));
const SampleChallengePage = lazy(() => import("@/pages/SampleChallengePage"));
const PricingPage = lazy(() => import("@/pages/PricingPage"));
const CheckoutPage = lazy(() => import("@/pages/CheckoutPage"));
const CheckoutSuccessPage = lazy(() => import("@/pages/CheckoutSuccessPage"));
const AboutPage = lazy(() => import("@/pages/AboutPage"));
const ContactPage = lazy(() => import("@/pages/ContactPage"));
const BlogIndexPage = lazy(() => import("@/pages/BlogIndexPage"));
const BlogArticlePage = lazy(() => import("@/pages/BlogArticlePage"));
const TermsPage = lazy(() => import("@/pages/legal/TermsPage"));
const PrivacyPage = lazy(() => import("@/pages/legal/PrivacyPage"));
const RefundPolicyPage = lazy(() => import("@/pages/legal/RefundPolicyPage"));
const DisclaimerPage = lazy(() => import("@/pages/legal/DisclaimerPage"));
const CookiePolicyPage = lazy(() => import("@/pages/legal/CookiePolicyPage"));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));
const LoginPage = lazy(() => import("@/pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/auth/RegisterPage"));
const ForgotPasswordPage = lazy(() => import("@/pages/auth/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("@/pages/auth/ResetPasswordPage"));
const VerifyEmailPage = lazy(() => import("@/pages/auth/VerifyEmailPage"));
const AccountPage = lazy(() => import("@/pages/AccountPage"));

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<LoadingState label="Loading…" />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route element={<MarketingLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/brain-training-course" element={<CoursePage />} />
            <Route path="/curriculum" element={<CurriculumPage />} />
            <Route path="/sample-challenge" element={<SampleChallengePage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/blog" element={<BlogIndexPage />} />
            <Route path="/blog/:slug" element={<BlogArticlePage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/legal/terms" element={<TermsPage />} />
            <Route path="/legal/privacy" element={<PrivacyPage />} />
            <Route path="/legal/refund-policy" element={<RefundPolicyPage />} />
            <Route path="/legal/disclaimer" element={<DisclaimerPage />} />
            <Route path="/legal/cookie-policy" element={<CookiePolicyPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Suspense>
    </>
  );
}
