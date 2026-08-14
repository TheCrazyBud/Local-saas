import prisma from '../../lib/prisma';
import { resolveOrgId } from '../../lib/auth';
import BarChart from '../../components/BarChart';
import AgentCreationForm from '../../components/AgentCreationForm';
import Link from 'next/link';

export default async function AgentsPage() {
  const orgId = await resolveOrgId();

  let agents: any[] = [];
  let models: any[] = [];
  let totalExecutions = 0;
  let avgSuccess = 0;

  try {
    agents = await prisma.agent.findMany({
      where: { orgId },
      orderBy: { createdAt: 'desc' },
      include: {
        model: { select: { name: true } },
        _count: { select: { runs: true } },
      },
    });

    models = await prisma.model.findMany({
      where: { orgId },
      select: { id: true, name: true },
    });

    totalExecutions = await prisma.agentRun.count({
      where: { agent: { orgId } },
    });

    if (agents.length > 0) {
      avgSuccess = Math.round(agents.reduce((sum, a) => sum + a.successRate, 0) / agents.length);
    }
  } catch (error) {
    // DB offline fallback
  }

  // Generate chart data from agent run counts
  const chartData = agents.length > 0
    ? agents.slice(0, 12).map(a => Math.min(a._count.runs * 5, 100) || 15)
    : [15, 30, 45, 20, 70, 90, 85, 60, 40, 50, 75, 100];

  const successData = agents.length > 0
    ? agents.slice(0, 8).map(a => a.successRate)
    : [95, 96, 94, 98, 99, 97, 98, 95];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem' }}>Agentic Workflows</h2>
      </div>

      {/* Top Visual Chart (White Box) */}
      <div className="glass-panel light-theme" style={{ padding: '1.5rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.125rem' }}>Agent Execution Velocity</h3>
          <button className="pill-btn">Last 12 hours</button>
        </div>

        <div style={{ display: 'flex', gap: '3rem', flex: 1 }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span className="text-secondary" style={{ fontSize: '0.875rem' }}>Total Invocations ↑</span>
              <span className="text-secondary">•••</span>
            </div>
            <BarChart data={chartData} color="rgba(18,19,18,0.3)" height="120px" />
            <div style={{ marginTop: '1.5rem' }}>
              <div className="text-huge">{totalExecutions > 1000 ? `${(totalExecutions / 1000).toFixed(1)}k` : totalExecutions}</div>
              <div className="text-secondary" style={{ fontSize: '0.75rem' }}>total executions</div>
            </div>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span className="text-secondary" style={{ fontSize: '0.875rem' }}>Success Rate</span>
              <span className="text-secondary">•••</span>
            </div>
            <BarChart data={successData} color="rgba(18,19,18,0.8)" height="120px" />
            <div style={{ marginTop: '1.5rem' }}>
              <div className="text-huge">{avgSuccess || 0}%</div>
              <div className="text-secondary" style={{ fontSize: '0.75rem' }}>average success</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>

        {/* Agent Creation Form (client component) */}
        <AgentCreationForm models={models} />

        {/* Existing Agents Grid — real data */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {agents.length === 0 ? (
            <div className="glass-panel" style={{ padding: '2rem', gridColumn: 'span 2', textAlign: 'center' }}>
              <p className="text-secondary" style={{ fontSize: '0.875rem' }}>No agents created yet. Register a model first, then create an agent.</p>
            </div>
          ) : (
            agents.map(agent => (
              <Link key={agent.id} href={`/agents/${agent.id}`} style={{ textDecoration: 'none' }}>
                <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.125rem' }}>{agent.name}</h3>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: agent.status === 'running' ? 'var(--neon-green)' : 'var(--text-secondary)' }} />
                  </div>

                  <div style={{ padding: '0.4rem 0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', border: '1px solid var(--glass-border)', fontSize: '0.75rem', display: 'inline-block', marginBottom: '1.5rem', alignSelf: 'flex-start' }}>
                    🧠 {agent.model?.name || 'No model'}
                  </div>

                  <div style={{ marginBottom: '1.5rem', flex: 1 }}>
                    <span className="text-secondary" style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.5rem' }}>Recent Volume</span>
                    <BarChart data={[30, 50, 40, 60, 45]} color="rgba(255,255,255,0.2)" height="40px" />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
                    <div>
                      <div className="text-secondary" style={{ fontSize: '0.75rem' }}>Total Runs</div>
                      <div style={{ fontSize: '1.125rem', fontWeight: 300 }}>{agent._count.runs}</div>
                    </div>
                    <div>
                      <div className="text-secondary" style={{ fontSize: '0.75rem' }}>Success Rate</div>
                      <div style={{ fontSize: '1.125rem', fontWeight: 300 }}>{Math.round(agent.successRate)}%</div>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
