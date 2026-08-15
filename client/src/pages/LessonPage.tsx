import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Cloud, CloudOff } from "lucide-react";
import { useAuth } from "@/auth/AuthContext";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { LoadingState } from "@/components/shared/QueryStates";
import { Seo } from "@/components/shared/Seo";
import { apiGet, apiPatch, apiPost, ApiError } from "@/lib/api";

type LessonLink = { slug: string; title: string; available: boolean };
type Lesson = {
  slug: string;
  title: string;
  summary: string;
  estimatedMinutes: number;
  passingScore: number;
  content: string[];
  exercises: { prompt: string; options: string[] }[];
  progress: { draftAnswers?: number[]; status: "started" | "completed"; bestScore: number } | null;
  navigation: { previous: LessonLink | null; next: LessonLink | null };
};
type Result = {
  score: number;
  correct: number;
  total: number;
  passed: boolean;
  duplicate: boolean;
  explanations: string[];
  nextLesson: { slug: string; title: string; available?: boolean } | null;
};

export default function LessonPage() {
  const { slug = "" } = useParams();
  const { user, loading } = useAuth();
  const queryClient = useQueryClient();
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [draftState, setDraftState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const hydratedSlug = useRef<string | null>(null);
  const completedSubmission = useRef(false);
  const submissionId = useRef(crypto.randomUUID());
  const submissionStarted = useRef(false);
  const openedAt = useRef(0);
  const lesson = useQuery({
    queryKey: ["lesson", slug],
    queryFn: () => apiGet<Lesson>(`/learning/lessons/${slug}`),
    enabled: Boolean(user && slug),
    retry: false,
  });

  useEffect(() => {
    if (!lesson.data || hydratedSlug.current === slug) return;
    openedAt.current = Date.now();
    setAnswers(Object.fromEntries((lesson.data.progress?.draftAnswers ?? []).flatMap((answer, index) => answer >= 0 ? [[index, answer]] : [])));
    hydratedSlug.current = slug;
    completedSubmission.current = false;
  }, [lesson.data, slug]);

  const draftAnswers = useMemo(() => lesson.data?.exercises.map((_, index) => answers[index] ?? -1) ?? [], [answers, lesson.data]);
  useEffect(() => {
    if (!lesson.data || hydratedSlug.current !== slug || !Object.keys(answers).length || completedSubmission.current) return;
    setDraftState("saving");
    const timeout = window.setTimeout(() => {
      apiPatch<{ saved: true }>(`/learning/lessons/${slug}/draft`, { answers: draftAnswers })
        .then(() => setDraftState("saved"))
        .catch(() => setDraftState("error"));
    }, 600);
    return () => window.clearTimeout(timeout);
  }, [answers, draftAnswers, lesson.data, slug]);

  const completion = useMutation({
    mutationFn: () => apiPost<Result>(`/learning/lessons/${slug}/complete`, {
      submissionId: submissionId.current,
      answers: lesson.data?.exercises.map((_, index) => answers[index]),
      durationSeconds: openedAt.current ? Math.min(7200, Math.max(0, Math.round((Date.now() - openedAt.current) / 1000))) : 0,
    }),
    onMutate: () => { submissionStarted.current = true; },
    onSuccess: () => {
      completedSubmission.current = true;
      submissionStarted.current = false;
      submissionId.current = crypto.randomUUID();
      setDraftState("idle");
      void queryClient.invalidateQueries({ queryKey: ["learning-dashboard"] });
      void queryClient.invalidateQueries({ queryKey: ["lesson", slug] });
    },
  });

  if (loading) return <LoadingState label="Loading lesson…" />;
  if (!user) return <Navigate to="/login" state={{ from: `/learn/lessons/${slug}` }} replace />;
  const locked = lesson.error instanceof ApiError && lesson.error.status === 423;
  const lockedMessage = locked ? (lesson.error as ApiError).message : "";

  return (
    <section className="py-12 sm:py-20">
      <Container className="max-w-3xl">
        <Link to="/learn" className="text-sm font-semibold text-[var(--color-brand-blue)]">← Back to dashboard</Link>
        {lesson.isLoading ? <LoadingState label="Loading lesson…" /> : null}
        {locked ? <Alert className="mt-8" variant="warning" title="Lesson locked">{lockedMessage}</Alert> : null}
        {lesson.isError && !locked ? <Alert className="mt-8" variant="error">This lesson could not be loaded.</Alert> : null}
        {lesson.data ? (
          <>
            <Seo title={lesson.data.title} description={lesson.data.summary} path={`/learn/lessons/${slug}`} />
            <p className="eyebrow mt-8">Guided lesson · {lesson.data.estimatedMinutes} minutes</p>
            <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">{lesson.data.title}</h1>
            <p className="mt-3 text-lg text-[var(--color-ink-muted)]">{lesson.data.summary}</p>
            <p className="mt-2 text-sm text-[var(--color-ink-faint)]">Pass mark: {lesson.data.passingScore}%</p>

            <article className="surface-card mt-8 space-y-5 p-6 sm:p-8">
              {lesson.data.content.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </article>

            <div className="mt-8 space-y-6">
              {lesson.data.exercises.map((exercise, index) => (
                <fieldset key={exercise.prompt} className="surface-card p-6">
                  <legend className="font-semibold">{index + 1}. {exercise.prompt}</legend>
                  <div className="mt-4 space-y-2">
                    {exercise.options.map((option, optionIndex) => (
                      <label key={option} className="flex cursor-pointer gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] p-3">
                        <input type="radio" name={`exercise-${index}`} checked={answers[index] === optionIndex} onChange={() => { if (submissionStarted.current) { submissionId.current = crypto.randomUUID(); submissionStarted.current = false; } completedSubmission.current = false; setAnswers((current) => ({ ...current, [index]: optionIndex })); }} />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                  {completion.data ? <p className="mt-4 text-sm text-[var(--color-ink-muted)]">{completion.data.explanations[index]}</p> : null}
                </fieldset>
              ))}
            </div>

            <p className="mt-4 flex items-center gap-2 text-xs text-[var(--color-ink-faint)]" aria-live="polite">
              {draftState === "error" ? <><CloudOff className="h-4 w-4" />Draft could not be saved</> : null}
              {draftState === "saving" ? <><Cloud className="h-4 w-4" />Saving draft…</> : null}
              {draftState === "saved" ? <><Cloud className="h-4 w-4" />Draft saved</> : null}
            </p>

            {completion.data ? (
              <Alert className="mt-6" variant={completion.data.passed ? "success" : "warning"} title={`${completion.data.passed ? "Lesson complete" : "Keep practising"} — ${completion.data.score}%`}>
                You answered {completion.data.correct} of {completion.data.total} correctly.
              </Alert>
            ) : null}
            {completion.isError ? <Alert className="mt-6" variant="error">We could not save your result. Please try again.</Alert> : null}
            <Button className="mt-6" disabled={Object.keys(answers).length !== lesson.data.exercises.length || completion.isPending} onClick={() => completion.mutate()}>
              {completion.isPending ? "Saving…" : completion.data ? "Try again" : "Complete lesson"}
            </Button>

            <nav className="mt-10 flex items-center justify-between gap-4 border-t border-[var(--color-border)] pt-6" aria-label="Lesson navigation">
              {lesson.data.navigation.previous ? <Link to={`/learn/lessons/${lesson.data.navigation.previous.slug}`} className="flex items-center gap-2 text-sm font-semibold text-[var(--color-brand-blue)]"><ArrowLeft className="h-4 w-4" />{lesson.data.navigation.previous.title}</Link> : <span />}
              {lesson.data.navigation.next?.available || completion.data?.nextLesson?.available ? <Link to={`/learn/lessons/${lesson.data.navigation.next?.slug ?? completion.data?.nextLesson?.slug}`} className="flex items-center gap-2 text-right text-sm font-semibold text-[var(--color-brand-blue)]">{lesson.data.navigation.next?.title ?? completion.data?.nextLesson?.title}<ArrowRight className="h-4 w-4" /></Link> : null}
            </nav>
          </>
        ) : null}
      </Container>
    </section>
  );
}
