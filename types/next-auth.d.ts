import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
        id: string;
        name: string;
        role: string;
        is_active: string;
        created_at: string;
    }
  }
}