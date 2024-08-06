import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import { publicClient, walletClient } from "../viem";
import { chatABI } from "../utils/chatABI"
import { getContract } from "viem";

export default async function Home() {
  const ca = `0x${process.env.NEXT_PUBLIC_CONTRACT_ADDRESS}` as const || `0x${""}` as const;
  console.log(ca);
  const contract = getContract({
    address: ca,
    abi: chatABI,
    client: { public: publicClient, wallet: walletClient },
  })

  const [address] = await walletClient.getAddresses()
  console.log(address);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <ConnectButton />
    </main>
  );
}
