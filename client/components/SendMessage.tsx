import { useState } from "react";
import { useSimulateContract, useWriteContract } from "wagmi";

import { chatABI } from "@/utils/chatABI";

export default function SendMessage() {
    const [message, setMessage] = useState<string>("");
    const { writeContract } = useWriteContract();

    const ca = `0x${process.env.NEXT_PUBLIC_CONTRACT_ADDRESS}` as const || `0x${""}` as const;

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
      <div className="flex w-full p-5 border-t-2">
        <input
          className="w-full text-gray-600 p-3 bg-gray-200 rounded-l-md focus:outline-none focus:placeholder-gray-300"
          type="text"
          onChange={(e) => { setMessage(e.target.value) }}
          onKeyDown={event => {
            if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
              sendMessage();
            }
          }}
          placeholder="Hi there..."
        />
        <button disabled={!Boolean(data?.request)} onClick={(e) => { e.preventDefault; sendMessage() }} type="button" className="px-4 py-3 bg-blue-500 rounded-r-lg hover:bg-blue-400 ease-in-out duration-500">📩</button>
      </div>
    );
}