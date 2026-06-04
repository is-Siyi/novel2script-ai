import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Novel2Script AI",
  description: "面向小说作者的 AI 剧本改编助手",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
