import "./globals.css";
// Remove the previous dynamic import attempt
// import dynamic from 'next/dynamic'; 
import ClientProviders from "./ClientProviders"; // Import the new wrapper

// const Providers = dynamic(() => import('./providers').then(mod => mod.Providers), {
//   ssr: false,
// });

export const metadata = {
  title: "CryptoDevs DAO",
  description: "A DAO for CryptoDevs NFT holders",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      {/* Add suppressHydrationWarning to ignore attribute mismatches caused by extensions */}
      <body suppressHydrationWarning={true}>
        {/* Use the ClientProviders wrapper */}
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
