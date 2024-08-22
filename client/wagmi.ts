import { getDefaultConfig, Chain } from '@rainbow-me/rainbowkit';
import { http, useClient, useConnectorClient } from 'wagmi'; // useClient & useConnectorClient are the PublicClient and walletCLient equivalent in wagmi
import {
  arbitrum,
  base,
  mainnet,
  optimism,
  polygon,
  sepolia,
  goerli,
} from 'wagmi/chains';

// Your WalletConnect Cloud project ID
export const projectId = 'dfbe3a98e11f00130418bae635b5d95b'

const anvil = {
  id: 31_337,
  name: "Anvil Local",
  nativeCurrency: {
      decimals: 18,
      name: "tETH",
      symbol: "tETH"
  },
  rpcUrls: {
      public: { http: ["http://localhost:8545"]},
      default: { http: ["http://localhost:8545"]},
  },
  testnet: true
} as const satisfies Chain;

export const config = getDefaultConfig({
  appName: 'aa-chat',
  projectId,
  chains: [
    anvil,
  ],
  transports: {
    [anvil.id]: http("http://127.0.0.1:8545"),
  },
  ssr: true,
  syncConnectedChain: true,
});