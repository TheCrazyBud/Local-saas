'use client';

import { useState, useEffect } from 'react';

interface Org {
  id: string;
  name: string;
  slug: string;
  plan: string;
  _count: { members: number; agents: number; models: number };
}

export default function OrgSwitcher() {
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [activeOrg, setActiveOrg] = useState<Org | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetch('/api/orgs')
      .then(res => res.json())
      .then((data: Org[]) => {
        setOrgs(data);
        if (data.length > 0) {
          // Check localStorage for saved org preference
          const savedOrgId = localStorage.getItem('activeOrgId');
          const saved = data.find(o => o.id === savedOrgId);
          setActiveOrg(saved || data[0]);
        }
      })
      .catch(() => {});
  }, []);

  function switchOrg(org: Org) {
    setActiveOrg(org);
    localStorage.setItem('activeOrgId', org.id);
    setIsOpen(false);
    // Reload to apply org context
    window.location.reload();
  }

  async function createOrg() {
    if (!newOrgName.trim()) return;
    setCreating(true);

    try {
      const res = await fetch('/api/orgs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newOrgName }),
      });

      if (res.ok) {
        const newOrg = await res.json();
        setOrgs(prev => [...prev, newOrg]);
        switchOrg(newOrg);
        setNewOrgName('');
        setShowCreateForm(false);
      }
    } catch (e) {}
    setCreating(false);
  }

  if (!activeOrg) {
    return <span style={{ fontSize: '0.875rem', fontWeight: 400 }}>Loading...</span>;
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.5rem 0.75rem', borderRadius: '8px',
          background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)',
          color: 'var(--text-primary)', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 400,
        }}
      >
        <span style={{
          width: '20px', height: '20px', borderRadius: '6px',
          background: 'rgba(163,217,150,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.6rem', color: 'var(--success-color)',
        }}>
          {activeOrg.name.charAt(0).toUpperCase()}
        </span>
        {activeOrg.name} ⌄
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute', top: '100%', right: 0, marginTop: '0.5rem',
          width: '280px', background: 'var(--surface-color)',
          border: '1px solid var(--glass-border)', borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)', zIndex: 100,
          overflow: 'hidden',
        }}>
          <div style={{ padding: '0.75rem', borderBottom: '1px solid var(--glass-border)' }}>
            <span className="text-secondary" style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Organizations</span>
          </div>

          {orgs.map(org => (
            <button
              key={org.id}
              onClick={() => switchOrg(org)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                width: '100%', padding: '0.75rem', border: 'none',
                background: org.id === activeOrg.id ? 'rgba(163,217,150,0.08)' : 'transparent',
                color: 'var(--text-primary)', cursor: 'pointer', textAlign: 'left',
              }}
            >
              <span style={{
                width: '28px', height: '28px', borderRadius: '6px',
                background: org.id === activeOrg.id ? 'rgba(163,217,150,0.2)' : 'rgba(255,255,255,0.05)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.75rem', color: org.id === activeOrg.id ? 'var(--success-color)' : 'var(--text-secondary)',
                flexShrink: 0,
              }}>
                {org.name.charAt(0).toUpperCase()}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.875rem' }}>{org.name}</div>
                <div className="text-secondary" style={{ fontSize: '0.65rem' }}>
                  {org._count?.agents || 0} agents · {org._count?.models || 0} models
                </div>
              </div>
              {org.id === activeOrg.id && (
                <span style={{ color: 'var(--success-color)', fontSize: '0.75rem' }}>✓</span>
              )}
            </button>
          ))}

          <div style={{ borderTop: '1px solid var(--glass-border)', padding: '0.75rem' }}>
            {showCreateForm ? (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  value={newOrgName}
                  onChange={e => setNewOrgName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && createOrg()}
                  placeholder="Org name"
                  autoFocus
                  style={{
                    flex: 1, padding: '0.5rem', borderRadius: '6px',
                    background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)',
                    color: 'white', fontSize: '0.75rem', outline: 'none',
                  }}
                />
                <button
                  onClick={createOrg}
                  disabled={creating}
                  style={{
                    padding: '0.5rem 0.75rem', borderRadius: '6px',
                    background: 'rgba(163,217,150,0.15)', border: '1px solid rgba(163,217,150,0.3)',
                    color: 'var(--success-color)', cursor: 'pointer', fontSize: '0.75rem',
                  }}
                >
                  {creating ? '...' : 'Create'}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowCreateForm(true)}
                style={{
                  width: '100%', padding: '0.5rem', border: 'none',
                  background: 'transparent', color: 'var(--text-secondary)',
                  cursor: 'pointer', fontSize: '0.75rem', textAlign: 'left',
                }}
              >
                + Create Organization
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
