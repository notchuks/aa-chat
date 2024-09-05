import { Log } from "viem";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

import ChatMessage from "./ChatMessage";
import { chatABI } from "@/utils/chatABI";
import { publicClient } from "@/viem";
import ScrollableBox from "./ScrollableBox";
import { Message } from "@/lib/types/Message";

export default function MessageHistory({ address, pendingMessage, pendingIcon, SetPendingMessage }: { address?: `0x${string}` | undefined, pendingMessage?: Message, pendingIcon?: string, SetPendingMessage?: Dispatch<SetStateAction<Message | undefined>> }) {
    const [messages, setMessages] = useState<Message[]>();
    const ca = `0x${process.env.NEXT_PUBLIC_CONTRACT_ADDRESS}` as const || `0x${""}` as const;

    // Fetch Messages when page loads
    useEffect(() => {
        async function fetchData() {
          setMessages([]);
          try {
            const blockNumber = await publicClient.getBlockNumber();
            const messages = await publicClient.getContractEvents({
              address: ca,
              abi: chatABI,
              eventName: "Message",
              fromBlock: blockNumber - BigInt(50000),
              toBlock: 'latest',
            });
            // console.log(messages);
            setMessages(messages as Message[]);
          } catch (e) {
            // console.log(e);
          }
        }
    
        fetchData();
      }, [ca]);

    // Listen to contract events and append new messages
    useEffect(() => {
    // const unwatch = publicClient.watchContractEvent
    const unwatch = publicClient.watchContractEvent({
        address: ca,
        abi: chatABI,
        eventName: "Message",
        onLogs: logs => {
        // console.log("I Got a new message!");
        console.log({logs, pendingMessage, SetPendingMessage});
        if(pendingMessage !== undefined && SetPendingMessage !== undefined) {
          for (let i = 0; i < logs.length; i++) {
            if (
              logs[i].args.message == pendingMessage.args.message &&
              logs[i].args.sender == pendingMessage.args.sender) {
                SetPendingMessage(undefined)
              } else {
                console.log({ logs, pendingMessage })
              }
          }
        } else {
          console.log({ logs, pendingMessage })
        }
        setMessages(oldMessages => {
            return oldMessages ? [ ...oldMessages, ...logs as Message[] ] : logs as Message[]
        })
        }
    })
    
    return () => {
        unwatch();
    }
    }, [ca])

    return (
        // <div className="flex flex-col gap-2 w-full"></div>
        <ScrollableBox className="flex flex-col py-5 px-2 w-full h-full overflow-y-auto scrollbar-thumb-blue scrollbar-track-blue scrollbar-w-2 scrollbar-track-blue-lighter scrolling-touch">
            {messages?.map((logmsg, i) => <ChatMessage key={i} address={logmsg.args.sender} connectedAddress={address} message={logmsg.args.message}/>)}
            {pendingMessage && <div className="flex flex-row items-center w-full justify-end"><span className="p-3">{pendingIcon}</span> <ChatMessage address={pendingMessage.args.sender} message={pendingMessage.args.message} connectedAddress={address} /></div>}
        </ScrollableBox>
    );
}