// import { NextRequest, NextResponse } from "next/server";

// import { z } from 'zod';
// import { prismaClient } from "@/app/lib/db";

// //@ts-ignore
// import youtubesearchapi from 'youtube-search-api'
// import { YT_REGEX } from "@/app/lib/utils";
// import { getServerSession } from "next-auth";




// const CreateStreamSchema = z.object({
//     creatorId: z.string(),
//     url: z.string(),
 
// });


// export async function POST(req: NextRequest) {
//     try {
//         const data = CreateStreamSchema.parse(await req.json());
//         const isYt = YT_REGEX.test(data.url);
        
//         console.log("URL:", data.url, "Is YouTube URL:", isYt); // Log for debugging
        
//         if (!isYt) {
//             return NextResponse.json({
//                 message: "Wrong URL format"
//             }, {
//                 status: 411
//             });
//         }

//         const extractedId = data.url.split("?v=")[1];
//         console.log(extractedId)


//         const res = await youtubesearchapi.GetVideoDetails(extractedId);

//         // console.log(res.title)

//         // console.log(res.thumbnail.thumbnails)
//         // console.log(JSON.stringify(res.thumbnail.thumbnails))

//         const thumbnails = res.thumbnail.thumbnails;
//         thumbnails.sort((a: {width: number}, b: {width: number})=> a.width < b.width ? -1: 1);


//         const streams = await prismaClient.stream.create({
//             data: {
//                 url: data.url,
//                 extractedId: extractedId,
//                 type: "Youtube",
//                 userId: data.creatorId,
//                 addedBy: data.creatorId,
//                 title: res.title ?? "Can't Find Video",
//                 smallImg: thumbnails.length > 1 ? thumbnails[thumbnails.length - 2].url : thumbnails[thumbnails.length - 1].url ?? "https://i.natgeofe.com/n/548467d8-c5f1-4551-9f58-6817a8d2c45e/NationalGeographic_2572187_square.jpg",
//                 bigImg: thumbnails[thumbnails.length - 1].url ?? "https://i.natgeofe.com/n/548467d8-c5f1-4551-9f58-6817a8d2c45e/NationalGeographic_2572187_square.jpg"
//             },
//         });

//         return NextResponse.json({ 
//            ...streams,
//            hasUpvoted: false,
//            upvotes: 0
//         });

//     } catch (e) {
//         console.error(e); // Log the full error for debugging
//         return NextResponse.json({
//             message: "Error while adding a stream."
//         }, {
//             status: 500
//         });
//     }
// }



// export async function GET(req: NextRequest) {
//     const creatorId = req.nextUrl.searchParams.get("creatorId");

//     const session = await getServerSession();

//     const user = await prismaClient.user.findFirst({
//         where: {
//             email: session?.user?.email ?? ""
//         }
//     });

//     if (!user) {
//         return NextResponse.json({
//             message: "Unauthenticated"
//         }, {
//             status: 403
//         });
//     }

//     if (!creatorId) {
//         return NextResponse.json({ message: "Error" }, { status: 411 });
//     }

//     const [streams, activeStream] = await Promise.all([
//         prismaClient.stream.findMany({
//             where: {
//                 userId: creatorId
//             },
//             include: {
//                 _count: {
//                     select: {
//                         upvotes: true
//                     }
//                 },
//                 upvotes: {
//                     where: {
//                         userId: user.id
//                     }
//                 }
//             }
//         }),
//         prismaClient.currentStream.findFirst({
//             where: {
//                 userId: creatorId
//             },
//             include: {
//                 stream: true,
//             },
//         })
//     ]);

//     // Logging to troubleshoot
//     console.log("Active Stream Data:", activeStream);

//     return NextResponse.json({
//         streams: streams.map(({ _count, ...rest }) => ({
//             ...rest,
//             upvotes: _count.upvotes,
//             haveUpvoted: rest.upvotes.length ? true : false
//         })),
//         acStreams: activeStream
//     });
// }






























import { NextRequest, NextResponse } from "next/server";
import { z } from 'zod';
import { prismaClient } from "@/app/lib/db";
//@ts-ignore
import youtubesearchapi from 'youtube-search-api'
import { YT_REGEX } from "@/app/lib/utils";
import { getServerSession } from "next-auth";

// Move schema outside of function to avoid recreation on each request
const CreateStreamSchema = z.object({
    creatorId: z.string(),
    url: z.string(),
});

// Reusable error responses
const ERROR_RESPONSES = {
    WRONG_URL: NextResponse.json({ message: "Wrong URL format" }, { status: 411 }),
    SERVER_ERROR: NextResponse.json({ message: "Error while adding a stream." }, { status: 500 }),
    UNAUTHENTICATED: NextResponse.json({ message: "Unauthenticated" }, { status: 403 }),
    MISSING_CREATOR: NextResponse.json({ message: "Error" }, { status: 411 })
};

// Default thumbnail fallback
const DEFAULT_THUMBNAIL = "https://i.natgeofe.com/n/548467d8-c5f1-4551-9f58-6817a8d2c45e/NationalGeographic_2572187_square.jpg";

export async function POST(req: NextRequest) {
    try {
        const data = CreateStreamSchema.parse(await req.json());
        
        if (!YT_REGEX.test(data.url)) {
            return ERROR_RESPONSES.WRONG_URL;
        }

        const extractedId = data.url.split("?v=")[1];
        const videoDetails = await youtubesearchapi.GetVideoDetails(extractedId);
        
        // Sort thumbnails once and get required URLs
        const thumbnails = videoDetails.thumbnail.thumbnails;
        const lastIndex = thumbnails.length - 1;
        const bigImg = thumbnails[lastIndex].url ?? DEFAULT_THUMBNAIL;
        const smallImg = thumbnails.length > 1 ? thumbnails[lastIndex - 1].url : bigImg;

        const streams = await prismaClient.stream.create({
            data: {
                url: data.url,
                extractedId,
                type: "Youtube",
                userId: data.creatorId,
                addedBy: data.creatorId,
                title: videoDetails.title ?? "Can't Find Video",
                smallImg,
                bigImg
            },
        });

        return NextResponse.json({ 
            ...streams,
            hasUpvoted: false,
            upvotes: 0
        });

    } catch (e) {
        console.error(e);
        return ERROR_RESPONSES.SERVER_ERROR;
    }
}

export async function GET(req: NextRequest) {
    const creatorId = req.nextUrl.searchParams.get("creatorId");
    if (!creatorId) return ERROR_RESPONSES.MISSING_CREATOR;

    try {
        const session = await getServerSession();
        const user = await prismaClient.user.findFirst({
            where: {
                email: session?.user?.email ?? ""
            }
        });

        if (!user) return ERROR_RESPONSES.UNAUTHENTICATED;

        // Parallel database queries with optimized includes
        const [streams, activeStream] = await Promise.all([
            prismaClient.stream.findMany({
                where: { userId: creatorId },
                include: {
                    _count: {
                        select: { upvotes: true }
                    },
                    upvotes: {
                        where: { userId: user.id },
                        select: { id: true } // Only select what's needed
                    }
                }
            }),
            prismaClient.currentStream.findFirst({
                where: { userId: creatorId },
                include: {
                    stream: true,
                }
            })
        ]);

        return NextResponse.json({
            streams: streams.map(({ _count, upvotes, ...rest }) => ({
                ...rest,
                upvotes: _count.upvotes,
                haveUpvoted: upvotes.length > 0
            })),
            acStreams: activeStream
        });
    } catch (e) {
        console.error(e);
        return ERROR_RESPONSES.SERVER_ERROR;
    }
}