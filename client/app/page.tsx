"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import { publicClient, walletClient } from "../viem";
import { chatABI } from "../utils/chatABI"
import { getContract, Log } from "viem";
import { useSimulateContract, useWatchContractEvent, useWriteContract } from "wagmi"
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

export default function Home() {
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<Log[]>();
  const [wallet, setWallet] = useState<`0x${string}`>(`0x${""}`);
  
  const { writeContract } = useWriteContract();
  const ca = `0x${process.env.NEXT_PUBLIC_CONTRACT_ADDRESS}` as const || `0x${""}` as const;

  const contract = getContract({
    address: ca,
    abi: chatABI,
    client: { public: publicClient, wallet: walletClient },
  })

  // use React Query
  // const { isPending, error, data: datarq } = useQuery({
  //   queryKey: ["messages"],
  //   queryFn: () => {

  //   }
  // })

  useEffect(() => {
    async function fetchData() {
      const [wallet] = await walletClient.getAddresses();
      setWallet(wallet);
      setMessages([]);
      try {
        const messages = await publicClient.getContractEvents({
          address: ca,
          abi: chatABI,
          eventName: "Message",
          fromBlock: BigInt(0),
          toBlock: 'latest',
        });
        console.log(messages);
        setMessages(messages);
      } catch (e) {
        console.log(e);
      }
    }

    fetchData();
  }, [ca]);

  const unwatch = publicClient.watchContractEvent({
    address: ca,
    abi: chatABI,
    eventName: "Message",
    onLogs: logs => {
      console.log("New message:", logs);
      setMessages(oldMessages => {
        return oldMessages ? [ ...oldMessages, ...logs ] : logs
      })
    }
  })

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

  async function sendMessage() {
    const { request } = await publicClient.simulateContract({
      address: ca,
      abi: chatABI,
      functionName: "sendMessage",
      args: [message],
      account: wallet
    })
    if (message && message.length > 0) {
      console.log("Writing message to contract...")
      await walletClient.writeContract(request)
      // writeContract(data!.request)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <ConnectButton />
      <div>{messages?.map((logmsg, i) => <div key={i}>{logmsg.args.sender} - {logmsg.args.message}</div>)}</div>
      <div>
        <input className="text-black" type="text" onChange={(e) => {setMessage(e.target.value)}} placeholder="Hi there..." />
        <button disabled={!Boolean(data?.request)} onClick={(e) => {e.preventDefault; sendMessage()}} type="button">📩</button>
      </div>
    </main>
  );
}
