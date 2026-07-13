import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "../components/Sidebar";

export const metadata: Metadata = {
  title: "BYOC Control Plane",
  description: "Enterprise Bring-Your-Own-Cloud AI Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <header className="glass-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--accent-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              AI
            </div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', letterSpacing: '1px' }}>SOVEREIGN CLOUD</h2>
          </div>
          <div>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginRight: '1rem' }}>Admin: Enterprise-Corp</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'inline-block', verticalAlign: 'middle' }}></div>
          </div>
        </header>
        
        <div className="dashboard-layout">
          <Sidebar />
          
          <main className="main-content">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
