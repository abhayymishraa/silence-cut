import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { Providers } from "~/components/Providers";
import { WorkspaceMetaUpdater } from "~/components/WorkspaceMetaUpdater";

export const metadata: Metadata = {
  title: "Video Processor - Remove Silence from Videos",
  description: "AI-powered video silence removal tool for content creators",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <head>
        <meta name="x-workspace-id" content="" />
        <meta name="x-workspace-slug" content="" />
        <meta name="x-workspace-name" content="" />
        <meta name="x-workspace-color" content="" />
        <meta name="x-workspace-logo" content="" />
        <meta name="x-workspace-custom-domain" content="" />
      </head>
      <body>
        <WorkspaceMetaUpdater />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
