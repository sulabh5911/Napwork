import { Inter } from 'next/font/google';
import './globals.css';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export const metadata = {
  title: 'Napworks - Product Management Dashboard',
  description: 'Premium product management dashboard for Napworks',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning={true}>
        <div className="app-layout">
          <Sidebar />
          <div className="app-main">
            <Header />
            <main className="app-content">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
