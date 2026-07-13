export default function Settings() {
  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1>Platform Settings</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Configure global platform preferences.</p>
      </div>
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>General</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Organization Name</label>
                <input type="text" defaultValue="Enterprise-Corp" readOnly style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: 'white' }} />
            </div>
            <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Admin Email</label>
                <input type="email" defaultValue="admin@enterprise.corp" readOnly style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: 'white' }} />
            </div>
        </div>
      </div>
    </div>
  );
}
