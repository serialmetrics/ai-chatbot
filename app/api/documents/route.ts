import { getAllDocs, getChats } from "@/app/actions";
import { authOptions } from "@/auth";
import kv from "@/lib/redis";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return new Response('Unauthorized', {
            status: 401
        })
    }
    const docs = await getAllDocs()
    return NextResponse.json(docs)
}