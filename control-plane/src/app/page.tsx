import prisma from '../lib/prisma';
import { resolveOrgId } from '../lib/auth';
import BarChart from '../components/BarChart';

export default async function Home() {
  const orgId = await resolveOrgId();

  // Aggregate real data scoped to current org
  let totalTokens = 0;
  let totalRuns = 0;
  let activeAgents = 0;
  let totalModels = 0;
  let pendingApprovals = 0;
  let recentRuns: any[] = [];
  let auditLogs: any[] = [];

  try {
    const tokenAgg = await prisma.agentRun.aggregate({
      where: { agent: { orgId } },
      _sum: { tokensUsed: true },
    });
    totalTokens = tokenAgg._sum.tokensUsed || 0;

    totalRuns = await prisma.agentRun.count({ where: { agent: { orgId } } });
    activeAgents = await prisma.agent.count({ where: { orgId } });
    totalModels = await prisma.model.count({ where: { orgId } });
    pendingApprovals = await prisma.actionApproval.count({ where: { orgId, status: 'PENDING' } });

    recentRuns = await prisma.agentRun.findMany({
      where: { agent: { orgId } },
      orderBy: { createdAt: 'desc' },
      take: 7,
      include: { agent: { select: { name: true } } }
    });

    auditLogs = await prisma.auditLog.findMany({
      where: { orgId },
      orderBy: { createdAt: 'desc' },
      take: 5
    });
  } catch (error) {
    // DB offline fallback
  }

  const now = new Date();
  const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateString = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' });

  // Generate mock bar data from recent runs
  const barData = recentRuns.length > 0
    ? recentRuns.map(r => Math.min(r.tokensUsed / 10, 100))
    : [40, 55, 30, 70, 90, 80, 60];

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', padding: '0 1rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 400 }}>Overview</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.5rem', fontWeight: 300, letterSpacing: '0.05em' }}>{timeString}</span>
          <span className="text-secondary" style={{ fontSize: '0.75rem', marginTop: '0.2rem' }}>Time</span>
        </div>
        <div style={{ fontSize: '1.5rem', fontWeight: 300, letterSpacing: '0.05em' }}>
          {dateString}
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Row 1: Token Usage (span 2), Infrastructure (1), Active Agents (1) */}
        
        {/* Token Usage & Agent Runs */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gridColumn: 'span 2' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 400 }}>Total system usage</h3>
            <button className="pill-btn">Change module</button>
          </div>

          <div style={{ display: 'flex', gap: '2rem', flex: 1 }}>
            {/* Tokens */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span className="text-secondary" style={{ fontSize: '0.75rem' }}>Tokens ↑</span>
                <span className="text-secondary">•••</span>
              </div>
              <BarChart data={barData} color="rgba(255,255,255,0.8)" height="120px" />
              <div style={{ marginTop: '1.5rem' }}>
                <div className="text-huge">{totalTokens > 1000 ? `${(totalTokens / 1000).toFixed(1)}k` : totalTokens}</div>
                <div className="text-secondary" style={{ fontSize: '0.7rem' }}>total processed</div>
              </div>
            </div>

            {/* Runs */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span className="text-secondary" style={{ fontSize: '0.75rem' }}>Agent Runs ↓</span>
                <span className="text-secondary">•••</span>
              </div>
              <BarChart data={[35, 60, 45, 80, 55, 70, 90]} color="rgba(255,255,255,0.3)" height="120px" />
              <div style={{ marginTop: '1.5rem' }}>
                <div className="text-huge">{totalRuns}</div>
                <div className="text-secondary" style={{ fontSize: '0.7rem' }}>executions</div>
              </div>
            </div>

            {/* Models */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span className="text-secondary" style={{ fontSize: '0.75rem' }}>Models ↓</span>
                <span className="text-secondary">•••</span>
              </div>
              <BarChart data={[20, 40, 60, 80, 100, 80, 60]} color="rgba(255,255,255,0.6)" height="120px" />
              <div style={{ marginTop: '1.5rem' }}>
                <div className="text-huge">{totalModels}</div>
                <div className="text-secondary" style={{ fontSize: '0.7rem' }}>registered</div>
              </div>
            </div>
          </div>
        </div>

        {/* Infrastructure */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 400 }}>Cluster connections</h3>
            <span className="text-secondary">•••</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span className="text-secondary" style={{ fontSize: '0.75rem' }}>Docker Connected</span>
            <div className="toggle-switch"></div>
          </div>

          <div style={{
            flex: 1,
            border: '1px dashed rgba(255,255,255,0.1)',
            borderRadius: '12px',
            marginBottom: '1.5rem',
            background: 'rgba(255,255,255,0.02)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-secondary)'
          }}>
            <div style={{ fontSize: '0.75rem', textAlign: 'center', padding: '1rem' }}>
              <div>[ Postgres Active ]</div>
              <div style={{ margin: '0.5rem 0' }}>[ Redis Active ]</div>
              <div>[ Gateway 8000 ]</div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="text-secondary" style={{ fontSize: '0.875rem' }}>Capacity</span>
            <span style={{ fontSize: '1.25rem', fontWeight: 300 }}>99%</span>
          </div>
          <div style={{ marginTop: '0.5rem', height: '1px', background: 'var(--glass-border)', overflow: 'hidden' }}>
            <div style={{ width: '99%', height: '100%', background: '#fff' }}></div>
          </div>
        </div>

        {/* Recommendations / Active Agents */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 400 }}>Recommendations</h3>
            <span className="text-secondary">•••</span>
          </div>
          <p className="text-secondary" style={{ fontSize: '0.75rem', marginBottom: '1.5rem' }}>Personalized tips for optimizing infrastructure</p>
          
          <div className="glass-panel light-theme" style={{ padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', flex: 1 }}>
            <p style={{ fontSize: '0.75rem', lineHeight: '1.4', marginBottom: '1rem' }}>
              Capacity is optimal! We recommend deploying more agents to maximize cluster usage before idle timeout.
            </p>
            <p className="text-secondary" style={{ fontSize: '0.7rem' }}>Today recommendation</p>
          </div>
          
          <div>
            <p style={{ fontSize: '0.75rem', lineHeight: '1.4', marginBottom: '0.5rem' }}>Review pending approvals to unblock agents.</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }}>
              <span className="text-secondary">Analysis</span>
              <span className="text-secondary">5 min</span>
            </div>
          </div>
        </div>

        {/* Row 2: Tracking (1 - Light), Audit Logs (1), Privacy Gateway (2 - Light) */}
        
        {/* Tracking */}
        <div className="glass-panel light-theme" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 400 }}>Tracking</h3>
              <span className="text-secondary">•••</span>
            </div>
            <p className="text-secondary" style={{ fontSize: '0.75rem' }}>Pending actions</p>
          </div>
          <div>
            <div className="text-huge">{pendingApprovals}</div>
            <div className="text-secondary" style={{ fontSize: '0.75rem' }}>actions waiting</div>
          </div>
        </div>

        {/* Detailed Report / Audit Logs */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 400 }}>Detailed report</h3>
            <button className="pill-btn">Week ↓</button>
          </div>
          <p className="text-secondary" style={{ fontSize: '0.75rem', marginBottom: '1.5rem' }}>Graphs of agent activity</p>

          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '100px', marginBottom: '1rem' }}>
            {[40, 50, 90, 60, 45, 30, 20].map((h, i) => (
              <div key={i} style={{ 
                flex: 1, 
                height: `${h}%`, 
                background: i === 2 ? '#fff' : 'rgba(255,255,255,0.1)', 
                borderRadius: '2px' 
              }}></div>
            ))}
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem' }} className="text-secondary">
            <span>Mon</span><span>Tue</span><span style={{color: '#fff'}}>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
          </div>
        </div>

        {/* Privacy Gateway / Green Energy */}
        <div className="glass-panel light-theme" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gridColumn: 'span 2' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 400 }}>Privacy gateway usage</h3>
            <button className="pill-btn">Change</button>
          </div>
          <p className="text-secondary" style={{ fontSize: '0.75rem', marginBottom: '2rem' }}>PII masking coverage</p>

          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div>
              <div className="text-huge">99%</div>
              <div className="text-secondary" style={{ fontSize: '0.75rem' }}>11AM — 3PM</div>
            </div>

            <div style={{ flex: 1, position: 'relative', height: '40px', display: 'flex', alignItems: 'center', padding: '0 2rem' }}>
              <div style={{ position: 'absolute', top: '50%', left: '1rem', right: '1rem', height: '1px', background: 'rgba(18,19,18,0.2)' }}></div>
              <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} style={{ 
                    width: i === 1 || i === 5 ? '12px' : '20px', 
                    height: i === 1 || i === 5 ? '12px' : '20px', 
                    borderRadius: '50%', 
                    background: i === 1 || i === 5 ? 'transparent' : '#121312',
                    border: i === 1 || i === 5 ? '1px solid rgba(18,19,18,0.3)' : 'none',
                    transform: 'translateY(-50%)',
                    marginTop: '8px'
                  }}></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
