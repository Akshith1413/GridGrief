import { type DemoRole, type DemoSession } from "@/lib/types";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

const SESSION_KEY_PREFIX = "griefgrid-demo-session";

const ROLE_CREDENTIALS: Record<DemoRole, { email: string; password: string }> = {
  admin: {
    email: "admin@griefgrid.local",
    password: "demo-admin",
  },
  responder: {
    email: "responder@griefgrid.local",
    password: "demo-responder",
  },
  family_member: {
    email: "family@griefgrid.local",
    password: "demo-family",
  },
  reporter: {
    email: "reporter@griefgrid.local",
    password: "demo-reporter",
  },
};
