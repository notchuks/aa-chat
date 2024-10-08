import { useAccount } from "wagmi";
import JazziconImage from "./JazzIconImage";

export default function ChatMessage({ address, connectedAddress, message }: { address: string, connectedAddress?: `0x${string}`, message: string }) {

    return <div className={["flex flex-row items-center gap-2 py-1", address == connectedAddress ? "justify-end" : " "].join(" ")}>
        <JazziconImage address={address} className={["rounded-full", address == connectedAddress ? "order-2" : ""].join(" ")} />
        <div className={["px-4 py-2 rounded-lg", connectedAddress == address ? "rounded-br-none bg-blue-600 text-white" : "rounded-bl-none bg-gray-300 text-gray-700"].join(" ")}>{message}</div>
    </div>
}