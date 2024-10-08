import { AlchemyAccountsUIConfig, cookieStorage, createConfig } from "@account-kit/react";
import { sepolia } from "@account-kit/infra";
import { QueryClient } from "@tanstack/react-query";

const uiConfig: AlchemyAccountsUIConfig = {
  illustrationStyle: "outline",
  auth: {
    sections: [[{"type":"email"}],[{"type":"passkey"}]],
    addPasskeyOnSignup: true,
  },
};

export const config = createConfig({
  // if you don't want to leak api keys, you can proxy to a backend and set the rpcUrl instead here
  // get this from the app config you create at https://dashboard.alchemy.com/accounts
  apiKey: "ssWRhiITBLQgQ6It6hLo6kRMJDr5np_t",
  chain: sepolia,
  ssr: true, // set to false if you're not using server-side rendering
  storage: cookieStorage, // read more about persisting state with cookies: https://accountkit.alchemy.com/react/ssr#persisting-the-account-state
}, uiConfig);