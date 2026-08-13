import { useQuery } from "@tanstack/react-query";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { Container } from "@/components/ui/Container";
import { LoadingState } from "@/components/shared/QueryStates";
import { Seo } from "@/components/shared/Seo";
import { apiGet } from "@/lib/api";

type Assessment = { _id: string; slug: string; title: string; description: string; month: number; estimatedMinutes: number; questionCount: number; latestAttempt: { score: number; passed: boolean } | null };

export default function AssessmentsPage() {
  const { user, loading } = useAuth();
  const query = useQuery({ queryKey: ["assessments", user?.id], queryFn: () => apiGet<{ assessments: Assessment[] }>("/assessments"), enabled: Boolean(user), retry: false });
  if (loading) return <LoadingState label="Loading assessments…" />;
  if (!user) return <Navigate to="/login" state={{ from: "/learn/assessments" }} replace />;
  return <section className="py-12 sm:py-20"><Seo title="Monthly assessments" description="Review your available CogniSprint learning assessments." path="/learn/assessments" /><Container className="max-w-5xl"><p className="eyebrow">Assessments</p><h1 className="mt-3 text-3xl font-semibold">Monthly progress checks</h1><p className="mt-3 max-w-2xl text-[var(--color-ink-muted)]">Assessment scores summarize practice performance. They are not IQ tests, diagnoses, or medical measurements.</p>{query.isLoading ? <LoadingState label="Loading assessments…" /> : null}<div className="mt-8 grid gap-5 md:grid-cols-2">{query.data?.assessments.map((item) => <article className="surface-card p-6" key={item._id}><p className="text-sm text-[var(--color-ink-muted)]">Month {item.month} · {item.questionCount} questions · {item.estimatedMinutes} min</p><h2 className="mt-2 text-xl font-semibold">{item.title}</h2><p className="mt-3 text-sm text-[var(--color-ink-muted)]">{item.description}</p>{item.latestAttempt ? <p className="mt-4 text-sm font-semibold">Latest score: {item.latestAttempt.score}% · {item.latestAttempt.passed ? "Passed" : "Keep practising"}</p> : null}<Link className="mt-5 inline-block font-semibold text-[var(--color-brand-blue)]" to={`/learn/assessments/${item.slug}`}>{item.latestAttempt ? "Try again" : "Start assessment"} →</Link></article>)}</div>{query.data?.assessments.length === 0 ? <p className="mt-8 text-[var(--color-ink-muted)]">No assessments are currently published.</p> : null}</Container></section>;
}
