"use client";

import { useEffect, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, usePublicClient, useSimulateContract, useWaitForTransactionReceipt, useWatchContractEvent, useWriteContract } from "wagmi"
import { useQuery } from "@tanstack/react-query";
import { Presets, Client } from "userop";
import MessageHistory from "@/components/MessageHistory";
import SendMessage from "@/components/SendMessage";
import { useEthersSigner } from "@/lib/ethers";
import { chatABI } from "@/utils/chatABI";
import { encodeFunctionData } from "viem";
import { SimpleAccount } from "userop/dist/preset/builder";

const rpcUrl ="https://api.stackup.sh/v1/node/efd52693d7efae21f4553c36b22338ff1460f22f838024c5182ac729678e0973";
const paymasterUrl = `https://api.stackup.sh/v1/paymaster/${process.env.NEXT_PUBLIC_STACKUP_PAYMASTER}`; // Optional - you can get one at https://app.stackup.sh/


export default function Stackup() {
  const [ connectedAddress, setConnectedAddress ] = useState<`0x${string}` | undefined>("0x");
  const [ useSmartWallet, setUseSmartWallet ] = useState<boolean>();
  const [ builder, setBuilder ] = useState<SimpleAccount>(); 
  const { writeContract } = useWriteContract();
  const { address } = useAccount();
  const signer = useEthersSigner();
  const ca = `0x${process.env.NEXT_PUBLIC_CONTRACT_ADDRESS}` as const || `0x${""}` as const;
  let txhash;

  const publicClient1 = usePublicClient();

  useEffect(() => {
    console.log(useSmartWallet, signer);
    if (useSmartWallet && signer) {
      setConnectedAddress(undefined);
      const paymasterContext = { type: "payg" };
      const paymasterMiddleware = Presets.Middleware.verifyingPaymaster(
        paymasterUrl,
        paymasterContext
      );
      const opts = paymasterUrl === "" ? {} : {
        paymasterMiddleware: paymasterMiddleware,
      }

      // Initialize the account
      Presets.Builder.SimpleAccount.init(signer, rpcUrl, opts).then(builder => {
        const smartWalletAddress = builder.getSender();
        console.log(`Account address: ${address} with smart wallet address: ${smartWalletAddress}`);
        setConnectedAddress(smartWalletAddress as `0x${string}`);
        setBuilder(builder);
      })

    } else {
      setConnectedAddress(address);
    }
  }, [useSmartWallet, address, signer]);

  const [message, setMessage] = useState<string>("");

  const { data } = useSimulateContract({
    address: ca,
    abi: chatABI,
    functionName: "sendMessage",
    args: [message]
})

function sendMessage() {
    if (message && message.length > 0) {
      if (useSmartWallet) {
        if (builder) {
          console.log("Sponsored by Paymaster. ERC-4337 is fun!");

          // Encode the calls
          const callTo = [ca];
          const data = encodeFunctionData({
            abi: chatABI,
            functionName: "sendMessage",
            args: [message],
          });
          const callData = [data];
  
          // Send the User Operation to the ERC-4337 mempool
          Client.init(rpcUrl).then(async client => {
            const res = await client.sendUserOperation(builder.executeBatch(callTo, callData), {
              onBuild: (op) => console.log("Signed UserOperation:", op),
            });
            // Return receipt
            console.log(`UserOpHash: ${res.userOpHash}`);
            console.log("Waiting for transaction...");
            const ev = await res.wait();
            console.log(`Transaction hash: ${ev?.transactionHash ?? null}`);
            console.log(`View here: https://jiffyscan.xyz/userOpHash/${res.userOpHash}`);
          });
  
        }
      } else {
        console.log("Writing through EOA...")
        txhash = writeContract(data!.request);
        console.log("Tx hash: ", txhash);
      }
    }
}

const { data: txdata, isLoading, isSuccess } = useWaitForTransactionReceipt({
  hash: txhash,
})


  return (
    <main className="container max-w-xl mx-auto">
      <div className="flex flex-col h-screen justify-between gap-5">
        <div className="py-5 flex items-center justify-between">
          <ConnectButton />
          <div>
            <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={useSmartWallet} className="sr-only peer" onChange={(e) => {setUseSmartWallet(!useSmartWallet)}} />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">Smart Wallet</span>
            </label>
          </div>
        </div>
        <div className="flex justify-between items-center">
            Account: {connectedAddress}
        </div>
        <MessageHistory address={connectedAddress} />
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
      </div>
    </main>
  );
}
