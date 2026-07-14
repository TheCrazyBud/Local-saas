import DeployButton from '../components/DeployButton';
import prisma from '../lib/prisma';

export default async function Home() {
  let auditLogs = [];
  try {
    auditLogs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10
    });
  } catch (error) {
    auditLogs = [
      { id: '1', createdAt: new Date(), event: "Database Offline (Please start Docker Postgres)", location: "Local System", status: "Warning" }
    ];
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1>Global Deployments</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Manage your localized Bring-Your-Own-Cloud infrastructure.</p>
        </div>
        <DeployButton />
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
              <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Location / Source</th>
              <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {auditLogs.length === 0 ? (
              <tr><td colSpan={4} style={{ padding: '1rem', textAlign: 'center' }}>No audit logs found.</td></tr>
            ) : (
              auditLogs.map(log => (
                <tr key={log.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                  <td style={{ padding: '1rem' }}>{log.createdAt.toLocaleString()}</td>
                  <td style={{ padding: '1rem' }}>{log.event}</td>
                  <td style={{ padding: '1rem' }}>{log.location}</td>
                  <td style={{ padding: '1rem', color: log.status === 'Success' ? 'var(--success-color)' : (log.status === 'Warning' ? 'orange' : 'var(--danger-color)') }}>{log.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
