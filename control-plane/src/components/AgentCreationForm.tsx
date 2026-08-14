'use client';

import { useState } from 'react';

export default function AgentCreationForm({ models }: { models: { id: string; name: string }[] }) {
  const [activeModel, setActiveModel] = useState(models[0]?.id || '');
  const [agentName, setAgentName] = useState('');
  const [agentDesc, setAgentDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleCreate() {
    if (!agentName || !agentDesc) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: agentName,
          description: agentDesc,
          modelId: activeModel || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to create agent');
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
        <h3 style={{ fontSize: '1.125rem' }}>Initialize Agent</h3>
        <span className="text-secondary">•••</span>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label className="text-secondary" style={{ display: 'block', marginBottom: '0.75rem', fontSize: '0.75rem' }}>Select Base Model</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {models.length === 0 ? (
            <div className="text-secondary" style={{ fontSize: '0.75rem', padding: '0.75rem' }}>
              No models registered. Register a model first.
            </div>
          ) : (
            models.map(mod => (
              <div key={mod.id} onClick={() => setActiveModel(mod.id)} style={{
                padding: '0.75rem 1rem', borderRadius: '8px', cursor: 'pointer', flex: '1 1 calc(50% - 0.5rem)',
                background: activeModel === mod.id ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.03)',
                color: activeModel === mod.id ? 'var(--text-dark)' : 'var(--text-primary)',
                border: `1px solid ${activeModel === mod.id ? '#fff' : 'var(--glass-border)'}`,
                fontSize: '0.875rem', textAlign: 'center', fontWeight: activeModel === mod.id ? 600 : 400
              }}>
                {mod.name}
              </div>
            ))
          )}
        </div>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label className="text-secondary" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.75rem' }}>Agent Name</label>
        <input value={agentName} onChange={e => setAgentName(e.target.value)} placeholder="e.g. Code Reviewer" style={{
          width: '100%', padding: '0.75rem', borderRadius: '8px',
          background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', color: 'white', fontSize: '0.875rem'
        }} />
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <label className="text-secondary" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.75rem' }}>Role Description</label>
        <input value={agentDesc} onChange={e => setAgentDesc(e.target.value)} placeholder="What does it do?" style={{
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
        onClick={handleCreate}
        disabled={loading || !agentName || !agentDesc}
        className="pill-btn"
        style={{
          padding: '1rem', background: 'rgba(163,217,150,0.15)', color: 'var(--success-color)',
          marginTop: 'auto', opacity: loading || !agentName || !agentDesc ? 0.5 : 1,
        }}
      >
        {loading ? 'Creating...' : 'Deploy Agent'}
      </button>
    </div>
  );
}
