import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Flood Segmentation - AI-Powered Analysis",
  description: "Advanced flood area detection using UNet and UNet++ deep learning models",
  keywords: "flood, segmentation, AI, deep learning, UNet, computer vision",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
