import kv from "lib/redis";

import { nanoid } from "@/lib/utils";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { StreamingTextResponse } from "ai";
import { JustinaCallbacks, JustinaChatStream } from "@/lib/justina";
import { get_title_from_openai } from "@/lib/openai-title";


export async function POST(req: Request) {
    const { id, messages, base_key } = await req.json();
    const session = await getServerSession(authOptions);
    const user_email = session?.user.email;


    if (!user_email) {
        return new Response('Unauthorized', {
            status: 401
        })
    }

    const cb: JustinaCallbacks = {
        onStart: async () => {
            console.log('Stream started');
        },
        onToken: (token: any) => {
            if (token.startsWith("json:")) {
                const parsed = JSON.parse(token.split("json:")[1]);
                return parsed.choices[0].delta.content;
            }
            return token;
        },
        async onCompletion(completion) {
            const title = await get_title_from_openai(messages);
            const id = nanoid();
            const createdAt = Date.now();
            const path = `/chat/${id}`;
            const payload = {
                id,
                title,
                user_email,
                createdAt,
                path,
                messages: JSON.stringify([
                    ...messages,
                    {
                        content: completion,
                        role: "assistant",
                    },
                ]),
            };
            await kv.hmset(`chat:${id}`, payload);
            await kv.zadd(
                `user:chat:${user_email}`,
                createdAt,
                `chat:${id}`,
            );
        },
    }
    const stream = await JustinaChatStream({ id, messages, base_key, cb });
    return new StreamingTextResponse(stream);
}