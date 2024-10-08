export const chatABI = [
    {
        "type": "function",
        "name": "sendMessage",
        "inputs": [
            {
                "name": "message",
                "type": "string",
                "internalType": "string"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "event",
        "name": "Message",
        "inputs": [
            {
                "name": "sender",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "message",
                "type": "string",
                "indexed": false,
                "internalType": "string"
            }
        ],
        "anonymous": false
    }
] as const;