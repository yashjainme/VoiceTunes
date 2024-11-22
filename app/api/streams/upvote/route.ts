// import { prismaClient } from "@/app/lib/db";
// import { getServerSession } from "next-auth";
// import { NextRequest, NextResponse } from "next/server";

// import {z} from 'zod';

// const UpvoteSchema = z.object({
//     streamId: z.string(),
// })

// export async function POST(req: NextRequest){
    
//     const session = await getServerSession();
    

//     const user = await prismaClient.user.findFirst({
//         where: {
//             email: session?.user?.email ?? ""
//         }
//     });
//     // console.log(user)

//     if(!user){
//         return NextResponse.json({
//             message: "Unauthorized"
//         }, {
//             status: 403
//         })
//     }
    


//     try{

//         const data = UpvoteSchema.parse(await req.json());
//         await prismaClient.upvote.create({
//             data: {
//                 userId: user.id,
//                 streamId: data.streamId
//             }
//         })

//         return NextResponse.json({
//             message: "Done!"
//         })
//     }catch(e){
//         return NextResponse.json({
//             message: "Error While Upvoting"
//         }, {
//             status: 403
//         })
//     }
// }










import { prismaClient } from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const UpvoteSchema = z.object({
  streamId: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const user = await prismaClient.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }, // Select only what is needed
    });

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const data = UpvoteSchema.parse(await req.json());

    // Use transaction to ensure atomicity
    await prismaClient.$transaction([
      prismaClient.upvote.create({
        data: { userId: user.id, streamId: data.streamId },
      }),
    ]);

    return NextResponse.json({ message: "Upvote added successfully!" });
  } catch (error) {
    console.error("Error while upvoting:", error);
    return NextResponse.json({ message: "Error while upvoting" }, { status: 400 });
  }
}
