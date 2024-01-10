"use client";
// Inspired by Chatbot-UI and modified to fit the needs of this project
// @see https://github.com/mckaywrigley/chatbot-ui/blob/main/components/Chat/ChatMessage.tsx

import { Message } from 'ai'
import remarkGfm from 'remark-gfm'
// import remarkMath from 'remark-math'

import { cn } from '@/lib/utils'
import { CodeBlock } from '@/components/ui/codeblock'
import { MemoizedReactMarkdown } from '@/components/markdown'
// import { IconUser } from '@/components/ui/icons'
import { ChatMessageActions } from '@/components/chat-message-actions'
import MemraIcon from './memra-icon'
import IconUserName from './username-icon'
import { FileCheck2, Link, SpaceIcon, TextCursorIcon } from 'lucide-react'
import { useLocalStorage } from '@/lib/hooks/use-local-storage'


export interface ChatMessageProps {
    message: Message
    username: string
}

interface SearchData {
    document_id: string
    document_title: string
    filename: string
    content: string
    citation: string
}

interface SearchResultsMessage {
    answer: string
    search_data: SearchData[]
    source_info: string | null
}

interface MemraResponse {
    type: string
    ts: number
    status: string
    data: SearchResultsMessage | string | null
}

interface MarkdownProps {
    mdtext: string
}

const Markdown = ({ mdtext, ...props }: MarkdownProps) => {
    return (
        <>
            <MemoizedReactMarkdown
                className="prose break-words dark:prose-invert prose-p:leading-relaxed prose-pre:p-0"
                remarkPlugins={[remarkGfm]}
                components={{
                    p({ children }) {
                        return <p className="mb-2 last:mb-0">{children}</p>
                    },
                    code({ node, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || '')

                        return (
                            <CodeBlock
                                key={Math.random()}
                                language={(match && match[1]) || ''}
                                value={String(children).replace(/\n$/, '')}
                                {...props}
                            />
                        )
                    }
                }}
            >
                {mdtext}
            </MemoizedReactMarkdown>
        </>
    )
}

interface SetCurrentDocumentLinkProps {
    text: string
    documentId: string
}
const SetCurrentDocumentLink = ({ text, documentId, ...props }: SetCurrentDocumentLinkProps) => {
    const doc_key = process.env.JUSTINA_DOC_KEY ?? 'JUSTINA_DOC_KEY';
    const [, setCurrentDocumentId] = useLocalStorageWatcher(doc_key, "==NODOC==");

    const handleClick = () => {
        setCurrentDocumentId(documentId);
    };

    return (
        <>
            <a href="#"
                className='text-blue-400 hover:underline cursor-pointer text-xl'
                onClick={handleClick}
                {...props}
            >
                <FileCheck2 className='text-primary w-4 h-4 inline mr-1' />
                {text}
            </a>
        </>
    );
};

interface SearchResultsMessageProps {
    search_results: SearchResultsMessage
}

const SearchResultsMessage = ({ search_results, ...props }: SearchResultsMessageProps) => {
    const { answer, search_data } = search_results;
    if (search_data.length === 0) return <Markdown mdtext={answer} {...props} />;

    const doc_key = process.env.JUSTINA_DOC_KEY ?? 'JUSTINA_DOC_KEY';
    const [currentDocument, setCurrentDocument] = useLocalStorageWatcher(doc_key, "==NODOC==");

    return (
        <>
            <Markdown mdtext={answer} {...props} />
            <div>Found {search_data.length} {search_data.length === 1 ? 'source' : 'sources'}</div>
            {search_data.map((search_result, index) => {
                const { document_id, document_title, filename, citation } = search_result;
                return (
                    <div key={index}>
                        <SetCurrentDocumentLink
                            text={document_title}
                            documentId={document_id}
                        />
                        <br />
                        <div className='text-gray-500 text-xs italic'>{filename.split('/').pop()}</div>
                        <div className="mb-8">
                            <Markdown mdtext={citation} {...props} />
                        </div>
                    </div>
                )
            })}
        </>
    )
}

import React from 'react'
import { useLocalStorageWatcher } from '@/hooks/use-localstorage-watcher'

export const ProgressMessage = ({ message }: { message: string }) => {
    // return message with blinking cursor
    return (
        <div className='text-sm'>{message.replace('...', '')}<SpaceIcon className='text-primary w-3 h-3 inline blinking-cursor ml-1' /></div>
    )
}

interface MemraMessageProps {
    message: Message
}

const MemraMessage = ({ message, ...props }: MemraMessageProps) => {
    let got_json = null;
    let parts = message.content.trim().split('\n');
    const last_part = parts[parts.length - 1];
    try {
        got_json = JSON.parse(last_part);
    } catch (e) {
        // console.error(e);
    }
    if (!!got_json) {
        if (got_json.status === "final") {
            const { answer, source_info, search_data } = got_json.data as SearchResultsMessage;
            if (search_data) {
                return <SearchResultsMessage search_results={got_json.data} />
            }
            return (
                <Markdown mdtext={`${answer}\n\n${source_info || ''}`} {...props} />
            );
        }
        if (got_json.status === "progress") return <ProgressMessage message={got_json.data as string} />;
    }

    return (
        <div>oops...</div>
    )
}


export function ChatMessageMemra({ message, username, ...props }: ChatMessageProps) {
    return (
        <div
            className={cn('group relative mb-4 flex items-start md:-ml-12')}
            {...props}
        >
            <div
                className={cn(
                    'flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border shadow',
                    message.role === 'user'
                        ? 'bg-background'
                        : 'bg-primary text-primary-foreground'
                )}
            >
                {message.role === 'user' ? <IconUserName username={username} /> : <MemraIcon />}
            </div>
            <div className="flex-1 px-1 ml-4 space-y-2 overflow-hidden">
                {(message.role === 'assistant' && message.content.lastIndexOf("justina-msg") > -1) ? (
                    <MemraMessage message={message} />
                ) : (
                    <Markdown mdtext={message.content} {...props} />
                )}
                <ChatMessageActions message={message} />
            </div>
        </div>
    )
}
