export function isEnrollmentOpen(env: NodeJS.ProcessEnv = process.env) {
  return env.ENROLLMENT_OPEN?.trim().toLowerCase() === "true";
}
