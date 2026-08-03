import { useCallback, useRef, useState } from "react";
import { Container } from "@/components/ui/Container";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { IntroScreen } from "@/components/challenge/IntroScreen";
import { MentalMathStep } from "@/components/challenge/steps/MentalMathStep";
import { MemoryStep } from "@/components/challenge/steps/MemoryStep";
import { PatternStep } from "@/components/challenge/steps/PatternStep";
import { ObservationStep } from "@/components/challenge/steps/ObservationStep";
import { CriticalThinkingStep } from "@/components/challenge/steps/CriticalThinkingStep";
import { ResultsScreen } from "@/components/challenge/ResultsScreen";
import { scoreSkill, buildChallengeResult } from "@/lib/challengeScoring";
import type { ChallengeResult, SkillScore } from "@/types/challenge";

type StageKey = "intro" | "math" | "memory" | "pattern" | "observation" | "critical" | "results";
const progressStages: StageKey[] = ["math", "memory", "pattern", "observation", "critical"];

export function ChallengeFlow() {
  const [stage, setStage] = useState<StageKey>("intro");
  const [scores, setScores] = useState<SkillScore[]>([]);
  const [result, setResult] = useState<ChallengeResult | null>(null);
  const startedAtRef = useRef<number>(0);

  function goTo(next: StageKey) {
    setStage(next);
  }

  function handleStart() {
    startedAtRef.current = Date.now();
    goTo("math");
  }

  const finish = useCallback((finalScores: SkillScore[]) => {
    const durationSeconds = Math.max(1, Math.round((Date.now() - startedAtRef.current) / 1000));
    const finalResult = buildChallengeResult(finalScores, durationSeconds);
    setResult(finalResult);
    goTo("results");
  }, []);

  function handleMathComplete(correct: number, total: number) {
    setScores((prev) => [...prev, scoreSkill("mental-math", correct, total)]);
    goTo("memory");
  }
  function handleMemoryComplete(correct: number, total: number) {
    setScores((prev) => [...prev, scoreSkill("memory", correct, total)]);
    goTo("pattern");
  }
  function handlePatternComplete(correct: number, total: number) {
    setScores((prev) => [...prev, scoreSkill("logic", correct, total)]);
    goTo("observation");
  }
  function handleObservationComplete(correct: number, total: number) {
    setScores((prev) => [...prev, scoreSkill("observation", correct, total)]);
    goTo("critical");
  }
  function handleCriticalComplete(correct: number, total: number) {
    const finalScores = [...scores, scoreSkill("critical-thinking", correct, total)];
    setScores(finalScores);
    finish(finalScores);
  }

  function handleRetry() {
    setScores([]);
    setResult(null);
    startedAtRef.current = Date.now();
    goTo("math");
  }

  const stageIndex = progressStages.indexOf(stage);

  return (
    <Container className="py-16 sm:py-20">
      <div className="mx-auto max-w-3xl">
        {stage !== "intro" && stage !== "results" ? (
          <ProgressBar value={stageIndex + 1} max={progressStages.length} className="mb-10" />
        ) : null}

        <div className="surface-card p-6 sm:p-10">
          {stage === "intro" && <IntroScreen onStart={handleStart} />}
          {stage === "math" && <MentalMathStep onComplete={handleMathComplete} />}
          {stage === "memory" && <MemoryStep onComplete={handleMemoryComplete} />}
          {stage === "pattern" && <PatternStep onComplete={handlePatternComplete} />}
          {stage === "observation" && <ObservationStep onComplete={handleObservationComplete} />}
          {stage === "critical" && <CriticalThinkingStep onComplete={handleCriticalComplete} />}
          {stage === "results" && result && <ResultsScreen result={result} onRetry={handleRetry} />}
        </div>
      </div>
    </Container>
  );
}
