import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from './providers';
import ErrorBoundary from './components/ErrorBoundary';

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "DocNest - Secure Document Management",
  description: "Store, organize, and manage your business documents with ease",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundary>
          <Providers>
            {children}
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
