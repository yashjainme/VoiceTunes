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
        async session({ session }) {
            if (session.user && session.user.email) {
                const dbUser = await prismaClient.user.findUnique({
                    where: { email: session.user.email }
                });
                if (dbUser) {
                    (session.user as any).id = dbUser.id;
                }
            }
            return session;
        }
    }
};
