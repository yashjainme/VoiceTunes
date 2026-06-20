import { prismaClient } from "@/app/lib/db";
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID ?? "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? ""
        })
    ],
    secret: process.env.NEXTAUTH_SECRET ?? "secret",
    callbacks: {
        async signIn({ user }) {
            if (!user.email) {
                return false;
            }

            try {
                const existingUser = await prismaClient.user.findUnique({
                    where: { email: user.email },
                });

                if (!existingUser) {
                    await prismaClient.user.create({
                        data: {
                            email: user.email,
                            provider: "Google",
                        },
                    });
                }
            } catch (error) {
                console.error("Error creating user:", error);
                return false;
            }

            return true;
        },
        async jwt({ token, user }) {
            // Read from DB and cache in JWT payload ONLY on initial sign-in/creation
            if (user && user.email) {
                try {
                    const dbUser = await prismaClient.user.findUnique({
                        where: { email: user.email }
                    });
                    if (dbUser) {
                        token.id = dbUser.id;
                    }
                } catch (error) {
                    console.error("Error fetching dbUser in jwt callback:", error);
                }
            } else if (!token.id && token.email) {
                // Recover user ID for existing legacy session cookies without requiring logout/login
                try {
                    const dbUser = await prismaClient.user.findUnique({
                        where: { email: token.email }
                    });
                    if (dbUser) {
                        token.id = dbUser.id;
                    }
                } catch (error) {
                    console.error("Error recovering dbUser in jwt callback:", error);
                }
            }
            return token;
        },
        async session({ session, token }) {
            // Retrieve id directly from JWT token cache without hitting database
            if (session.user && token.id) {
                (session.user as any).id = token.id as string;
            }
            return session;
        }
    }
};
