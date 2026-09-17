import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FlowPilot — AI Task Collaboration Agent",
  description: "An AI-native workspace for planning, tool use, and transparent decisions.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
