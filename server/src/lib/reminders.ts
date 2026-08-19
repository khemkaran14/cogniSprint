export function nextReminderAt(timezone: string, localTime: string, weekdays: number[], now = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-CA", { timeZone: timezone, weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }); const dayMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  for (let minutes = 1; minutes <= 8 * 24 * 60; minutes += 1) { const candidate = new Date(now.getTime() + minutes * 60_000); const parts = Object.fromEntries(formatter.formatToParts(candidate).map((part) => [part.type, part.value])); if (`${parts.hour}:${parts.minute}` === localTime && weekdays.includes(dayMap[parts.weekday])) return candidate; }
  throw new Error("A reminder time could not be resolved.");
}
export function isQuietTime(time: string, start: string, end: string) { return start <= end ? time >= start && time < end : time >= start || time < end; }
