import { createAlchemySmartAccountClient, sepolia } from "@account-kit/infra";
import { createLightAccount } from "@account-kit/smart-contracts";
import { WalletClientSigner } from "@aa-sdk/core";
import { http } from "viem";
import { walletClient } from "@/viem";

const signer = new WalletClientSigner(walletClient, "wallet");

export const account = await createLightAccount({
    chain: sepolia,
    transport: http(`${sepolia.rpcUrls.alchemy.http[0]}/8f3L7dOU056NQW42iuO2KyK0yELh7s0q`),
    signer, // : LocalAccountSigner.privateKeyToAccountSigner(generatePrivateKey())
});
 
export const client = createAlchemySmartAccountClient({
  apiKey: "ssWRhiITBLQgQ6It6hLo6kRMJDr5np_t",
  policyId: "72a4a5cc-44a9-44c4-a6df-128cc742d373",
  chain: sepolia,
  account,
});

/*
import { createAlchemySmartAccountClient, sepolia } from "@account-kit/infra";
import { createLightAccount } from "@account-kit/smart-contracts";
// You can replace this with any signer you'd like
// We're using a LocalAccountSigner to generate a local key to sign with
import { LocalAccountSigner, WalletClientSigner } from "@aa-sdk/core";
import { http } from "viem";
import { generatePrivateKey } from "viem/accounts";
import { walletClient } from "@/viem";

const signer = new WalletClientSigner(walletClient, "wallet");

export const account = await createLightAccount({
    chain: sepolia,
    transport: http(`${sepolia.rpcUrls.alchemy.http[0]}/8f3L7dOU056NQW42iuO2KyK0yELh7s0q`),
    signer, // : LocalAccountSigner.privateKeyToAccountSigner(generatePrivateKey())
});
 
export const client = createAlchemySmartAccountClient({
  apiKey: "ssWRhiITBLQgQ6It6hLo6kRMJDr5np_t",
  policyId: "72a4a5cc-44a9-44c4-a6df-128cc742d373",
  chain: sepolia,
  account,
});
*/