import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, Navigate, useParams } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { LoadingState } from "@/components/shared/QueryStates";
import { Seo } from "@/components/shared/Seo";
import { apiGet, apiPost } from "@/lib/api";

type Lesson = { slug: string; title: string; summary: string; estimatedMinutes: number; content: string[]; exercises: { prompt: string; options: string[] }[] };
type Result = { score: number; correct: number; total: number; explanations: string[] };

export default function LessonPage() {
  const { slug = "" } = useParams();
  const { user, loading } = useAuth();
  const queryClient = useQueryClient();
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const lesson = useQuery({ queryKey: ["lesson", slug], queryFn: () => apiGet<Lesson>(`/learning/lessons/${slug}`), enabled: Boolean(user && slug), retry: false });
  const completion = useMutation({ mutationFn: () => apiPost<Result>(`/learning/lessons/${slug}/complete`, { answers: lesson.data?.exercises.map((_, index) => answers[index]) }), onSuccess: () => queryClient.invalidateQueries({ queryKey: ["learning-dashboard"] }) });
  if (loading) return <LoadingState label="Loading lesson…" />;
  if (!user) return <Navigate to="/login" state={{ from: `/learn/lessons/${slug}` }} replace />;
  return <section className="py-12 sm:py-20"><Container className="max-w-3xl">
    <Link to="/learn" className="text-sm font-semibold text-[var(--color-brand-blue)]">← Back to dashboard</Link>
    {lesson.isLoading ? <LoadingState label="Loading lesson…" /> : null}
    {lesson.isError ? <Alert className="mt-8" variant="error">This lesson could not be loaded.</Alert> : null}
    {lesson.data ? <><Seo title={lesson.data.title} description={lesson.data.summary} path={`/learn/lessons/${slug}`} /><p className="eyebrow mt-8">Guided lesson · {lesson.data.estimatedMinutes} minutes</p><h1 className="mt-3 text-3xl font-semibold sm:text-4xl">{lesson.data.title}</h1><p className="mt-3 text-lg text-[var(--color-ink-muted)]">{lesson.data.summary}</p>
      <article className="surface-card mt-8 space-y-5 p-6 sm:p-8">{lesson.data.content.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</article>
      <div className="mt-8 space-y-6">{lesson.data.exercises.map((exercise, index) => <fieldset key={exercise.prompt} className="surface-card p-6"><legend className="font-semibold">{index + 1}. {exercise.prompt}</legend><div className="mt-4 space-y-2">{exercise.options.map((option, optionIndex) => <label key={option} className="flex cursor-pointer gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] p-3"><input type="radio" name={`exercise-${index}`} checked={answers[index] === optionIndex} onChange={() => setAnswers((current) => ({ ...current, [index]: optionIndex }))}/><span>{option}</span></label>)}</div>{completion.data ? <p className="mt-4 text-sm text-[var(--color-ink-muted)]">{completion.data.explanations[index]}</p> : null}</fieldset>)}</div>
      {completion.data ? <Alert className="mt-6" variant="success" title={`Lesson complete — ${completion.data.score}%`}>You answered {completion.data.correct} of {completion.data.total} correctly.</Alert> : null}
      {completion.isError ? <Alert className="mt-6" variant="error">We could not save your result. Please try again.</Alert> : null}
      <Button className="mt-6" disabled={Object.keys(answers).length !== lesson.data.exercises.length || completion.isPending} onClick={() => completion.mutate()}>{completion.isPending ? "Saving…" : completion.data ? "Try again" : "Complete lesson"}</Button>
    </> : null}
  </Container></section>;
}
