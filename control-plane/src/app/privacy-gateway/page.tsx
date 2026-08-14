"use client";

import { useState } from "react";
import BarChart from "../../components/BarChart";

const MASKING_RULES = [
  { id: 'aadhaar', name: 'Aadhaar Numbers', pattern: '\\b\\d{4}\\s?\\d{4}\\s?\\d{4}\\b', defaultEnabled: true },
  { id: 'email', name: 'Email Addresses', pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}', defaultEnabled: true },
  { id: 'phone', name: 'Phone Numbers', pattern: '\\+?\\d{10,13}', defaultEnabled: true },
  { id: 'ssn', name: 'SSN (US)', pattern: '\\d{3}-\\d{2}-\\d{4}', defaultEnabled: true },
  { id: 'credit_card', name: 'Credit Card Numbers', pattern: '\\b\\d{4}[- ]?\\d{4}[- ]?\\d{4}[- ]?\\d{4}\\b', defaultEnabled: false },
  { id: 'ip_address', name: 'IP Addresses', pattern: '\\b\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\b', defaultEnabled: false },
];

export default function PrivacyGateway() {
  const [rules, setRules] = useState(MASKING_RULES.map(r => ({ ...r, enabled: r.defaultEnabled })));
  const [testInput, setTestInput] = useState('');
  const [testOutput, setTestOutput] = useState('');
  const [testing, setTesting] = useState(false);

  const chartData = [10, 5, 25, 40, 60, 50, 45, 80, 100, 85, 70, 90];

  function toggleRule(id: string) {
    setRules(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  }

  async function testMasking() {
    if (!testInput.trim()) return;
    setTesting(true);
    let masked = testInput;
    rules.filter(r => r.enabled).forEach(rule => {
      const regex = new RegExp(rule.pattern, 'g');
      masked = masked.replace(regex, `<${rule.name.toUpperCase().replace(/ /g, '_')}_MASKED>`);
    });
    
    setTimeout(() => {
      setTestOutput(`[Local Simulation]\n\nOriginal:\n${testInput}\n\nMasked:\n${masked}`);
      setTesting(false);
    }, 400);
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem' }}>Privacy Gateway</h2>
      </div>

      {/* Top Visual Chart (White Box) */}
      <div className="glass-panel light-theme" style={{ padding: '1.5rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.125rem' }}>Privacy Gateway</h3>
          <button className="pill-btn">Last 12 hours</button>
        </div>

        <div style={{ display: 'flex', gap: '3rem', flex: 1 }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span className="text-secondary" style={{ fontSize: '0.875rem' }}>PII Masking Velocity ↑</span>
              <span className="text-secondary">•••</span>
            </div>
            <BarChart data={chartData} color="rgba(18,19,18,0.3)" height="120px" />
            <div style={{ marginTop: '1.5rem' }}>
              <div className="text-huge">2.4k</div>
              <div className="text-secondary" style={{ fontSize: '0.75rem' }}>sensitive fields masked</div>
            </div>
          </div>
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span className="text-secondary" style={{ fontSize: '0.875rem' }}>Threat Prevention</span>
              <span className="text-secondary">•••</span>
            </div>
            <BarChart data={[2, 1, 5, 3, 7, 4, 2, 6, 8, 3]} color="rgba(18,19,18,0.8)" height="120px" />
            <div style={{ marginTop: '1.5rem' }}>
              <div className="text-huge">41</div>
              <div className="text-secondary" style={{ fontSize: '0.75rem' }}>malicious prompts blocked</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Masking Rules Card (Interactive Blocks) */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem' }}>Active Masking Policies</h3>
            <span className="text-secondary">•••</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {rules.map(rule => (
              <div key={rule.id} onClick={() => toggleRule(rule.id)} style={{
                padding: '1.25rem', borderRadius: '12px', cursor: 'pointer', display: 'flex', flexDirection: 'column',
                background: rule.enabled ? 'rgba(163,217,150,0.1)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${rule.enabled ? 'rgba(163,217,150,0.3)' : 'var(--glass-border)'}`,
                transition: 'all 0.2s ease'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 300, color: rule.enabled ? 'var(--success-color)' : 'var(--text-secondary)' }}>
                    {rule.name}
                  </span>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: rule.enabled ? 'var(--success-color)' : 'transparent', border: rule.enabled ? 'none' : '1px solid var(--text-secondary)' }} />
                </div>
                <div className="text-secondary" style={{ fontSize: '0.65rem', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {rule.pattern}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Test Card */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem' }}>Sanitization Sandbox</h3>
            <span className="text-secondary">•••</span>
          </div>
          
          <div style={{ marginBottom: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <textarea value={testInput} onChange={e => setTestInput(e.target.value)} rows={4}
              placeholder="Paste raw data here to simulate masking. e.g. Email: john@example.com"
              style={{
                width: '100%', padding: '1rem', borderRadius: '8px', resize: 'vertical',
                background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)',
                color: 'white', fontSize: '0.875rem', fontFamily: 'inherit'
              }}
            />
            {testOutput && (
              <div style={{
                flex: 1, padding: '1rem', borderRadius: '8px',
                background: 'rgba(163,217,150,0.05)', border: '1px solid rgba(163,217,150,0.2)',
                fontSize: '0.8rem', whiteSpace: 'pre-wrap', lineHeight: '1.6',
                fontFamily: 'monospace', overflowY: 'auto'
              }}>{testOutput}</div>
            )}
          </div>
          
          <button onClick={testMasking} disabled={testing} className="pill-btn"
            style={{ width: '100%', padding: '1rem', background: 'rgba(219,231,214,0.15)', opacity: testing ? 0.5 : 1 }}>
            {testing ? 'Processing...' : 'Run Simulation'}
          </button>
        </div>
      </div>
    </div>
  );
}
