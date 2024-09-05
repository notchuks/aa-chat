"use client";

import { createCallData, getFunctionSelector } from "abstractionkit";
import { useEffect, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useSimulateContract } from "wagmi";
import { createAlchemySmartAccountClient, sepolia } from "@account-kit/infra";
import { createLightAccount } from "@account-kit/smart-contracts";
import { WalletClientSigner } from "@aa-sdk/core";
import { http } from "viem";

// import { account, client } from "./client";
import MessageHistory from "@/components/MessageHistory";
import JazziconImage from "@/components/JazzIconImage";
import { chatABI } from "@/utils/chatABI";
import { walletClient } from "@/viem";
 
export default function Alchemy() {
  const [message, setMessage] = useState<string>("");
  const [ connectedAddress, setConnectedAddress ] = useState<`0x${string}` | undefined>("0x");
  const [ useSmartWallet, setUseSmartWallet ] = useState<boolean>();
  const [ client, setClient ] = useState<any>();
  const { address, isConnected } = useAccount();

  const ca = `0x${process.env.NEXT_PUBLIC_CONTRACT_ADDRESS}` as const || `0x${""}` as const;

  useEffect(() => {
    if (useSmartWallet && address) {
      setConnectedAddress(undefined);
      const ownerPublicAddress = address;
      console.log("Current EOA: ", ownerPublicAddress);

      const signer = new WalletClientSigner(walletClient, "wallet");

      createLightAccount({
          chain: sepolia,
          transport: http(`${sepolia.rpcUrls.alchemy.http[0]}/8f3L7dOU056NQW42iuO2KyK0yELh7s0q`),
          signer, // : LocalAccountSigner.privateKeyToAccountSigner(generatePrivateKey())
      }).then((account) => {
        const client = createAlchemySmartAccountClient({
          apiKey: "ssWRhiITBLQgQ6It6hLo6kRMJDr5np_t",
          policyId: "72a4a5cc-44a9-44c4-a6df-128cc742d373",
          chain: sepolia,
          account,
        });
        setClient(client);
        setConnectedAddress(account.address);
      })
    } else {
      setConnectedAddress(address);
    }
  }, [useSmartWallet, address]);

  const { data } = useSimulateContract({
    address: ca,
    abi: chatABI,
    functionName: "sendMessage",
    args: [message]
  })

  async function sendMessage() {
    const messageFunctionSignature = 'sendMessage(string)';
    const messageFunctionSelector = getFunctionSelector(messageFunctionSignature);
    const messageTransactionCallData = createCallData(
      messageFunctionSelector,
      ["string"],
      [message]
    );

    const { hash } = await client.sendUserOperation({
      uo: {
        target: ca,
        data: messageTransactionCallData as `0x${string}`,
        value: 0n,
      },
    });

    console.log("Tx hash: ", hash);
  };
 
  return (
    <main className="container max-w-xl mx-auto">
      <div className="flex flex-col h-screen justify-between gap-5">
        <div className="py-5 flex items-center justify-between">
          <ConnectButton />
          {isConnected && (<div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={useSmartWallet} className="sr-only peer" onChange={(e) => { setUseSmartWallet(!useSmartWallet) }} />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">Smart Wallet</span>
            </label>
          </div>)}
        </div>
        {isConnected && (<div className="flex justify-between items-center">
          Account: {connectedAddress && <JazziconImage address={connectedAddress} className='h-6 w-6 rounded-full' />} {connectedAddress}
        </div>)}
        {/* pendingMessage={pendingMessage} pendingIcon={pendingIcon} SetPendingMessage={SetPendingMessage} */}
        <MessageHistory address={connectedAddress} />
        <div className="flex w-full p-5 border-t-2">
          {/* <div className='text-red-500'>{errorMessage}</div> */}
          <div className="flex w-full">
            <input
              className="w-full text-gray-600 p-3 bg-gray-200 rounded-l-md focus:outline-none focus:placeholder-gray-300"
              type="text"
              onChange={(e) => { setMessage(e.target.value) }}
              onKeyDown={event => {
                console.log(event);
                if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
                  sendMessage();
                }
              }}
              placeholder="Hi there..."
            />
            <button disabled={!Boolean(data?.request) || !isConnected} onClick={async (e) => { e.preventDefault; await sendMessage() }} type="button" className="px-4 py-3 bg-blue-500 rounded-r-lg hover:bg-blue-400 ease-in-out duration-500">📩</button>
          </div>
        </div>
      </div>
    </main>
  );
}

/*
  <main className="container max-w-xl mx-auto">
    <div className="flex flex-col h-screen justify-between gap-5">
      <div className="py-5 flex items-center justify-between">
        <ConnectButton />
        {isConnected && (<div>
          <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={useSmartWallet} className="sr-only peer" onChange={(e) => {setUseSmartWallet(!useSmartWallet)}} />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">Smart Wallet</span>
          </label>
        </div>)}
      </div>
      {isConnected && (<div className="flex justify-between items-center">
          Account: {connectedAddress && <JazziconImage address={connectedAddress} className='h-6 w-6 rounded-full' />} {connectedAddress}
      </div>)}
      <MessageHistory address={connectedAddress} pendingMessage={pendingMessage} pendingIcon={pendingIcon} SetPendingMessage={SetPendingMessage} />
      <div className="flex w-full p-5 border-t-2">
        <div className='text-red-500'>{errorMessage}</div>
        <div className="flex w-full">
          <input
            className="w-full text-gray-600 p-3 bg-gray-200 rounded-l-md focus:outline-none focus:placeholder-gray-300"
            type="text"
            onChange={(e) => { setMessage(e.target.value) }}
            onKeyDown={event => {
              console.log(event);
              if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
                sendMessage();
              }
            }}
            placeholder="Hi there..."
          />
          <button disabled={!Boolean(data?.request) || !isConnected} onClick={async (e) => { e.preventDefault; await sendMessage() }} type="button" className="px-4 py-3 bg-blue-500 rounded-r-lg hover:bg-blue-400 ease-in-out duration-500">📩</button>
        </div>
    </div>
    </div>
  </main>
*/