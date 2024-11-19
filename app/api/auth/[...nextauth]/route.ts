// import { prismaClient } from "@/app/lib/db";
// import NextAuth from "next-auth";
// import GoogleProvider from "next-auth/providers/google";

// const handler = NextAuth({
//     providers: [
//         GoogleProvider({
//           clientId: process.env.GOOGLE_CLIENT_ID ?? "",
//           clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? ""
//         })
//       ],
//       secret: process.env.NEXTAUTH_SECRET ?? "secret",
//       callbacks: {
//         async signIn(params){

//           if(!params.user.email){
//             return false;
//           }
//           try{
//             await prismaClient.user.create({
//               data: {
//                 email: params.user.email,
//                 provider: "Google"
//               }
//             })
//           }catch(e){

//           }

//           return true;
//         }
//       }
// })

// export const GET = handler; 
// export const POST = handler; 















import { prismaClient } from "@/app/lib/db";
import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// Define authOptions with the correct type
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
                return false; // Deny sign-in if there's no email
            }

            try {
                // Check if user already exists
                const existingUser = await prismaClient.user.findUnique({
                    where: { email: user.email },
                });

                // If user doesn't exist, create a new one
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
                return false; // Deny sign-in on error
            }

            return true; // Allow sign-in
        }
    }
};

const handler = NextAuth(authOptions);

export const GET = handler; 
export const POST = handler;
