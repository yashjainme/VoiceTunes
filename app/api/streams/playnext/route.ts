// import { prismaClient } from "@/app/lib/db";
// import { getServerSession } from "next-auth";
// import { NextRequest, NextResponse } from "next/server";



// export async function GET(req: NextRequest){
//     const session = await getServerSession();

//     const user = await prismaClient.user.findFirst({
//         where: {
//             email: session?.user?.email ?? ""
//         }
//     });

//     if(!user){
//         return NextResponse.json({
//             message: "Unauthenticated"
//         }, {
//             status: 403
//         })
//     }

//     const mostUpvotedStream = await prismaClient.stream.findFirst({
//         where: {
//             userId: user.id
//         },
//         orderBy:{
//             upvotes:{
//                 _count: 'desc'
//             }
//         }
//     })


//     try {
//         await Promise.all([
//             prismaClient.currentStream.upsert({
//                 where: {
//                     id: user.id // Ensure that `id` is a unique identifier
//                 },
//                 update: {
//                     streamId: mostUpvotedStream?.id
//                 },
//                 create: {
//                     userId: user.id,
//                     streamId: mostUpvotedStream?.id
//                 }
//             }),
//             mostUpvotedStream?.id && prismaClient.stream.delete({
//                 where: {
//                     id: mostUpvotedStream.id
//                 },
//             })
//         ]);
    
//         return NextResponse.json({
//             stream: mostUpvotedStream
//         });
//     } catch (error) {
//         console.error("Error executing database operations:", error);
//         return NextResponse.json({ error: "An error occurred while processing your request." }, { status: 500 });
//     }
    

// }




















// import { prismaClient } from "@/app/lib/db";
// import { getServerSession } from "next-auth";
// import { NextRequest, NextResponse } from "next/server";

// export async function GET(req: NextRequest) {
//     const session = await getServerSession();

//     const user = await prismaClient.user.findFirst({
//         where: {
//             email: session?.user?.email ?? ""
//         }
//     });

//     if (!user) {
//         return NextResponse.json({
//             message: "Unauthenticated"
//         }, { status: 403 });
//     }

//     const mostUpvotedStream = await prismaClient.stream.findFirst({
//         where: {
//             userId: user.id
//         },
//         orderBy: {
//             upvotes: {
//                 _count: 'desc'
//             }
//         }
//     });

//     if (!mostUpvotedStream) {
//         return NextResponse.json({
//             message: "No streams available to play."
//         }, { status: 404 });
//     }

//     try {
//         await Promise.all([
//             prismaClient.currentStream.upsert({
//                 where: { id: user.id },
//                 update: { streamId: mostUpvotedStream.id },
//                 create: { userId: user.id, streamId: mostUpvotedStream.id },
//             }),
//             prismaClient.stream.delete({
//                 where: { id: mostUpvotedStream.id },
//             }),
//         ]);
        

//         return NextResponse.json({
//             stream: mostUpvotedStream
//         }, { status: 200 });
//     } catch (error) {
//         console.error("Error executing database operations:", error);
//         return NextResponse.json(
//             { error: "An error occurred while processing your request." },
//             { status: 500 }
//         );
//     }
// }



























import { prismaClient } from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const session = await getServerSession();

    if (!session?.user?.email) {
        return NextResponse.json({ message: "Unauthenticated" }, { status: 403 });
    }

    try {
        // Get the user and the most upvoted stream in a single query
        const userWithMostUpvotedStream = await prismaClient.user.findUnique({
            where: {
                email: session.user.email,
            },
            select: {
                id: true,
                streams: {
                    orderBy: {
                        upvotes: {
                            _count: 'desc',
                        },
                    },
                    take: 1,
                },
            },
        });

        if (!userWithMostUpvotedStream || userWithMostUpvotedStream.streams.length === 0) {
            return NextResponse.json({ message: "No streams available to play." }, { status: 404 });
        }

        const mostUpvotedStream = userWithMostUpvotedStream.streams[0];

        // Use transaction to ensure both operations (upsert and delete) happen atomically and in parallel
        await prismaClient.$transaction([
            prismaClient.currentStream.upsert({
                where: { id: userWithMostUpvotedStream.id },
                update: { streamId: mostUpvotedStream.id },
                create: { userId: userWithMostUpvotedStream.id, streamId: mostUpvotedStream.id },
            }),
            prismaClient.stream.delete({
                where: { id: mostUpvotedStream.id },
            }),
        ]);

        return NextResponse.json({ stream: mostUpvotedStream }, { status: 200 });
    } catch (error) {
        console.error("Error executing database operations:", error);
        return NextResponse.json(
            { error: "An error occurred while processing your request." },
            { status: 500 }
        );
    }
}
