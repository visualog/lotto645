import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "로또 번호 분석 대시보드",
  description: "다양한 통계와 데이터 분석을 통해 로또 번호를 예측하고 추천합니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-50`}
      >
        <div className="flex flex-col min-h-screen">
          <main className="flex-grow">{children}</main>
          <footer className="w-full max-w-7xl mx-auto py-4 px-4 md:px-8 lg:px-12">
            <div className="text-center text-sm text-gray-500 dark:text-gray-400">
              <p>&copy; {new Date().getFullYear()} 로또 번호 분석. All Rights Reserved.</p>
              <div className="flex justify-center items-center gap-4 mt-2">
                <Link href="/about/principles" className="hover:underline">
                  서비스 디자인 원칙
                </Link>
                <a
                  href="https://github.com/visualog/lotto645"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  GitHub
                </a>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
