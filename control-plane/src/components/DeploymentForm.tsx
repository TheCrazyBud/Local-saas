'use client';

import { useState } from 'react';

export default function DeploymentForm({ models }: { models: { id: string; name: string }[] }) {
  const [activeRegion, setActiveRegion] = useState('Local Machine');
  const [activeModel, setActiveModel] = useState(models[0]?.id || '');
  const [depName, setDepName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleDeploy() {
    if (!depName) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/deployments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: depName,
          region: activeRegion,
          modelId: activeModel || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to create deployment');
        setLoading(false);
        return;
      }

      window.location.reload();
    } catch (e) {
      setError('Network error');
      setLoading(false);
    }
  }

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.125rem' }}>Provision Infrastructure</h3>
        <span className="text-secondary">•••</span>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label className="text-secondary" style={{ display: 'block', marginBottom: '0.75rem', fontSize: '0.75rem' }}>Target Region</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          {['Local Machine', 'EU Central', 'US East', 'Asia Pacific'].map(reg => (
            <div key={reg} onClick={() => setActiveRegion(reg)} style={{
              padding: '0.75rem', borderRadius: '8px', cursor: 'pointer', textAlign: 'center',
              background: activeRegion === reg ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.03)',
              color: activeRegion === reg ? 'var(--text-dark)' : 'var(--text-primary)',
              border: `1px solid ${activeRegion === reg ? '#fff' : 'var(--glass-border)'}`,
              fontSize: '0.75rem', fontWeight: activeRegion === reg ? 600 : 400
            }}>
              {reg}
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label className="text-secondary" style={{ display: 'block', marginBottom: '0.75rem', fontSize: '0.75rem' }}>Select Model Container</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {models.length === 0 ? (
            <div className="text-secondary" style={{ fontSize: '0.75rem', padding: '0.5rem' }}>No models available</div>
          ) : (
            models.map(mod => (
              <div key={mod.id} onClick={() => setActiveModel(mod.id)} style={{
                padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer',
                background: activeModel === mod.id ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.03)',
                color: activeModel === mod.id ? 'var(--text-dark)' : 'var(--text-primary)',
                border: `1px solid ${activeModel === mod.id ? '#fff' : 'var(--glass-border)'}`,
                fontSize: '0.75rem', fontWeight: activeModel === mod.id ? 600 : 400
              }}>
                {mod.name}
              </div>
            ))
          )}
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <label className="text-secondary" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.75rem' }}>Deployment Name</label>
        <input value={depName} onChange={e => setDepName(e.target.value)} placeholder="e.g. Prod Llama Cluster" style={{
          width: '100%', padding: '0.75rem', borderRadius: '8px',
          background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', color: 'white', fontSize: '0.875rem'
        }} />
      </div>

      {error && (
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      <button
        onClick={handleDeploy}
        disabled={loading || !depName}
        className="pill-btn"
        style={{
          padding: '1rem', background: 'rgba(163,217,150,0.15)', color: 'var(--success-color)',
          marginTop: 'auto', opacity: loading || !depName ? 0.5 : 1,
        }}
      >
        {loading ? 'Deploying...' : 'Launch Infrastructure'}
      </button>
    </div>
  );
}
