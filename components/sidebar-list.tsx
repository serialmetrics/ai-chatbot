"use client";
import { getChats, removeChat, shareChat } from "@/app/actions";
import { SidebarActions } from "@/components/sidebar-actions";
import { SidebarItem } from "@/components/sidebar-item";
import { Chat } from "@/lib/types";

export interface SidebarListProps {
    userId?: string;
}

const getAllChats = async () => {
    try {
        const response = await fetch("/api/chat/getall"); // Replace with your actual API route path
        if (response.ok) {
            const result = await response.json();
            return result;
        } else {
            console.error("Failed to fetch data from the API");
        }
    } catch (error) {
        console.error("Error fetching data:", error);
    }
};

export async function SidebarList({ userId }: SidebarListProps) {
    const chats = (await getAllChats()) as Chat[];

    return (
        <div className="flex-1 overflow-auto">
            {chats?.length ? (
                <div className="space-y-2 px-2">
                    {chats.map(
                        (chat) =>
                            chat && (
                                <SidebarItem key={chat?.id} chat={chat}>
                                    <SidebarActions
                                        chat={chat}
                                        removeChat={removeChat}
                                        shareChat={shareChat}
                                    />
                                </SidebarItem>
                            )
                    )}
                </div>
            ) : (
                <div className="p-8 text-center">
                    <p className="text-sm text-muted-foreground">No chat history</p>
                </div>
            )}
        </div>
    );
}
