import "./globals.css";
import { Providers } from "./providers";

export const metadata = {
  title: "CryptoDevs DAO",
  description: "A DAO for CryptoDevs NFT holders",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body ata-new-gr-c-s-check-loaded="14.1231.0"
        data-gr-ext-installed="">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
