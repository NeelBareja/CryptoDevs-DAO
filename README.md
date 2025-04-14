
# 🧠 CryptoDevs DAO Frontend

This is the frontend for the CryptoDevs DAO, a decentralized autonomous organization where NFT holders can create and vote on proposals to purchase NFTs from a fake marketplace.

## 🔗 Live Demo

https://crypto-devs-dao-nu.vercel.app




## 🏗️ Project Structure

This project uses:

- Next.js 13+ (App Router)

- RainbowKit for wallet connection

- Wagmi v2 for interacting with smart contracts

- Viem under the hood for performant EVM operations

- React Query (TanStack) for managing contract and network state


## 📦 Installation

First, navigate into your frontend directory and install the required packages:

```bash
  npm install @rainbow-me/rainbowkit wagmi viem@2.x @tanstack/react-query
```
## 🔧 Polyfill Fix for Next.js (Webpack 5+)

Because Webpack 5+ no longer includes Node polyfills by default (used by RainbowKit), edit your: `next.config.js`:

```bash
// next.config.js
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
};

module.exports = nextConfig;
```
    
## 🔑 Wallet Connection Setup

In `src/app/providers.js`, we configure RainbowKit and Wagmi with the Sepolia testnet and wallet connectors:

```bash
"use client";

import { RainbowKitProvider, getDefaultWallets, getDefaultConfig, darkTheme } from "@rainbow-me/rainbowkit";
import { sepolia } from "wagmi/chains";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { argentWallet, trustWallet, ledgerWallet } from "@rainbow-me/rainbowkit/wallets";

const { wallets } = getDefaultWallets();

export const config = getDefaultConfig({
  appName: "CryptoDevs DAO",
  projectId: "YOUR_PROJECT_ID", // Replace this with your WalletConnect Project ID
  wallets: [
    ...wallets,
    {
      groupName: "Other",
      wallets: [argentWallet, trustWallet, ledgerWallet],
    },
  ],
  chains: [sepolia],
  ssr: true,
});

const queryClient = new QueryClient();

export function Providers({ children }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme()}>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
```



## 🗾 Smart Contracts

### Deployed Contracts (Sepolia)

- CryptoDevsDAO – Manages proposals and treasury

- CryptoDevsNFT – ERC721 NFT that grants DAO access

- FakeNFTMarketplace – Simulated NFT marketplace for DAO to purchase NFTs from

Update these addresses in `src/constants/index.js`:

```bash
export const CryptoDevsDAOAddress = "0x...";
export const CryptoDevsDAOABI = [ /* ABI here */ ];

export const CryptoDevsNFTAddress = "0x...";
export const CryptoDevsNFTABI = [ /* ABI here */ ];

export const FakeNFTMarketplaceAddress = "0x...";
export const FakeNFTMarketplaceABI = [ /* ABI here */ ];
```

##  🚀 Running the Project

### Development

```bash
  npm run dev
```
Runs the app in development mode at `http://localhost:3000`.


##  📁 File Structure

```bash
src/
├── app/
│   ├── page.js               # Main DAO logic and rendering
│   ├── providers.js          # Wagmi, RainbowKit, and TanStack setup
│   └── page.module.css       # Styles
├── constants/                # Contract ABIs and addresses
└── public/
```


## 🧪 Features

- ✅ Connect with wallets using RainbowKit

- ✅ Show NFT balance of the connected wallet

- ✅ DAO treasury balance via useBalance

- ✅ Create DAO proposals

- ✅ View proposals with metadata

- ✅ Vote on proposals (YES/NO)

- ✅ Execute proposals

- ✅ Withdraw DAO funds (for owner)


## 💠 To Do / Future Improvements

- UI Improvements
- Addtional Functionlity
- Deployment on Mutiple chain

## 🧑‍💻 Author

Built with 🗿 using Next.js, RainbowKit, Viem, and Wagmi.

- [NeelBareja](https://github.com/NeelBareja/CryptoDevs-DAO.git)

