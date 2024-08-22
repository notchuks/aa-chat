// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import { Script } from "forge-std/Script.sol";
import { Chat } from "../src/Chat.sol";

contract ChatScript is Script {
    function run() public {
        vm.broadcast();
        new Chat();
    }
}