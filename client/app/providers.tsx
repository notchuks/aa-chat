'use client';

import * as React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';

import { config as alchemyConfig } from "@/config";
import { AlchemyClientState } from "@account-kit/core";
import { AlchemyAccountProvider } from "@account-kit/react";
import { PropsWithChildren } from "react";

import { config } from '../wagmi';

const queryClient = new QueryClient();

export function Providers(props: PropsWithChildren<{ initialState?: AlchemyClientState }>) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <AlchemyAccountProvider
          config={alchemyConfig}
          queryClient={queryClient}
        >
          <RainbowKitProvider>{props.children}</RainbowKitProvider>
        </AlchemyAccountProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}