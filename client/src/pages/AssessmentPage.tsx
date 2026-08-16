import { useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Navigate, Link, useParams } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { LoadingState } from "@/components/shared/QueryStates";
import { Seo } from "@/components/shared/Seo";
import { apiGet, apiPost } from "@/lib/api";

type Question = { prompt: string; skill: string; options: string[] };
type Assessment = { slug: string; title: string; description: string; questions: Question[] };
type Result = { attempt: { score: number; correct: number; total: number; passed: boolean; skillResults: Array<{ skill: string; score: number }> } };

export default function AssessmentPage() {
  const { user, loading } = useAuth(); const { slug = "" } = useParams();
  const [answers, setAnswers] = useState<Record<number, number>>({}); const startedAt = useRef(0);
  const query = useQuery({ queryKey: ["assessment", slug, user?.id], queryFn: () => apiGet<{ assessment: Assessment }>(`/assessments/${slug}`), enabled: Boolean(user && slug), retry: false });
  const submit = useMutation({ mutationFn: (submissionId: string) => apiPost<Result>(`/assessments/${slug}/submit`, { submissionId, answers: query.data!.assessment.questions.map((_, index) => answers[index]), durationSeconds: Math.min(10800, Math.max(0, Math.round((Date.now() - startedAt.current) / 1000))) }) });
  if (loading) return <LoadingState label="Loading assessment…" />;
  if (!user) return <Navigate to="/login" replace />;
  if (query.isLoading) return <LoadingState label="Loading assessment…" />;
  const assessment = query.data?.assessment;
  if (!assessment) return <Container className="py-20"><Alert variant="error">Assessment could not be loaded.</Alert></Container>;
  if (submit.data) return <section className="py-16"><Container className="max-w-3xl"><Seo title={`${assessment.title} result`} description="Your assessment result." path={`/learn/assessments/${slug}`} /><div className="surface-card p-8"><p className="eyebrow">Result</p><h1 className="mt-3 text-3xl font-semibold">{submit.data.attempt.score}%</h1><p className="mt-3">{submit.data.attempt.correct} of {submit.data.attempt.total} correct · {submit.data.attempt.passed ? "Passed" : "Keep practising and try again"}</p><div className="mt-6 grid gap-3 sm:grid-cols-2">{submit.data.attempt.skillResults.map((skill) => <p className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-3" key={skill.skill}>{skill.skill}: <strong>{skill.score}%</strong></p>)}</div><p className="mt-6 text-sm text-[var(--color-ink-muted)]">This result reflects this practice assessment only and is not an intelligence or medical measurement.</p><Link className="mt-6 inline-block font-semibold text-[var(--color-brand-blue)]" to="/learn/assessments">Back to assessments →</Link></div></Container></section>;
  return <section className="py-12"><Seo title={assessment.title} description={assessment.description} path={`/learn/assessments/${slug}`} /><Container className="max-w-3xl"><p className="eyebrow">Monthly assessment</p><h1 className="mt-3 text-3xl font-semibold">{assessment.title}</h1><p className="mt-3 text-[var(--color-ink-muted)]">Answer every question. Your result is scored securely by the server.</p><form className="mt-8 space-y-6" onSubmit={(event) => { event.preventDefault(); submit.mutate(crypto.randomUUID()); }}>{assessment.questions.map((question, questionIndex) => <fieldset className="surface-card p-6" key={questionIndex}><legend className="px-1 font-semibold">{questionIndex + 1}. {question.prompt}</legend><p className="mt-2 text-xs uppercase tracking-wide text-[var(--color-ink-faint)]">{question.skill}</p><div className="mt-4 space-y-3">{question.options.map((option, optionIndex) => <label className="flex cursor-pointer gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] p-3" key={option}><input type="radio" name={`question-${questionIndex}`} checked={answers[questionIndex] === optionIndex} onChange={() => { if (!startedAt.current) startedAt.current = Date.now(); setAnswers((current) => ({ ...current, [questionIndex]: optionIndex })); }} />{option}</label>)}</div></fieldset>)}{submit.isError ? <Alert variant="error">Your assessment could not be submitted. Please try again.</Alert> : null}<Button type="submit" disabled={Object.keys(answers).length !== assessment.questions.length || submit.isPending}>{submit.isPending ? "Scoring…" : "Submit assessment"}</Button></form></Container></section>;
}
