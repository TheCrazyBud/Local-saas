"use client";

import { useState } from 'react';

export default function Home() {
  const [isDeploying, setIsDeploying] = useState(false);

  const handleDeploy = () => {
    setIsDeploying(true);
    setTimeout(() => setIsDeploying(false), 2000);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1>Global Deployments</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Manage your localized Bring-Your-Own-Cloud infrastructure.</p>
        </div>
        <button className="btn" onClick={handleDeploy}>
          {isDeploying ? 'Deploying...' : 'Deploy New Data Plane'}
        </button>
      </div>

      <div className="grid-cards">
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>EU Central (Frankfurt)</h3>
            <span className="status-badge status-active">Operational</span>
          </div>
          <h2 style={{ margin: '1rem 0' }}>Llama-3-70B-MoE</h2>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>VPC: vpc-eu-12345</span>
            <span style={{ color: 'var(--success-color)' }}>Zero Trust Enforced</span>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>US East (N. Virginia)</h3>
            <span className="status-badge status-active">Operational</span>
          </div>
          <h2 style={{ margin: '1rem 0' }}>SGLang Prefix Router</h2>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>VPC: vpc-us-98765</span>
            <span style={{ color: 'var(--success-color)' }}>Zero Trust Enforced</span>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>Data Privacy Gateway</h3>
            <span style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}>1.2M Tokens Processed</span>
          </div>
          <h2 style={{ margin: '1rem 0' }}>99.9% PII Masked</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            1,432 Aadhaar and 5,120 emails tokenized in the last 24h.
          </p>
        </div>
      </div>
      
      <h2 style={{ marginTop: '3rem', fontSize: '1.5rem' }}>Recent Audit Logs</h2>
      <div className="glass-panel" style={{ marginTop: '1rem', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid var(--glass-border)' }}>
              <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Timestamp</th>
              <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Event</th>
              <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: '500' }}>VPC / Location</th>
              <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
              <td style={{ padding: '1rem' }}>2026-07-08 14:32:11</td>
              <td style={{ padding: '1rem' }}>Data Plane Config Updated via Pull</td>
              <td style={{ padding: '1rem' }}>vpc-eu-12345</td>
              <td style={{ padding: '1rem', color: 'var(--success-color)' }}>Success</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
              <td style={{ padding: '1rem' }}>2026-07-08 13:10:05</td>
              <td style={{ padding: '1rem' }}>PII Interception - Aadhaar Tokenized</td>
              <td style={{ padding: '1rem' }}>vpc-us-98765</td>
              <td style={{ padding: '1rem', color: 'var(--success-color)' }}>Masked</td>
            </tr>
            <tr>
              <td style={{ padding: '1rem' }}>2026-07-08 11:45:22</td>
              <td style={{ padding: '1rem' }}>SGLang Cache Flushed</td>
              <td style={{ padding: '1rem' }}>vpc-us-98765</td>
              <td style={{ padding: '1rem', color: 'var(--success-color)' }}>Success</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
