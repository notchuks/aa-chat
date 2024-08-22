"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import { publicClient, walletClient } from "../viem";
import { chatABI } from "../utils/chatABI"
import { getContract, Log } from "viem";
import { usePublicClient, useSimulateContract, useWatchContractEvent, useWriteContract } from "wagmi"
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import JazziconImage from "@/components/JazzIconImage";
import ChatMessage from "@/components/ChatMessage";
import MessageHistory from "@/components/MessageHistory";
import SendMessage from "@/components/SendMessage";

export default function Home() {
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<Log[]>();
  const publicClient1 = usePublicClient();
  
  const { writeContract } = useWriteContract();
  const ca = `0x${process.env.NEXT_PUBLIC_CONTRACT_ADDRESS}` as const || `0x${""}` as const;

  const contract = getContract({
    address: ca,
    abi: chatABI,
    client: { public: publicClient, wallet: walletClient },
  })

  // use React Query
  const { isPending, error, data: dataq } = useQuery({
    queryKey: ["messages"],
    queryFn: () => {

    }
  })

  useEffect(() => {
    async function fetchData() {
      setMessages([]);
      try {
        const messages = await publicClient.getContractEvents({
          address: ca,
          abi: chatABI,
          eventName: "Message",
          fromBlock: BigInt(0),
          toBlock: 'latest',
        });
        // console.log(messages);
        setMessages(messages);
      } catch (e) {
        // console.log(e);
      }
    }

    fetchData();
  }, [ca]);

  useEffect(() => {
  // const unwatch = publicClient.watchContractEvent
  const unwatch = publicClient.watchContractEvent({
    address: ca,
    abi: chatABI,
    eventName: "Message",
    onLogs: logs => {
      // console.log("I Got a new message!");
      setMessages(oldMessages => {
        return oldMessages ? [ ...oldMessages, ...logs ] : logs
      })
    }
  })

  return () => {
    unwatch();
  }
  }, [ca])

  // Lets try this with goerli or sepolia later
  // const addresses = await walletClient.requestAddresses()
  // console.log(addresses);

  // Using Wagmi to send message
  const { data } = useSimulateContract({
    address: ca,
    abi: chatABI,
    functionName: "sendMessage",
    args: [message]
  })

  function sendMessage() {
    if (message && message.length > 0) {
      console.log("Writing message to contract...")
      writeContract(data!.request)
    }
  }

  return (
    <main className="container max-w-xl mx-auto">
      <div className="flex flex-col h-screen justify-between gap-5">
        <div className="py-5 flex items-center justify-between">
          <ConnectButton />
        </div>
        <MessageHistory />
        <SendMessage />
      </div>
    </main>
  );
}
