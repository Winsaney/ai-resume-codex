import type { Metadata } from "next";
import { Poppins, Lora } from "next/font/google";
import { Providers } from "./Providers";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "ResumeAI Pro — AI 简历优化助手",
  description:
    "用 AI 帮你对标 JD，精准优化简历，提升面试通过率。智能分析、一键润色、专业建议。",
  keywords: ["简历优化", "AI 简历", "JD 匹配", "面试", "求职"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${poppins.variable} ${lora.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
