// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import { Chatter } from "../src/Chatter.sol";

contract ChatterTest is Test {
    Chatter public chatter;

    event Message(address indexed sender, string message);

    function setUp() public {
        chatter = new Chatter();
    }

    function test_SendMessage() public {
        vm.expectEmit(true, false, false, true);
        emit Message(address(this), "iamwise");
        chatter.sendMessage("iamwise");
    }
}