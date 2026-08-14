import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import OrgSwitcher from "../components/OrgSwitcher";

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
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ 
              width: '32px', height: '24px', 
              background: 'rgba(255,255,255,0.1)', 
              borderRadius: '6px', 
              border: '1px solid var(--glass-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <div style={{ width: '12px', height: '12px', background: 'var(--surface-light)', borderRadius: '3px', marginLeft: '4px' }}></div>
            </div>
            
            <nav className="top-nav">
              <Link href="/" className="nav-item active">Dashboard</Link>
              <Link href="/deployments" className="nav-item">Deployments</Link>
              <Link href="/privacy-gateway" className="nav-item">Privacy Gateway</Link>
              <Link href="/models" className="nav-item">Models</Link>
              <Link href="/agents" className="nav-item">Agents</Link>
              <Link href="/approvals" className="nav-item">Approvals</Link>
              <Link href="/settings" className="nav-item">Settings</Link>
            </nav>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <OrgSwitcher />
          </div>
        </header>
        
        <div className="dashboard-layout">
          <main className="main-content">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
