import { createPublicClient, createWalletClient, custom, defineChain, EIP1193Provider, http } from "viem";
import { goerli, holesky, sepolia } from "viem/chains";

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
    chain: sepolia,
    transport: http("https://eth-sepolia.g.alchemy.com/v2/8f3L7dOU056NQW42iuO2KyK0yELh7s0q"), // sepolia alchemy rpc url(incomplete) - https://eth-sepolia.g.alchemy.com/v2/8f3L7dOU0
});

// approved workaround for window object undefined when page loads initially
const noopProvider = { request: () => null } as unknown as EIP1193Provider;
const provider = typeof window !== 'undefined' ? window.ethereum! : noopProvider;

// Metamask
export const walletClient = createWalletClient({
    chain: sepolia,
    transport: custom(provider)
})
