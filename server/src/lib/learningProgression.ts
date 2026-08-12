export type ProgressionLesson = {
  id: string;
  sequenceNumber: number;
  unlockDay: number;
  prerequisiteLessonId?: string | null;
};

export type ProgressionRecord = {
  lessonId: string;
  status: "started" | "completed";
};

export function isValidTimezone(timezone: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: timezone }).format();
    return true;
  } catch {
    return false;
  }
}

export function calendarDayNumber(start: Date, now: Date, timezone: string): number {
  const dayValue = (value: Date) => {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(value);
    const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    const year = Number(values.year);
    const month = Number(values.month);
    const day = Number(values.day);
    return Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
  };
  return Math.max(1, dayValue(now) - dayValue(start) + 1);
}

export function lessonAvailability(options: {
  lessons: ProgressionLesson[];
  progress: ProgressionRecord[];
  programDay: number;
}) {
  const completed = new Set(options.progress.filter((item) => item.status === "completed").map((item) => item.lessonId));
  return options.lessons.map((lesson, index) => {
    const previous = options.lessons[index - 1];
    const prerequisiteId = lesson.prerequisiteLessonId ?? previous?.id;
    const availableOnDate = lesson.unlockDay <= options.programDay;
    const prerequisiteComplete = !prerequisiteId || completed.has(prerequisiteId);
    const available = availableOnDate && prerequisiteComplete;
    return {
      ...lesson,
      available,
      lockReason: available ? null : !availableOnDate ? "scheduled" as const : "prerequisite" as const,
      prerequisiteId: prerequisiteId ?? null,
    };
  });
}
