import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "InfoBot - \u60C5\u5831\u53CE\u96C6AI\u30A2\u30B7\u30B9\u30BF\u30F3\u30C8",
  description: "\u30CB\u30E5\u30FC\u30B9\u30FB\u30DE\u30FC\u30B1\u30C3\u30C8\u30FB\u4FA1\u683C\u6BD4\u8F03\u30FB\u5929\u6C17\u3092AI\u304C\u30EA\u30A2\u30EB\u30BF\u30A4\u30E0\u3067\u53CE\u96C6\u30FB\u8981\u7D04",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  )
}
