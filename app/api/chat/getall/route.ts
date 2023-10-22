import { getChats } from "@/app/actions";
import { authOptions } from "@/auth";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

async function getAllChats(req: Request) {
    const session = await getServerSession(authOptions);
    const user_email = session?.user.email
    const chats = await getChats(user_email)
    return NextResponse.json(chats)
}

export { getAllChats as GET }