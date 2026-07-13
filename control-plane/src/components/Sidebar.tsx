"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <Link href="/" className={`nav-item ${pathname === '/' ? 'active' : ''}`}>
        <span>⊞</span> Dashboard
      </Link>
      <Link href="/deployments" className={`nav-item ${pathname === '/deployments' ? 'active' : ''}`}>
        <span>🚀</span> Deployments
      </Link>
      <Link href="/privacy-gateway" className={`nav-item ${pathname === '/privacy-gateway' ? 'active' : ''}`}>
        <span>🛡️</span> Privacy Gateway
      </Link>
      <Link href="/agents" className={`nav-item ${pathname === '/agents' ? 'active' : ''}`}>
        <span>🤖</span> Agents
      </Link>
      <Link href="/approvals" className={`nav-item ${pathname === '/approvals' ? 'active' : ''}`}>
        <span>✅</span> Approvals
      </Link>
      <Link href="/settings" className={`nav-item ${pathname === '/settings' ? 'active' : ''}`}>
        <span>⚙️</span> Settings
      </Link>
    </aside>
  );
}
