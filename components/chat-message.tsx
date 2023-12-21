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

function format_search_data(search_data: SearchData[] | null) {
    if (!search_data) return "No search results";
    if (search_data.length === 0) return "No search results";
    let output = "";
    for (const search_result of search_data) {
        const { document_id, document_title, filename, content } = search_result;
        output += `[**${document_title}**](${document_id})\n\n*${filename.split('/').pop()}*\n\n${content}\n\n\n`;
    }
    return output;
}



export function ChatMessage({ message, username, ...props }: ChatMessageProps) {
    const justinaMsg = (message: Message): string => {
        if (message.role === 'assistant' && message.content.lastIndexOf("justina-msg") > -1) {
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
                    console.log(got_json);
                    const { answer, source_info, search_data } = got_json.data;
                    if (search_data) {
                        return `${answer}\n\n${format_search_data(search_data)}`;
                    }
                    return `${answer}\n\n${source_info || ''}`;
                }
                if (got_json.status === "progress") return `*${got_json.data}*`;
            }
        }
        return message.content;
    }
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
                <MemoizedReactMarkdown
                    className="prose break-words dark:prose-invert prose-p:leading-relaxed prose-pre:p-0"
                    remarkPlugins={[remarkGfm]}
                    components={{
                        p({ children }) {
                            return <p className="mb-2 last:mb-0">{children}</p>
                        },
                        code({ node, inline, className, children, ...props }) {
                            // if (children.length) {
                            //     if (children[0] == '▍') {
                            //         return (
                            //             <span className="mt-1 cursor-default animate-pulse">▍</span>
                            //         )
                            //     }

                            //     children[0] = (children[0] as string).replace('`▍`', '▍')
                            // }

                            const match = /language-(\w+)/.exec(className || '')

                            if (inline) {
                                return (
                                    <code className={className} {...props}>
                                        {children}
                                    </code>
                                )
                            }

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
                    {justinaMsg(message)}
                </MemoizedReactMarkdown>
                <ChatMessageActions message={message} />
            </div>
        </div>
    )
}
