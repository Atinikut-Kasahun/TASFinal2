import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
    title: "Droga Group Hiring Hub",
    description:
        "Join a team of innovators, creators, and problem-solvers who are redefining what's possible in healthcare and technology.",
    themeColor: "#FDF22F",
    icons: {
        icon: "/favicon.png",
    }
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={inter.variable} suppressHydrationWarning>
            <body className="font-inter antialiased" suppressHydrationWarning>
                {children}
                <Script src="https://accounts.google.com/gsi/client" strategy="beforeInteractive" />
            </body>
        </html>
    );
}
