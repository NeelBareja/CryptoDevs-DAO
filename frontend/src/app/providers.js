"use client";

import * as React from "react";

// 1. Import necessary modules from wagmi and Web3Modal
import { createWeb3Modal } from '@web3modal/wagmi/react';
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config';
import { WagmiProvider } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// 2. Get projectId from WalletConnect Cloud
const projectId = "0f0aaf35f7f2e7bd965c2dcc63348e23"; // Replace with your actual Project ID

if (!projectId) {
  throw new Error('VITE_PROJECT_ID is not set');
}

// 3. Create wagmiConfig
const metadata = {
  name: 'CryptoDevs DAO',
  description: 'CryptoDevs DAO Frontend',
  url: 'https://web3modal.com', // origin must match your domain & subdomain
  icons: ['https://avatars.githubusercontent.com/u/37784886']
};

// Define chains without TypeScript assertion
const chains = [sepolia]; 
export const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  // Optional: Add custom wallet connectors or configurations here
  // ...
});

// 4. Create Web3Modal instance
createWeb3Modal({
  wagmiConfig: config,
  projectId,
  // Optional: Add theme variables, default chain, etc.
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': '#00b8ff', // Match our accent color
    '--w3m-border-radius-master': '8px', // Match our border radius
  }
});

// TanStack Query setup remains the same
export const queryClient = new QueryClient();

// 5. Update Providers component
export function Providers({ children }) {
  return (
    // WagmiProvider remains
    <WagmiProvider config={config} reconnectOnMount={false}> 
      {/* QueryClientProvider remains */}
      <QueryClientProvider client={queryClient}>
        {/* RainbowKitProvider is removed */}
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
