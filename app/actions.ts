"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import kv from "lib/redis";

import { auth } from "@/auth";
import { type DocumentInfo, type Chat } from "@/lib/types";

export async function getChats(userId?: string | null) {
    if (!userId) {
        return [];
    }

    try {
        const pipeline = kv.pipeline();
        const chats: string[] = await kv.zrange(`user:chat:${userId}`, 0, -1);

        for (const chat of chats) {
            pipeline.hgetall(chat);
        }

        const results = await pipeline.exec();
        let chat_list: Chat[] = []
        results?.forEach((item) => {
            chat_list.push(item[1] as Chat)
        })

        return chat_list;
    } catch (error) {
        return [];
    }
}

export async function getChat(id: string, userId: string) {
    const chat = await kv.hgetall(`chat:${id}`);

    if (!chat || (userId && chat.user_email !== userId)) {
        return null;
    }

    return chat as Chat;
}

export async function removeChat({ id, path }: { id: string; path: string }) {
    const session = await auth();

    if (!session) {
        return {
            error: "Unauthorized",
        };
    }

    const uid = await kv.hget(`chat:${id}`, "user_email");

    if (uid !== session?.user?.email) {
        return {
            error: "Unauthorized",
        };
    }

    await kv.del(`chat:${id}`);
    await kv.zrem(`user:chat:${session?.user?.email}`, `chat:${id}`);

    revalidatePath("/");
    return revalidatePath(path);
}

export async function clearChats() {
    const session = await auth();

    if (!session?.user?.email) {
        return {
            error: "Unauthorized",
        };
    }

    const chats: string[] = await kv.zrange(`user:chat:${session.user.email}`, 0, -1);
    if (!chats.length) {
        return redirect("/");
    }
    const pipeline = kv.pipeline();

    for (const chat of chats) {
        pipeline.del(chat);
        pipeline.zrem(`user:chat:${session.user.email}`, chat);
    }

    await pipeline.exec();

    revalidatePath("/");
    return redirect("/");
}

export async function getSharedChat(id: string) {
    const chat = await kv.hgetall(`chat:${id}`);

    if (!chat || !chat.sharePath) {
        return null;
    }

    return chat as Chat;
}

export async function shareChat(chat: Chat) {
    const session = await auth();

    if (!session?.user?.email || session.user.email !== chat.userId) {
        return {
            error: "Unauthorized",
        };
    }

    const payload = {
        ...chat,
        sharePath: `/share/${chat.id}`,
    };

    await kv.hmset(`chat:${chat.id}`, payload);

    return payload;
}


export async function getAllDocs() {
    // JSON is not supported by this Redis library!!!
    try {
        // get record with all keys
        const docs: string[] = await kv.zrange('memra-documents', 0, -1);

        let doc_list: DocumentInfo[] = []
        // get all values for each key
        for (const doc of docs) {
            const key = `${doc}:all_keys`;
            // raw call to redis
            const doc_json = await kv.call('JSON.GET', key);

            if (doc_json) {
                const doc_parsed = JSON.parse(doc_json as string) as DocumentInfo;
                doc_list.push(doc_parsed);
            }
        }

        return doc_list;
    } catch (error) {
        return [];
    }
}