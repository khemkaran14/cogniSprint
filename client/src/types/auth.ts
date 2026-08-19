export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: "student" | "admin" | "support";
  emailVerified: boolean;
};
