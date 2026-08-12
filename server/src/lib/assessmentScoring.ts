export type AssessmentQuestion = { skill: string; correctIndex: number };

export function scoreAssessment(questions: AssessmentQuestion[], answers: number[]) {
  const totals = new Map<string, { correct: number; total: number }>();
  let correct = 0;
  questions.forEach((question, index) => {
    const skill = totals.get(question.skill) ?? { correct: 0, total: 0 };
    skill.total += 1;
    if (answers[index] === question.correctIndex) {
      correct += 1;
      skill.correct += 1;
    }
    totals.set(question.skill, skill);
  });
  const percentage = (value: number, total: number) => total ? Math.round((value / total) * 100) : 100;
  return {
    correct,
    total: questions.length,
    score: percentage(correct, questions.length),
    skillResults: [...totals].map(([skill, result]) => ({ skill, ...result, score: percentage(result.correct, result.total) })),
  };
}
