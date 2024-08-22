// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import { Chat } from "../src/Chat.sol";

contract ChatTest is Test {
    Chat public chat;

    event Message(address indexed sender, string message);

    function setUp() public {
        chat = new Chat();
    }

    function test_SendMessage() public {
        vm.expectEmit(true, false, false, true);
        emit Message(address(this), "iamwise");
        chat.sendMessage("iamwise");
    }
}