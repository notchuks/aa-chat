"use client";

import { useEffect, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useSimulateContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi"
import { useQuery } from "@tanstack/react-query";
import { MetaTransaction, SafeAccountV0_2_0 as SafeAccount, getFunctionSelector, createCallData, CandidePaymaster, createUserOperationHash } from "abstractionkit";

import MessageHistory from "@/components/MessageHistory";
import { chatABI } from "@/utils/chatABI";
import { publicClient, walletClient } from "@/viem";
import { Message } from "@/lib/types/Message";
import JazziconImage from "@/components/JazzIconImage";
import { simulateContract } from "viem/actions";

const jsonRpcNodeProvider = process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL as string
const bundlerUrl = process.env.NEXT_PUBLIC_BUNDLER_URL as string;
const paymasterRPC = process.env.NEXT_PUBLIC_PAYMASTER_RPC as string;
const paymaster: CandidePaymaster = new CandidePaymaster(paymasterRPC);
const chainId = BigInt(process.env.NEXT_PUBLIC_CHAIN_ID as string);
const entrypointAddress = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789";


export default function Stackup() {
  const [ connectedAddress, setConnectedAddress ] = useState<`0x${string}` | undefined>("0x");
  const [ useSmartWallet, setUseSmartWallet ] = useState<boolean>();
  const [ smartAccount, setSmartAccount ] = useState<SafeAccount>();

  const [pendingMessage, SetPendingMessage] = useState<Message | undefined>();
  const [pendingIcon, SetPendingIcon] = useState<string>("");

  const [errorMessage, SetErrorMessage] = useState<string | undefined>();

  const { writeContract } = useWriteContract();
  const { address, isConnected } = useAccount();

  const ca = `0x${process.env.NEXT_PUBLIC_CONTRACT_ADDRESS}` as const || `0x${""}` as const;
  const [ txhash, setTxHash ] = useState<string>("");

  useEffect(() => {
    if (useSmartWallet && address) {
      setConnectedAddress(undefined);
      const ownerPublicAddress = address;
      console.log("Current EOA: ", ownerPublicAddress);
      const smartAccount = SafeAccount.initializeNewAccount([ownerPublicAddress]);
      // Make smartAccount globally available for sendMessage
      setSmartAccount(smartAccount)
      const safeAddress = smartAccount.accountAddress;
      setConnectedAddress(safeAddress as `0x${string}`);
    } else {
      setConnectedAddress(address);
    }
  }, [useSmartWallet, address]);

  const [message, setMessage] = useState<string>("");

  const { data } = useSimulateContract({
    address: ca,
    abi: chatABI,
    functionName: "sendMessage",
    args: [message]
  })

  async function sendMessage() {
    if (message && message.length > 0 && connectedAddress) {
      if (useSmartWallet && address) {
        if(smartAccount) {
          //lock input field
          //set pending message
          SetErrorMessage(undefined);

          SetPendingIcon("🧐")

          console.log("Sponsored by Candide Atelier.");
          console.log(ca);
        
          const messageFunctionSignature = 'sendMessage(string)';
          const messageFunctionSelector = getFunctionSelector(messageFunctionSignature);
          const messageTransactionCallData = createCallData(
            messageFunctionSelector,
            ["string"],
            [message]
          );
  
          const transaction: MetaTransaction = {
            to: ca,
            value: 0n,
            data: messageTransactionCallData,
          }

          console.log(jsonRpcNodeProvider, bundlerUrl);

          let userOperation = await smartAccount.createUserOperation(
            [transaction],
            jsonRpcNodeProvider,
            bundlerUrl,
          );

          SetPendingIcon("🧮")

          userOperation = await paymaster.createPaymasterUserOperation(userOperation, bundlerUrl);

          console.log({userOperation});

          // userOperation.signature = smartAccount.signUserOperation(userOperation, [pk], chainId);
          // console.log("Signature: ", userOperation.signature);

          const userOpHash = createUserOperationHash(userOperation, entrypointAddress, chainId);
          console.log("User Operation Hash: ", { userOpHash });

          const domain = {
            chainId: Number(chainId),
            verifyingContract: smartAccount.safe4337ModuleAddress as `0x${string}`,
          };

          const types = SafeAccount.EIP712_SAFE_OPERATION_TYPE;

          // format according to EIP712 Safe Operation Type
          const { sender, ...userOp } = userOperation;
          const safeUserOperation = {
            ...userOp,
            safe: userOperation.sender,
            validUntil: BigInt(0),
            validAfter: BigInt(0),
            entryPoint: smartAccount.entrypointAddress,
          };

          const [account] = await walletClient.getAddresses();
          console.log(account);

          const signature = await walletClient.signTypedData({
            account,
            domain,
            types,
            primaryType: 'SafeOp',
            message: safeUserOperation,
          })

          SetPendingIcon("✍🏻")
          const formatedSig = SafeAccount.formatEip712SignaturesToUseroperationSignature([account], [signature]);
          userOperation.signature = formatedSig;

          console.log("Signature: ", userOperation.signature);

          const sendUserOperationResponse = await smartAccount.sendUserOperation(userOperation, bundlerUrl)

          SetPendingIcon("⏳")
          console.log("UserOperation sent. Waiting to be included ......")

          let userOperationReceiptResult = await sendUserOperationResponse.included();

          console.log("Useroperation receipt received.")
          console.log(userOperationReceiptResult)

          SetPendingMessage(undefined);

          if (userOperationReceiptResult.success) {
            console.log("Your message was sent. View it at: " + `https://jiffyscan.xyz/userOpHash/${userOperationReceiptResult.receipt.transactionHash}`);
          } else {
              SetErrorMessage(userOperationReceiptResult.receipt.logs)
              console.log("Useroperation execution failed")
          }

        }
      } else {
        console.log("Writing through EOA...")
        // Simulate the transaction, as writeContract does not return error
        const { request, result } = await publicClient.simulateContract({
          address: ca,
          abi: chatABI,
          functionName: 'sendMessage',
          args: [message],
          account: address,
        })
        console.log("Simulated transaction: ", result);

        const txh = writeContract(data!.request);
        // setTxHash(txh)
        console.log("Tx hash: ", txhash);
      }
    }
}

const { data: txdata, isLoading, isSuccess } = useWaitForTransactionReceipt({
  hash: txhash as `0x${string}`,
});


  return (
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
  );
}
