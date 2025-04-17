'use client';

import dynamic from 'next/dynamic';
import * as React from 'react';

// Dynamically import the actual Providers component
const Providers = dynamic(
  () => import('./providers').then(mod => mod.Providers),
  { ssr: false } // Disable SSR for this wrapper
);

export default function ClientProviders({ children }) {
  // Render the dynamically imported Providers component on the client side
  return <Providers>{children}</Providers>;
} 