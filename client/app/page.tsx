"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, usePublicClient, useSimulateContract, useWatchContractEvent, useWriteContract } from "wagmi"
import { useQuery } from "@tanstack/react-query";
import MessageHistory from "@/components/MessageHistory";
import SendMessage from "@/components/SendMessage";

export default function Home() {
  const publicClient1 = usePublicClient();
  const { address } = useAccount()

  // use React Query
  const { isPending, error, data: dataq } = useQuery({
    queryKey: ["messages"],
    queryFn: () => {

    }
  })


  return (
    <main className="container max-w-xl mx-auto">
      <div className="flex flex-col h-screen justify-between gap-5">
        <div className="py-5 flex items-center justify-between">
          <ConnectButton />
        </div>
        <MessageHistory address={address} />
        <SendMessage />
      </div>
    </main>
  );
}
