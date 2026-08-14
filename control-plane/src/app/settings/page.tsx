"use client";

import { useState, useEffect } from "react";
import BarChart from "../../components/BarChart";

export default function Settings() {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [ollamaEndpoint, setOllamaEndpoint] = useState('');
  const [gatewayEndpoint, setGatewayEndpoint] = useState('');
  const [defaultTemp, setDefaultTemp] = useState('0.7');
  const [defaultMaxTokens, setDefaultMaxTokens] = useState('2048');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [ollamaStatus, setOllamaStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  // Load settings from API on mount
  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        setApiKey(data.apiKey || 'enterprise-secret-key-123');
        setOllamaEndpoint(data.ollamaEndpoint || 'http://localhost:11434');
        setGatewayEndpoint(data.gatewayEndpoint || 'http://localhost:8000');
        setDefaultTemp(String(data.defaultTemp ?? 0.7));
        setDefaultMaxTokens(String(data.defaultMaxTokens ?? 2048));
        setLoading(false);
      })
      .catch(() => {
        setOllamaEndpoint('http://localhost:11434');
        setGatewayEndpoint('http://localhost:8000');
        setApiKey('enterprise-secret-key-123');
        setLoading(false);
      });

    // Check Ollama health
    fetch('/api/ollama/health')
      .then(res => res.json())
      .then(data => setOllamaStatus(data.status === 'online' ? 'online' : 'offline'))
      .catch(() => setOllamaStatus('offline'));
  }, []);

  async function handleSave() {
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ollamaEndpoint,
          gatewayEndpoint,
          apiKey,
          defaultTemp,
          defaultMaxTokens,
        }),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (e) {
      // Network error
    }
  }

  function regenerateKey() {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    const newKey = 'key-' + Array.from({ length: 32 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    setApiKey(newKey);
  }

  const inputStyle = {
    width: '100%', padding: '1rem', borderRadius: '8px',
    background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)',
    color: 'white', fontSize: '0.875rem', fontFamily: 'monospace' as const,
    boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.2)'
  };

  // Fake chart data for API requests
  const chartData = [100, 150, 120, 200, 250, 220, 300, 280, 350, 400, 380, 450];

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
        <span className="text-secondary">Loading settings...</span>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem' }}>Platform Configuration</h2>
      </div>

      {/* Top Visual Chart (White Box) */}
      <div className="glass-panel light-theme" style={{ padding: '1.5rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.125rem' }}>Platform Analytics</h3>
          <button className="pill-btn">This month</button>
        </div>

        <div style={{ display: 'flex', gap: '3rem', flex: 1 }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span className="text-secondary" style={{ fontSize: '0.875rem' }}>API Quota Usage ↑</span>
              <span className="text-secondary">•••</span>
            </div>
            <BarChart data={chartData} color="rgba(18,19,18,0.3)" height="120px" />
            <div style={{ marginTop: '1.5rem' }}>
              <div className="text-huge">45.2k</div>
              <div className="text-secondary" style={{ fontSize: '0.75rem' }}>requests / 100k limit</div>
            </div>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span className="text-secondary" style={{ fontSize: '0.875rem' }}>Ollama Status</span>
              <span className="text-secondary">•••</span>
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '60px', height: '60px', borderRadius: '50%', margin: '0 auto 1rem',
                  background: ollamaStatus === 'online' ? 'rgba(163,217,150,0.3)' : ollamaStatus === 'checking' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: `2px solid ${ollamaStatus === 'online' ? 'var(--success-color)' : 'var(--glass-border)'}`,
                }}>
                  <span style={{ fontSize: '1.5rem' }}>{ollamaStatus === 'online' ? '✓' : ollamaStatus === 'checking' ? '…' : '✕'}</span>
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 300 }}>{ollamaStatus === 'online' ? 'Connected' : ollamaStatus === 'checking' ? 'Checking...' : 'Offline'}</div>
                <div className="text-secondary" style={{ fontSize: '0.7rem' }}>{ollamaEndpoint}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

        {/* Core Infrastructure Card */}
        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div>
            <h3 style={{ fontSize: '1.125rem', marginBottom: '1.5rem' }}>Service Endpoints</h3>
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              <div>
                <label className="text-secondary" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.75rem' }}>
                  <span>LLM Gateway</span>
                  <span style={{ color: 'var(--success-color)' }}>● Online</span>
                </label>
                <input value={gatewayEndpoint} onChange={e => setGatewayEndpoint(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label className="text-secondary" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.75rem' }}>
                  <span>Ollama Engine</span>
                  <span style={{ color: ollamaStatus === 'online' ? 'var(--success-color)' : 'var(--text-secondary)' }}>
                    ● {ollamaStatus === 'online' ? 'Online' : 'Offline'}
                  </span>
                </label>
                <input value={ollamaEndpoint} onChange={e => setOllamaEndpoint(e.target.value)} style={inputStyle} />
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '2rem' }}>
            <h3 style={{ fontSize: '1.125rem', marginBottom: '1.5rem' }}>Authentication</h3>
            <div>
              <label className="text-secondary" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.75rem' }}>X-API-Key (service-to-service auth)</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input value={showKey ? apiKey : '•'.repeat(30)} readOnly style={{ ...inputStyle, flex: 1 }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <button onClick={() => setShowKey(!showKey)} style={{ padding: '0 1rem', flex: 1, borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', cursor: 'pointer' }}>
                    {showKey ? 'Hide' : 'Show'}
                  </button>
                  <button onClick={regenerateKey} style={{ padding: '0 1rem', flex: 1, borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Global Agent Defaults Card */}
        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1.125rem', marginBottom: '1.5rem' }}>Agent Environment Defaults</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
            <div style={{ padding: '1.5rem', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', textAlign: 'center' }}>
              <div className="text-secondary" style={{ fontSize: '0.75rem', marginBottom: '1rem' }}>Temperature</div>
              <input
                type="number" step="0.1" min="0" max="2"
                value={defaultTemp} onChange={e => setDefaultTemp(e.target.value)}
                style={{ width: '80px', textAlign: 'center', background: 'transparent', border: 'none', borderBottom: '2px solid rgba(255,255,255,0.2)', color: 'white', fontSize: '1.5rem', outline: 'none' }}
              />
            </div>
            <div style={{ padding: '1.5rem', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', textAlign: 'center' }}>
              <div className="text-secondary" style={{ fontSize: '0.75rem', marginBottom: '1rem' }}>Max Tokens</div>
              <input
                type="number" step="100"
                value={defaultMaxTokens} onChange={e => setDefaultMaxTokens(e.target.value)}
                style={{ width: '100px', textAlign: 'center', background: 'transparent', border: 'none', borderBottom: '2px solid rgba(255,255,255,0.2)', color: 'white', fontSize: '1.5rem', outline: 'none' }}
              />
            </div>
          </div>

          <div style={{ marginTop: 'auto', borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <button onClick={handleSave} className="pill-btn" style={{ padding: '1rem 2rem', background: 'rgba(163,217,150,0.15)', color: 'var(--success-color)', fontSize: '1rem' }}>
              Commit Global Configuration
            </button>
            {saved && <span style={{ color: 'var(--success-color)', fontSize: '0.875rem' }}>✓ System Updated</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
