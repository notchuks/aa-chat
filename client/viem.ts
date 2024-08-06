import { createPublicClient, createWalletClient, custom, defineChain, http } from "viem";
import { goerli, sepolia } from "viem/chains";

export const anvil = defineChain({
    id: 31_337,
    name: "Anvil Local",
    nativeCurrency: {
        decimals: 18,
        name: "tETH",
        symbol: "tETH"
    },
    rpcUrls: {
        public: { http: ["http://localhost:8545"] },
        default: { http: ["http://localhost:8545"] },
    },
    testnet: true
})

export const publicClient = createPublicClient({
    chain: anvil,
    transport: http("http://localhost:8545"), // sepolia alchemy rpc url(incomplete) - https://eth-sepolia.g.alchemy.com/v2/8f3L7dOU0
});

// approved workaround for 

export const walletClient = createWalletClient({
    chain: anvil,
    transport: custom(window.ethereum!)
})
