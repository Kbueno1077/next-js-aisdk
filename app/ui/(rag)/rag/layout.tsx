import { ClerkProvider } from "@clerk/nextjs";
import { type Metadata } from "next";
import { Navigation } from "./_components/Navigation";

export const metadata: Metadata = {
  title: "RAG Chat Bot",
  description: "RAG Chat Bot",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <Navigation />

      {children}
    </ClerkProvider>
  );
}
