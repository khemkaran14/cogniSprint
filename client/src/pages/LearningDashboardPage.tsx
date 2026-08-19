import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, Navigate } from "react-router-dom";
import { Award, BookOpenCheck, CheckCircle2, Clock3, Flame, LockKeyhole, Sparkles } from "lucide-react";
import { useAuth } from "@/auth/AuthContext";
import { Alert } from "@/components/ui/Alert";
import { Container } from "@/components/ui/Container";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { LoadingState } from "@/components/shared/QueryStates";
import { Seo } from "@/components/shared/Seo";
import { apiGet, apiPatch, ApiError } from "@/lib/api";

type DashboardLesson = { _id: string; slug: string; title: string; summary: string; estimatedMinutes: number; unlockDay: number; progress: { status: "started" | "completed"; bestScore: number } | null; availability: { available: boolean; lockReason: "scheduled" | "prerequisite" | null } };
type DashboardModule = { _id: string; position: number; title: string; description: string; completion: { totalLessons: number; completedLessons: number }; lessons: DashboardLesson[] };
type Dashboard = { summary: { totalLessons: number; completedLessons: number; programDay: number; timezone: string; courseComplete: boolean; streak: number; xp: number; badges: { key: string; label: string; earnedAt: string }[] }; continueLesson: DashboardLesson | null; modules: DashboardModule[] };

