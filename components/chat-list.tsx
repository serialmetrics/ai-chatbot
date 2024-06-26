import { type Message } from "ai";

import { Separator } from "@/components/ui/separator";
import { ChatMessage } from "@/components/chat-message";
import { ChatMessageMemra } from "./chat-message-memra";

export interface ChatList {
    messages: Message[];
    username: string;
}

export function ChatList({ messages, username }: ChatList) {
    if (!messages.length) {
        return null;
    }

    return (
        <div className="relative mx-auto max-w-2xl px-4">
            {messages.map((message, index) => {
                return (
                    <div key={index}>
                        {/* <ChatMessage message={message} username={username} /> */}
                        <ChatMessageMemra message={message} username={username} />
                        {index < messages.length - 1 && <Separator className="my-4 md:my-8" />}
                    </div>
                )
            })}
        </div>
    );
}
