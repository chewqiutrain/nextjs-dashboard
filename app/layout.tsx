import '@/app/ui/global.css';
import { Metadata } from 'next';
import { inter } from '@/app/ui/fonts';

export const metadata: Metadata = {
  title: {
    template: "%s | Acme Dashboard",
    default: "BUTT FACE 99"
  },
  description: "Official Next.js course",
  metadataBase: new URL("https://next-learn-dashboard.vercel.sh")
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>{children}</body>

    </html>
  );
}
