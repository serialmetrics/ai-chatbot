import { type Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { getChat } from "@/app/actions";
import { Chat } from "@/components/chat";
import { getServerSession } from "next-auth";

export const preferredRegion = "home";

export interface ChatPageProps {
    params: {
        id: string;
    };
}

export async function generateMetadata({ params }: ChatPageProps): Promise<Metadata> {
    const session = await auth();

    if (!session?.user) {
        return {};
    }

    const chat = await getChat(params.id, session.user.email as string);
    return {
        title: chat?.title.toString().slice(0, 50) ?? "Chat",
    };
}

export default async function ChatPage({ params }: ChatPageProps) {
    console.log('chat')
    // const session = await auth();
    const session = await getServerSession()
    console.log('session:', session)

    if (!session?.user) {
        redirect(`/sign-in?next=/chat/${params.id}`);
    }

    const chat = await getChat(params.id, session.user.email as string);

    if (!chat) {
        notFound();
    }

    if (chat?.userId !== session?.user?.email) {
        notFound();
    }

    return <Chat id={chat.id} initialMessages={chat.messages} />;
}
