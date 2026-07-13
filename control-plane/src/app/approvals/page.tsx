import prisma from "../../lib/prisma";
import { revalidatePath } from "next/cache";

export default async function Approvals() {
  const approvals = await prisma.actionApproval.findMany({
    orderBy: { createdAt: 'desc' }
  });

  async function updateStatus(id: string, newStatus: string) {
    "use server";
    
    // Fetch approval to get details for the audit log
    const approval = await prisma.actionApproval.findUnique({ where: { id } });
    if (!approval) return;

    await prisma.actionApproval.update({
      where: { id },
      data: { status: newStatus }
    });

    await prisma.auditLog.create({
      data: {
        event: `Action ${newStatus}: ${approval.actionType} requested by ${approval.agentName}`,
        location: 'Control Plane UI',
        status: newStatus === 'APPROVED' ? 'Success' : 'Warning'
      }
    });

    revalidatePath("/approvals");
    revalidatePath("/"); // Update dashboard audit logs
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1>Action Approvals</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Review and govern high-risk actions requested by AI Agents.</p>
      </div>
      
      {approvals.length === 0 ? (
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <p>No pending approvals. Agents are standing by.</p>
        </div>
      ) : (
        <div className="grid-cards" style={{ gridTemplateColumns: '1fr' }}>
          {approvals.map((req) => (
            <div key={req.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.1rem' }}>{req.actionType}</h3>
                  <span className={`status-badge ${req.status === 'PENDING' ? 'status-active' : ''}`} style={{ background: req.status === 'APPROVED' ? 'var(--success-color)' : req.status === 'REJECTED' ? 'var(--danger-color)' : '' }}>
                    {req.status}
                  </span>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Requested by: <strong>{req.agentName}</strong></p>
                <pre style={{ fontSize: '0.75rem', background: 'rgba(0,0,0,0.3)', padding: '0.5rem', borderRadius: '4px', color: 'var(--text-secondary)' }}>
                  {req.payload}
                </pre>
              </div>
              
              {req.status === 'PENDING' && (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <form action={updateStatus.bind(null, req.id, 'APPROVED')}>
                    <button type="submit" className="btn" style={{ background: 'var(--success-color)' }}>Approve</button>
                  </form>
                  <form action={updateStatus.bind(null, req.id, 'REJECTED')}>
                    <button type="submit" className="btn" style={{ background: 'var(--danger-color)' }}>Reject</button>
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
