import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import LayoutApp from "./ui/common/LayoutApp";
import { ConfigProvider } from "antd";

export const dynamic = "force-dynamic";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "DynamoDB Explorer",
  description: "Web-based DynamoDB client",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AntdRegistry>
          <ConfigProvider
            theme={{
              token: {
                // Seed Token
                colorPrimary: "#00b96b",
                borderRadius: 2,

                // Alias Token
                // colorBgContainer: "#f6ffed",
              },
              components: {
                Button: {
                  borderRadius: 9999,
                },
              },
            }}
          >
            <LayoutApp>{children}</LayoutApp>
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
