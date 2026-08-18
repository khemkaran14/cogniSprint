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
const LearningDashboardPage = lazy(() => import("@/pages/LearningDashboardPage"));
const LessonPage = lazy(() => import("@/pages/LessonPage"));
const LearningAnalyticsPage = lazy(() => import("@/pages/LearningAnalyticsPage"));
const AssessmentsPage = lazy(() => import("@/pages/AssessmentsPage"));
const AssessmentPage = lazy(() => import("@/pages/AssessmentPage"));
const CertificatePage = lazy(() => import("@/pages/CertificatePage"));
const CertificateVerificationPage = lazy(() => import("@/pages/CertificateVerificationPage"));
const AdminDashboardPage = lazy(() => import("@/pages/admin/AdminDashboardPage"));
const AdminCertificatesPage = lazy(() => import("@/pages/admin/AdminCertificatesPage"));
const OrderReceiptPage = lazy(() => import("@/pages/OrderReceiptPage"));
const AdminOrdersPage = lazy(() => import("@/pages/admin/AdminOrdersPage"));
const AdminEmailDeliveriesPage = lazy(() => import("@/pages/admin/AdminEmailDeliveriesPage"));
const AdminAlertsPage = lazy(() => import("@/pages/admin/AdminAlertsPage"));
const AdminPrivacyRequestsPage = lazy(() => import("@/pages/admin/AdminPrivacyRequestsPage"));
const AdminDisputesPage = lazy(() => import("@/pages/admin/AdminDisputesPage"));
const AdminContentPage = lazy(() => import("@/pages/admin/AdminContentPage"));

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
            <Route path="/account/orders/:id" element={<OrderReceiptPage />} />
            <Route path="/learn" element={<LearningDashboardPage />} />
            <Route path="/learn/lessons/:slug" element={<LessonPage />} />
            <Route path="/learn/progress" element={<LearningAnalyticsPage />} />
            <Route path="/learn/assessments" element={<AssessmentsPage />} />
            <Route path="/learn/assessments/:slug" element={<AssessmentPage />} />
            <Route path="/learn/certificate" element={<CertificatePage />} />
            <Route path="/certificates/verify/:code" element={<CertificateVerificationPage />} />
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/certificates" element={<AdminCertificatesPage />} />
            <Route path="/admin/orders" element={<AdminOrdersPage />} />
            <Route path="/admin/email-deliveries" element={<AdminEmailDeliveriesPage />} />
            <Route path="/admin/alerts" element={<AdminAlertsPage />} />
            <Route path="/admin/privacy-requests" element={<AdminPrivacyRequestsPage />} />
            <Route path="/admin/disputes" element={<AdminDisputesPage />} />
            <Route path="/admin/content" element={<AdminContentPage />} />
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
