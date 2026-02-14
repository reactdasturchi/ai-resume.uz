import type { Metadata } from "next";
import { Fraunces, DM_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AI Rezyume | ai-resume.uz",
  description: "AI yordamida professional rezyume yarating",
};

const themeScript = `
(function() {
  var key = 'ai-resume-theme';
  var stored = null;
  try {
    var match = document.cookie.match(new RegExp('(^| )' + key + '=([^;]+)'));
    if (match) stored = decodeURIComponent(match[2]);
    if (!stored) stored = localStorage.getItem(key);
  } catch (e) {}
  var dark = stored === 'dark' || (stored !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  if (dark) document.documentElement.classList.add('dark');
  else document.documentElement.classList.remove('dark');
})();
`

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz" className={`${fraunces.variable} ${dmSans.variable}`} suppressHydrationWarning>
      <body className="min-h-screen grain bg-background text-foreground" suppressHydrationWarning>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <a
          href="#main-content"
          className="sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:block focus:h-auto focus:w-auto focus:overflow-visible focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:m-0 focus:border-0"
        >
          Asosiy kontentga o‘tish
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
