import { useQuery } from "@tanstack/react-query";
import { Link, Navigate } from "react-router-dom";
import { BookOpenCheck, CheckCircle2, Clock3, LockKeyhole } from "lucide-react";
import { useAuth } from "@/auth/AuthContext";
import { Alert } from "@/components/ui/Alert";
import { Container } from "@/components/ui/Container";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { LoadingState } from "@/components/shared/QueryStates";
import { Seo } from "@/components/shared/Seo";
import { apiGet, ApiError } from "@/lib/api";

type DashboardLesson = { _id: string; slug: string; title: string; summary: string; estimatedMinutes: number; progress: { status: "started" | "completed"; bestScore: number } | null };
type DashboardModule = { _id: string; position: number; title: string; description: string; lessons: DashboardLesson[] };
type Dashboard = { summary: { totalLessons: number; completedLessons: number }; modules: DashboardModule[] };

export default function LearningDashboardPage() {
  const { user, loading } = useAuth();
  const dashboard = useQuery({ queryKey: ["learning-dashboard", user?.id], queryFn: () => apiGet<Dashboard>("/learning/dashboard"), enabled: Boolean(user), retry: false });
  if (loading) return <LoadingState label="Loading your learning dashboard…" />;
  if (!user) return <Navigate to="/login" state={{ from: "/learn" }} replace />;

  const percent = dashboard.data?.summary.totalLessons ? Math.round((dashboard.data.summary.completedLessons / dashboard.data.summary.totalLessons) * 100) : 0;
  return (
    <section className="py-12 sm:py-20">
      <Seo title="Learning dashboard" description="Continue your CogniSprint learning program and track completed lessons." path="/learn" />
      <Container className="max-w-5xl">
        <p className="eyebrow">Your program</p>
        <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">Welcome back, {user.name}</h1>
        <p className="mt-3 text-[var(--color-ink-muted)]">Continue with a short, focused lesson and build steady progress.</p>

        {dashboard.isLoading ? <LoadingState label="Preparing your lessons…" /> : null}
        {dashboard.error instanceof ApiError && dashboard.error.status === 403 ? (
          <Alert className="mt-8" variant="warning" title="Course access required">
            This dashboard is available after purchasing CogniSprint. <Link className="font-semibold underline" to="/pricing">View pricing</Link>.
          </Alert>
        ) : dashboard.isError ? <Alert className="mt-8" variant="error">We could not load your dashboard. Please try again.</Alert> : null}

        {dashboard.data ? (
          <>
            <div className="surface-card mt-8 p-6">
              <div className="flex items-center justify-between gap-4"><span className="font-semibold">Overall lesson progress</span><span className="text-sm text-[var(--color-ink-muted)]">{dashboard.data.summary.completedLessons}/{dashboard.data.summary.totalLessons} complete</span></div>
              <ProgressBar className="mt-4" value={percent} label={`${percent}% complete`} />
            </div>
            <div className="mt-8 space-y-6">
              {dashboard.data.modules.map((module) => (
                <section key={module._id} className="surface-card p-6">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-brand-blue)]">Module {module.position.toString().padStart(2, "0")}</p>
                  <h2 className="mt-2 text-xl font-semibold">{module.title}</h2>
                  <p className="mt-2 text-sm text-[var(--color-ink-muted)]">{module.description}</p>
                  {module.lessons.length ? <div className="mt-5 divide-y divide-[var(--color-border)]">{module.lessons.map((lesson) => (
                    <Link key={lesson._id} to={`/learn/lessons/${lesson.slug}`} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                      {lesson.progress?.status === "completed" ? <CheckCircle2 className="text-[var(--color-success)]" aria-hidden /> : <BookOpenCheck className="text-[var(--color-brand-blue)]" aria-hidden />}
                      <span className="min-w-0 flex-1"><span className="block font-semibold">{lesson.title}</span><span className="block text-sm text-[var(--color-ink-muted)]">{lesson.summary}</span></span>
                      <span className="flex items-center gap-1 text-xs text-[var(--color-ink-faint)]"><Clock3 className="h-3.5 w-3.5" />{lesson.estimatedMinutes} min</span>
                    </Link>
                  ))}</div> : <p className="mt-5 flex items-center gap-2 text-sm text-[var(--color-ink-faint)]"><LockKeyhole className="h-4 w-4" />Lessons for this module are being prepared.</p>}
                </section>
              ))}
            </div>
          </>
        ) : null}
      </Container>
    </section>
  );
}
