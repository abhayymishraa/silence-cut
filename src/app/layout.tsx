import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { Providers } from "~/components/Providers";

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
  // Get workspace headers from the server component
  const headers = {
    id: process.env.NODE_ENV === 'development' ? 'default' : '',
    slug: process.env.NODE_ENV === 'development' ? 'default' : '',
    name: process.env.NODE_ENV === 'development' ? 'Default Workspace' : '',
    color: process.env.NODE_ENV === 'development' ? '#3b82f6' : '',
    logo: process.env.NODE_ENV === 'development' ? '' : '',
  };

  return (
    <html lang="en" className={`${geist.variable}`}>
      <head>
        <meta name="x-workspace-id" content={headers.id} />
        <meta name="x-workspace-slug" content={headers.slug} />
        <meta name="x-workspace-name" content={headers.name} />
        <meta name="x-workspace-color" content={headers.color} />
        <meta name="x-workspace-logo" content={headers.logo} />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
