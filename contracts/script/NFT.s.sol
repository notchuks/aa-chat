// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "../src/NFT.sol";

contract MyScript is Script {
    function run() external {
        // uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast();

        NFT nft = new NFT("NFT_tutorial", "TUT", "baseUri");

        vm.stopBroadcast();
    }
}
