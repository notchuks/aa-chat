import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from './providers';
import { config } from "@/config";
import { cookieToInitialState } from "@account-kit/core";
import { headers } from "next/headers";
import "./globals.css";

import '@rainbow-me/rainbowkit/styles.css';
import "./globals.css";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Decentralized Account Abstraction Messaging App",
  description: "Built with Nextjs, Typescript, Wagmi, Viem, Alchemy AccountKit, Candide Atelier and Stackup.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Persist state across pages
  // https://accountkit.alchemy.com/react/ssr#persisting-the-account-state
  const initialState = cookieToInitialState(
    config,
    headers().get("cookie") ?? undefined
  );

  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers initialState={initialState} >{children}</Providers>
      </body>
    </html>
  );
}
