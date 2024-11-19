import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prismaClient } from "@/app/lib/db";


export async function GET(req: NextRequest) {
    try {
        // Get the session from the request
        const session = await getServerSession();

        // Check if the user is authenticated
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // const userId = session.user?.id as string; // Explicitly cast user ID to string

        // Fetch user information from the database
        const userId = await prismaClient.user.findUnique({
            where: { email: session.user?.email || '' },
        });

        if (!userId) {
            return NextResponse.json({ error: "User ID not found in session" }, { status: 400 });
        }

        // Fetch user information from the database
        // const userId = await prismaClient.user.findUnique({
        //     where: { id: userId },
        // });

        // Check if user was found
        if (!userId) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ userId });
    } catch (error) {
        console.error("Error fetching user:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
