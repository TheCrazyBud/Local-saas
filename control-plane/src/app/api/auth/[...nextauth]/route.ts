import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import prisma from "../../../../lib/prisma"
import { verifyPassword } from "../../../../lib/auth"

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email", placeholder: "admin@enterprise.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Look up user in the database
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            include: {
              orgMemberships: {
                include: { org: true },
                take: 1,
                orderBy: { joinedAt: 'asc' },
              },
            },
          });

          if (!user) {
            // Fallback for initial setup before DB is seeded
            if (credentials.email === "admin@enterprise.com" && credentials.password === "password") {
              return { id: "1", name: "Admin User", email: "admin@enterprise.com" };
            }
            return null;
          }

          // Verify password
          if (!verifyPassword(credentials.password, user.passwordHash)) {
            return null;
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
          };
        } catch (error) {
          // DB offline — fall back to hardcoded credentials
          if (credentials.email === "admin@enterprise.com" && credentials.password === "password") {
            return { id: "1", name: "Admin User", email: "admin@enterprise.com" };
          }
          return null;
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "super-secret-enterprise-key-123",
})

export { handler as GET, handler as POST }
