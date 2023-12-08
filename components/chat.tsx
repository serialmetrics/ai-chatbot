'use client'

import { useChat, type Message } from 'ai/react'

import { cn } from '@/lib/utils'
import { ChatList } from '@/components/chat-list'
import { ChatPanel } from '@/components/chat-panel'
import { EmptyScreen } from '@/components/empty-screen'
import { ChatScrollAnchor } from '@/components/chat-scroll-anchor'
import { toast } from 'react-hot-toast'

export interface ChatProps extends React.ComponentProps<'div'> {
    initialMessages?: Message[]
    id?: string
}

export function Chat({ id, initialMessages, className }: ChatProps) {

    const doc_key = process.env.JUSTINA_DOC_KEY ?? 'JUSTINA_DOC_KEY';
    function getDocKey() {
        if (typeof window === 'undefined') {
            return;
        }
        const key = window.localStorage.getItem(doc_key);
        return key;
    };

    const { messages, append, reload, stop, setMessages, isLoading, input, setInput } =
        useChat({
            initialMessages,
            id,
            body: {
                id,
                base_key: getDocKey(),
            },
            onResponse(response) {
                if (response.status === 401) {
                    toast.error(response.statusText)
                }
            },
        });
        
    return (
        <>
            <div className={cn('pb-[200px] pt-4 md:pt-10', className)}>
                {messages.length ? (
                    <>
                        <ChatList messages={messages} />
                        <ChatScrollAnchor trackVisibility={isLoading} />
                    </>
                ) : (
                    <EmptyScreen setInput={setInput} />
                )}
            </div>
            <ChatPanel
                id={id}
                isLoading={isLoading}
                stop={stop}
                append={append}
                reload={reload}
                messages={messages}
                input={input}
                setInput={setInput}
            />
        </>
    )
}
