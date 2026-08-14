import prisma from "../../lib/prisma";
import { resolveOrgId } from "../../lib/auth";
import { revalidatePath } from "next/cache";

export default async function Approvals() {
  const orgId = await resolveOrgId();

  let approvals: any[] = [];
  let pendingCount = 0;
  let approvedCount = 0;
  let rejectedCount = 0;

  try {
    approvals = await prisma.actionApproval.findMany({
      where: { orgId },
      orderBy: { createdAt: 'desc' }
    });
    pendingCount = approvals.filter(a => a.status === 'PENDING').length;
    approvedCount = approvals.filter(a => a.status === 'APPROVED').length;
    rejectedCount = approvals.filter(a => a.status === 'REJECTED').length;
  } catch (error) {
    approvals = [
      { id: '1', actionType: 'Database Offline', agentName: 'System', payload: 'Start Docker Postgres to see real approvals.', status: 'PENDING', createdAt: new Date() }
    ];
    pendingCount = 1;
  }

  async function updateStatus(id: string, newStatus: string) {
    "use server";

    const currentOrgId = await resolveOrgId();
    const approval = await prisma.actionApproval.findFirst({ where: { id, orgId: currentOrgId } });
    if (!approval) return;

    await prisma.actionApproval.update({
      where: { id },
      data: { status: newStatus }
    });

    await prisma.auditLog.create({
      data: {
        event: `Action ${newStatus}: ${approval.actionType} requested by ${approval.agentName}`,
        location: 'Control Plane UI',
        status: newStatus === 'APPROVED' ? 'Success' : 'Warning',
        orgId: currentOrgId,
      }
    });

    revalidatePath("/approvals");
    revalidatePath("/");
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem' }}>Action Approvals</h2>
          <p className="text-secondary" style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
            Review and govern high-risk actions requested by AI Agents.
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div className="text-secondary" style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>Pending</div>
          <div className="text-huge" style={{ color: 'var(--text-primary)' }}>{pendingCount}</div>
          <div className="text-secondary" style={{ fontSize: '0.75rem' }}>awaiting review</div>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div className="text-secondary" style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>Approved</div>
          <div className="text-huge" style={{ color: 'var(--success-color)' }}>{approvedCount}</div>
          <div className="text-secondary" style={{ fontSize: '0.75rem' }}>actions permitted</div>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div className="text-secondary" style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>Rejected</div>
          <div className="text-huge" style={{ color: 'var(--text-secondary)' }}>{rejectedCount}</div>
          <div className="text-secondary" style={{ fontSize: '0.75rem' }}>actions blocked</div>
        </div>
      </div>

      {/* Approval List */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem', marginTop: '2rem' }}>
        <h3 style={{ fontSize: '1.125rem' }}>Pending Requests</h3>
      </div>

      {approvals.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', border: '1px solid var(--glass-border)', borderRadius: '20px', background: 'rgba(255,255,255,0.02)' }}>
          <p className="text-secondary">No pending approvals. Agents are standing by.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '1.5rem' }}>
          {approvals.map((req) => (
            <div key={req.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.125rem', marginBottom: '0.25rem' }}>{req.actionType}</h3>
                  <p className="text-secondary" style={{ fontSize: '0.8rem' }}>
                    Agent: <span style={{ color: 'var(--text-primary)', fontWeight: 400 }}>{req.agentName}</span>
                  </p>
                </div>
                <span style={{
                  padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 400,
                  textTransform: 'uppercase',
                  background: req.status === 'PENDING' ? 'rgba(255,255,255,0.1)' :
                    req.status === 'APPROVED' ? 'rgba(163,217,150,0.15)' : 'rgba(255,255,255,0.05)',
                  color: req.status === 'PENDING' ? 'var(--text-primary)' :
                    req.status === 'APPROVED' ? 'var(--success-color)' : 'var(--text-secondary)',
                  border: `1px solid ${req.status === 'PENDING' ? 'rgba(255,255,255,0.3)' :
                    req.status === 'APPROVED' ? 'rgba(163,217,150,0.3)' : 'rgba(255,255,255,0.1)'}`,
                }}>
                  {req.status}
                </span>
              </div>

              <div style={{
                fontSize: '0.75rem', padding: '0.75rem', borderRadius: '6px',
                background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)',
                fontFamily: 'monospace', lineHeight: '1.5',
                whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                marginBottom: '1.5rem', flex: 1
              }}>
                {req.payload}
              </div>

              {req.status === 'PENDING' && (
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto' }}>
                  <form action={updateStatus.bind(null, req.id, 'APPROVED')} style={{ flex: 1 }}>
                    <button type="submit" className="pill-btn" style={{
                      width: '100%', padding: '0.5rem',
                      background: 'rgba(163,217,150,0.15)',
                      color: 'var(--success-color)',
                      borderColor: 'rgba(163,217,150,0.3)',
                    }}>
                      ✓ Approve
                    </button>
                  </form>
                  <form action={updateStatus.bind(null, req.id, 'REJECTED')} style={{ flex: 1 }}>
                    <button type="submit" className="pill-btn" style={{
                      width: '100%', padding: '0.5rem',
                      background: 'rgba(255,255,255,0.05)',
                      color: 'var(--text-secondary)',
                      borderColor: 'rgba(255,255,255,0.1)',
                    }}>
                      ✕ Reject
                    </button>
                  </form>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
