import { useQuery } from "@tanstack/react-query";
import { Navigate, Link } from "react-router-dom";
import { BarChart3, Clock3, Download, Target } from "lucide-react";
import { useAuth } from "@/auth/AuthContext";
import { Alert } from "@/components/ui/Alert";
import { Container } from "@/components/ui/Container";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { LoadingState } from "@/components/shared/QueryStates";
import { Seo } from "@/components/shared/Seo";
import { apiGet, apiUrl } from "@/lib/api";
import { skillCategories } from "@/config/brand";

type SkillAnalytics = { skill: string; attempts: number; averageScore: number | null; accuracyPercent: number | null; durationSeconds: number };
type ModuleAnalytics = { id: string; title: string; totalLessons: number; completedLessons: number; completionPercent: number; averageBestScore: number | null };
type ActivityDay = { date: string; attempts: number; completedLessons: number; durationSeconds: number; averageScore: number | null };
type Analytics = {
  generatedAt: string;
  timezone: string;
  summary: { totalLessons: number; completedLessons: number; completionPercent: number; totalAttempts: number; totalDurationSeconds: number; averageScore: number | null };
  skills: SkillAnalytics[];
  modules: ModuleAnalytics[];
  activity: ActivityDay[];
};

const minutes = (seconds: number) => Math.round(seconds / 60);
const skillName = (key: string) => skillCategories.find((skill) => skill.key === key)?.label ?? key;

export default function LearningAnalyticsPage() {
  const { user, loading } = useAuth();
  const analytics = useQuery({ queryKey: ["learning-analytics", user?.id], queryFn: () => apiGet<Analytics>("/learning/analytics"), enabled: Boolean(user), retry: false });
  if (loading) return <LoadingState label="Loading progress analytics…" />;
  if (!user) return <Navigate to="/login" state={{ from: "/learn/progress" }} replace />;
  return (
    <section className="py-12 sm:py-20">
      <Seo title="Learning progress" description="Review your CogniSprint learning activity, scores, skills and module completion." path="/learn/progress" />
      <Container className="max-w-6xl">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="eyebrow">Progress analytics</p><h1 className="mt-3 text-3xl font-semibold sm:text-4xl">Your learning progress</h1><p className="mt-3 text-[var(--color-ink-muted)]">Scores reflect practice performance, not IQ or medical outcomes.</p></div>
          <div className="flex gap-3"><Link to="/learn" className="rounded-[var(--radius-md)] border border-[var(--color-border-strong)] px-4 py-2 text-sm font-semibold">Dashboard</Link><a href={apiUrl("/learning/analytics.csv")} className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-brand-blue)] px-4 py-2 text-sm font-semibold text-white"><Download className="h-4 w-4" />Export CSV</a></div>
        </div>
        {analytics.isLoading ? <LoadingState label="Calculating progress…" /> : null}
        {analytics.isError ? <Alert className="mt-8" variant="error">Progress analytics could not be loaded.</Alert> : null}
        {analytics.data ? <>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="surface-card p-5"><BarChart3 className="text-[var(--color-brand-blue)]" /><p className="mt-3 text-2xl font-semibold">{analytics.data.summary.completionPercent}%</p><p className="text-sm text-[var(--color-ink-muted)]">published lessons complete</p></div>
            <div className="surface-card p-5"><Target className="text-[var(--color-success)]" /><p className="mt-3 text-2xl font-semibold">{analytics.data.summary.averageScore ?? "—"}{analytics.data.summary.averageScore === null ? "" : "%"}</p><p className="text-sm text-[var(--color-ink-muted)]">average attempt score</p></div>
            <div className="surface-card p-5"><p className="text-2xl font-semibold">{analytics.data.summary.totalAttempts}</p><p className="mt-3 text-sm text-[var(--color-ink-muted)]">total attempts</p></div>
            <div className="surface-card p-5"><Clock3 className="text-[var(--color-warning)]" /><p className="mt-3 text-2xl font-semibold">{minutes(analytics.data.summary.totalDurationSeconds)} min</p><p className="text-sm text-[var(--color-ink-muted)]">recorded practice time</p></div>
          </div>

          <section className="surface-card mt-8 p-6"><h2 className="text-xl font-semibold">Skills</h2><div className="mt-5 grid gap-4 md:grid-cols-2">{analytics.data.skills.map((skill) => <article key={skill.skill} className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-4"><div className="flex justify-between gap-4"><h3 className="font-semibold">{skillName(skill.skill)}</h3><span className="text-sm text-[var(--color-ink-muted)]">{skill.averageScore === null ? "No attempts" : `${skill.averageScore}% avg`}</span></div><ProgressBar className="mt-3" value={skill.averageScore ?? 0} label={`${skillName(skill.skill)} average score`} /><p className="mt-2 text-xs text-[var(--color-ink-faint)]">{skill.attempts} attempts · {skill.accuracyPercent ?? "—"}% accuracy · {minutes(skill.durationSeconds)} min</p></article>)}</div></section>

          <section className="surface-card mt-8 overflow-x-auto p-6"><h2 className="text-xl font-semibold">Module completion</h2><table className="mt-5 w-full min-w-[640px] text-left text-sm"><thead><tr className="border-b border-[var(--color-border)] text-[var(--color-ink-muted)]"><th className="py-3">Module</th><th>Lessons</th><th>Completion</th><th>Best-score average</th></tr></thead><tbody>{analytics.data.modules.map((module) => <tr key={module.id} className="border-b border-[var(--color-border)] last:border-0"><th className="py-4 font-semibold">{module.title}</th><td>{module.completedLessons}/{module.totalLessons}</td><td className="w-48"><ProgressBar value={module.completionPercent} label={`${module.title} completion`} /><span className="sr-only">{module.completionPercent}%</span></td><td>{module.averageBestScore === null ? "—" : `${module.averageBestScore}%`}</td></tr>)}</tbody></table></section>

          <section className="surface-card mt-8 overflow-x-auto p-6"><h2 className="text-xl font-semibold">Activity history</h2>{analytics.data.activity.length ? <table className="mt-5 w-full min-w-[620px] text-left text-sm"><thead><tr className="border-b border-[var(--color-border)] text-[var(--color-ink-muted)]"><th className="py-3">Date ({analytics.data.timezone})</th><th>Attempts</th><th>Completed</th><th>Average</th><th>Time</th></tr></thead><tbody>{analytics.data.activity.slice(-30).reverse().map((day) => <tr key={day.date} className="border-b border-[var(--color-border)] last:border-0"><th className="py-4 font-medium">{day.date}</th><td>{day.attempts}</td><td>{day.completedLessons}</td><td>{day.averageScore === null ? "—" : `${day.averageScore}%`}</td><td>{minutes(day.durationSeconds)} min</td></tr>)}</tbody></table> : <p className="mt-4 text-sm text-[var(--color-ink-muted)]">Complete a lesson to begin your activity history.</p>}</section>
        </> : null}
      </Container>
    </section>
  );
}