export default function LearningDashboardPage() {
  const { user, loading } = useAuth();
  const queryClient = useQueryClient();
  const [timezone, setTimezone] = useState("");
  const dashboard = useQuery({ queryKey: ["learning-dashboard", user?.id], queryFn: () => apiGet<Dashboard>("/learning/dashboard"), enabled: Boolean(user), retry: false });
  const selectedTimezone = timezone || dashboard.data?.summary.timezone || "UTC";
  const saveTimezone = useMutation({
    mutationFn: () => apiPatch<{ timezone: string }>("/learning/preferences", { timezone: selectedTimezone }),
    onSuccess: () => { setTimezone(""); return queryClient.invalidateQueries({ queryKey: ["learning-dashboard"] }); },
  });
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
        <div className="mt-4 flex flex-wrap gap-5"><Link to="/learn/progress" className="inline-flex text-sm font-semibold text-[var(--color-brand-blue)]">View detailed progress →</Link><Link to="/learn/assessments" className="inline-flex text-sm font-semibold text-[var(--color-brand-blue)]">Published assessments →</Link><Link to="/learn/resources" className="inline-flex text-sm font-semibold text-[var(--color-brand-blue)]">Workbooks and worksheets →</Link><Link to="/learn/certificate" className="inline-flex text-sm font-semibold text-[var(--color-brand-blue)]">Certificate status →</Link></div>

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
            {dashboard.data.continueLesson ? <div className="mt-4 rounded-[var(--radius-lg)] bg-[var(--color-brand-blue)] p-6 text-white"><p className="text-sm font-semibold text-white/75">Day {dashboard.data.summary.programDay} · Continue learning</p><h2 className="mt-2 text-xl font-semibold">{dashboard.data.continueLesson.title}</h2><p className="mt-2 text-sm text-white/80">{dashboard.data.continueLesson.summary}</p><Link to={`/learn/lessons/${dashboard.data.continueLesson.slug}`} className="mt-4 inline-flex rounded-[var(--radius-md)] bg-white px-4 py-2 text-sm font-semibold text-[var(--color-brand-blue)]">{dashboard.data.continueLesson.progress?.status === "started" ? "Resume lesson" : "Start lesson"}</Link></div> : null}
            <div className="surface-card mt-4 flex flex-col gap-3 p-5 sm:flex-row sm:items-end sm:justify-between"><label className="text-sm font-semibold">Learning timezone<select className="mt-2 block rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-surface-raised)] px-3 py-2 text-sm font-normal" value={selectedTimezone} onChange={(event) => setTimezone(event.target.value)}><option value="UTC">UTC</option><option value="Asia/Kolkata">Asia/Kolkata</option><option value="America/New_York">America/New_York</option><option value="Europe/London">Europe/London</option><option value="Asia/Singapore">Asia/Singapore</option><option value="Australia/Sydney">Australia/Sydney</option></select></label><button type="button" className="rounded-[var(--radius-md)] border border-[var(--color-border-strong)] px-4 py-2 text-sm font-semibold disabled:opacity-50" disabled={selectedTimezone === dashboard.data.summary.timezone || saveTimezone.isPending} onClick={() => saveTimezone.mutate()}>{saveTimezone.isPending ? "Saving…" : "Save timezone"}</button></div>
            {saveTimezone.isError ? <Alert className="mt-4" variant="error">Timezone could not be saved.</Alert> : null}
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div className="surface-card p-5"><Flame className="text-[var(--color-warning)]" aria-hidden /><p className="mt-3 text-2xl font-semibold">{dashboard.data.summary.streak}</p><p className="text-sm text-[var(--color-ink-muted)]">day streak</p></div>
              <div className="surface-card p-5"><Sparkles className="text-[var(--color-brand-blue)]" aria-hidden /><p className="mt-3 text-2xl font-semibold">{dashboard.data.summary.xp}</p><p className="text-sm text-[var(--color-ink-muted)]">experience points</p></div>
              <div className="surface-card p-5"><Award className="text-[var(--color-success)]" aria-hidden /><p className="mt-3 text-2xl font-semibold">{dashboard.data.summary.badges.length}</p><p className="text-sm text-[var(--color-ink-muted)]">badges earned</p></div>
            </div>
            {dashboard.data.summary.badges.length ? <div className="mt-4 flex flex-wrap gap-2" aria-label="Earned badges">{dashboard.data.summary.badges.map((badge) => <span key={badge.key} title={`Earned ${new Date(badge.earnedAt).toLocaleDateString()}`} className="rounded-[var(--radius-full)] bg-[var(--color-success-surface)] px-3 py-1 text-xs font-semibold text-[var(--color-success)]">{badge.label}</span>)}</div> : null}
            <div className="mt-8 space-y-6">
              {dashboard.data.modules.map((module) => (
                <section key={module._id} className="surface-card p-6">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-brand-blue)]">Module {module.position.toString().padStart(2, "0")}</p>
                  <h2 className="mt-2 text-xl font-semibold">{module.title}</h2>
                  <p className="mt-2 text-sm text-[var(--color-ink-muted)]">{module.description}</p><p className="mt-2 text-xs text-[var(--color-ink-faint)]">{module.completion.completedLessons}/{module.completion.totalLessons} published lessons complete</p>
                  {module.lessons.length ? <div className="mt-5 divide-y divide-[var(--color-border)]">{module.lessons.map((lesson) => (
                    <div key={lesson._id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                      {lesson.progress?.status === "completed" ? <CheckCircle2 className="text-[var(--color-success)]" aria-hidden /> : lesson.availability.available ? <BookOpenCheck className="text-[var(--color-brand-blue)]" aria-hidden /> : <LockKeyhole className="text-[var(--color-ink-faint)]" aria-hidden />}
                      <span className="min-w-0 flex-1"><span className="block font-semibold">{lesson.title}</span><span className="block text-sm text-[var(--color-ink-muted)]">{lesson.summary}</span></span>
                      {lesson.availability.available ? <Link to={`/learn/lessons/${lesson.slug}`} className="text-sm font-semibold text-[var(--color-brand-blue)]">{lesson.progress?.status === "started" ? "Resume" : lesson.progress?.status === "completed" ? "Review" : "Start"}</Link> : <span className="text-xs text-[var(--color-ink-faint)]">{lesson.availability.lockReason === "scheduled" ? `Day ${lesson.unlockDay}` : "Finish previous"}</span>}
                      <span className="hidden items-center gap-1 text-xs text-[var(--color-ink-faint)] sm:flex"><Clock3 className="h-3.5 w-3.5" />{lesson.estimatedMinutes} min</span>
                    </div>
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
