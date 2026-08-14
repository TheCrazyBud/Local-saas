'use client';

import { useState } from 'react';

export default function ModelRegistrationForm() {
  const [activeProvider, setActiveProvider] = useState('ollama');
  const [modelName, setModelName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleRegister() {
    if (!modelName) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: modelName,
          provider: activeProvider,
          endpoint: activeProvider === 'ollama' ? 'http://localhost:11434' : 'http://localhost:8000',
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to register model');
        setLoading(false);
        return;
      }

      // Success — reload to show new model (server component will re-fetch)
      window.location.reload();
    } catch (e) {
      setError('Network error');
      setLoading(false);
    }
  }

  return (
    <div className="glass-panel" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.125rem' }}>Connect Model</h3>
        <span className="text-secondary">•••</span>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label className="text-secondary" style={{ display: 'block', marginBottom: '0.75rem', fontSize: '0.75rem' }}>Select Provider</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          {['ollama', 'vllm', 'llamacpp', 'custom'].map(prov => (
            <div key={prov} onClick={() => setActiveProvider(prov)} style={{
              padding: '1rem', borderRadius: '8px', cursor: 'pointer', textAlign: 'center',
              background: activeProvider === prov ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.03)',
              color: activeProvider === prov ? 'var(--text-dark)' : 'var(--text-primary)',
              border: `1px solid ${activeProvider === prov ? '#fff' : 'var(--glass-border)'}`,
              fontWeight: activeProvider === prov ? 600 : 400
            }}>
              {prov.toUpperCase()}
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label className="text-secondary" style={{ display: 'block', marginBottom: '0.75rem', fontSize: '0.75rem' }}>Model Name</label>
        <input
          value={modelName} onChange={e => setModelName(e.target.value)}
          placeholder="e.g. llama3:8b"
          style={{
            width: '100%', padding: '1rem', borderRadius: '8px',
            background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)',
            color: 'white', fontSize: '1rem'
          }}
        />
      </div>

      {error && (
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      <button
        onClick={handleRegister}
        disabled={loading || !modelName}
        className="pill-btn"
        style={{
          width: '100%', padding: '1rem',
          background: 'rgba(163,217,150,0.15)', color: 'var(--success-color)',
          opacity: loading || !modelName ? 0.5 : 1,
        }}
      >
        {loading ? 'Registering...' : 'Initialize Connection'}
      </button>
    </div>
  );
}
