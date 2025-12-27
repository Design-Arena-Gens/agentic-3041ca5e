import "./globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "Daily Intelligence Console",
  description: "Autonomous daily reporting for student performance insights."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
