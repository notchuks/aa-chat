import { Log } from "viem";
import { useEffect, useState } from "react";

import ChatMessage from "./ChatMessage";
import { chatABI } from "@/utils/chatABI";
import { publicClient } from "@/viem";
import ScrollableBox from "./ScrollableBox";

export default function MessageHistory() {
    const [messages, setMessages] = useState<Log[]>();
    const ca = `0x${process.env.NEXT_PUBLIC_CONTRACT_ADDRESS}` as const || `0x${""}` as const;

    // Fetch Messages when page loads
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

    // Listen to contract events and append new messages
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

    return (
        // <div className="flex flex-col gap-2 w-full"></div>
        <ScrollableBox className="flex flex-col py-5 px-2 w-full h-full overflow-y-auto scrollbar-thumb-blue scrollbar-track-blue scrollbar-w-2 scrollbar-track-blue-lighter scrolling-touch">
            {messages?.map((logmsg, i) => <ChatMessage key={i} address={logmsg.args.sender} message={logmsg.args.message}/>)}
        </ScrollableBox>
    );
}