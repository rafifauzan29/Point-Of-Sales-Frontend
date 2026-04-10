import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Dashboard App",
  description: "Modern POS Dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://cdn.jsdelivr.net/npm/@mdi/font/css/materialdesignicons.min.css"
          rel="stylesheet"
        />
      </head>
      <body className="bg-gray-100 text-gray-900">
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}