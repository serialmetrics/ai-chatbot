import { Metadata, Viewport } from "next";

import { Toaster } from "react-hot-toast";

import "@/app/globals.css";
import { fontMono, fontSans } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { TailwindIndicator } from "@/components/tailwind-indicator";
import { Providers } from "@/components/providers";
import { Header } from "@/components/header";
import { getServerSession } from "next-auth";
import SessionProvider from "@/components/session-provider";

export const metadata: Metadata = {
    metadataBase: new URL(process.env.APP_ROOT_URL || "http://localhost:3000"),
    title: {
        default: "Memra Chatbot",
        template: `%s - Memra Chatbot`,
    },
    description: "An AI-powered chatbot from Memra.",
    icons: {
        icon: "/favicon.ico",
        shortcut: "/favicon-16x16.png",
        apple: "/apple-touch-icon.png",
    },
};

export const viewport: Viewport = {
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "white" },
        { media: "(prefers-color-scheme: dark)", color: "black" },
    ]
}

interface RootLayoutProps {
    children: React.ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
    const session = await getServerSession();
    return (
        <html lang="en" suppressHydrationWarning>
            <head />
            <body className={cn("font-sans antialiased", fontSans.variable, fontMono.variable)}>
                <SessionProvider session={session}>
                    <Toaster />
                    <Providers attribute="class" defaultTheme="system" enableSystem>
                        <div className="flex flex-col min-h-screen">
                            {/* @ts-ignore */}
                            <Header />
                            <main className="flex flex-col flex-1 bg-muted/50">{children}</main>
                        </div>
                        <TailwindIndicator />
                    </Providers>
                </SessionProvider>
            </body>
        </html>
    );
}
