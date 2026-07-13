export default function PrivacyGateway() {
  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1>Privacy Gateway Rules</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Configure PII detection and masking rules.</p>
      </div>
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Active Masking Policies</h3>
        <ul style={{ listStyleType: 'none', padding: 0 }}>
            <li style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between' }}>
                <span>Aadhaar Numbers</span>
                <span style={{ color: 'var(--success-color)' }}>Enabled</span>
            </li>
            <li style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between' }}>
                <span>Email Addresses</span>
                <span style={{ color: 'var(--success-color)' }}>Enabled</span>
            </li>
            <li style={{ padding: '0.75rem 0', display: 'flex', justifyContent: 'space-between' }}>
                <span>Credit Card Numbers</span>
                <span style={{ color: 'var(--text-secondary)' }}>Disabled</span>
            </li>
        </ul>
      </div>
    </div>
  );
}
