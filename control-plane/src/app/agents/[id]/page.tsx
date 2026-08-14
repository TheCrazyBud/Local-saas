import prisma from '../../../lib/prisma';
import { notFound } from 'next/navigation';
import BarChart from '../../../components/BarChart';
import AgentChatInterface from '../../../components/AgentChatInterface';

export default async function AgentDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let agent: any = null;
  let recentRuns: any[] = [];

  try {
    agent = await prisma.agent.findUnique({
      where: { id },
      include: {
        model: { select: { name: true } },
        _count: { select: { runs: true, conversations: true } },
      },
    });

    if (!agent) {
      notFound();
    }

    recentRuns = await prisma.agentRun.findMany({
      where: { agentId: id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
  } catch (error) {
    notFound();
  }

  const runChartData = recentRuns.length > 0
    ? recentRuns.map(r => Math.min(r.tokensUsed / 10, 100))
    : [40, 55, 30, 70, 90, 80, 60];

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem' }}>{agent.name}</h2>
          <span style={{
            padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 400,
            background: agent.status === 'running' ? 'rgba(163,217,150,0.15)' : 'rgba(255,255,255,0.05)',
            color: agent.status === 'running' ? 'var(--neon-green)' : 'var(--text-secondary)',
            textTransform: 'uppercase'
          }}>{agent.status}</span>
        </div>
        <div className="text-secondary" style={{ fontSize: '0.875rem' }}>
          Model: {agent.model?.name || 'None assigned'}
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div className="text-secondary" style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>Total Runs</div>
          <div className="text-huge">{agent._count.runs}</div>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div className="text-secondary" style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>Success Rate</div>
          <div className="text-huge">{Math.round(agent.successRate)}%</div>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div className="text-secondary" style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>Conversations</div>
          <div className="text-huge">{agent._count.conversations}</div>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div className="text-secondary" style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>Max Tokens</div>
          <div className="text-huge">{agent.maxTokens}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Configuration */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.125rem', marginBottom: '1.5rem' }}>Configuration</h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div>
              <div className="text-secondary" style={{ fontSize: '0.75rem' }}>System Prompt</div>
              <div style={{ fontSize: '0.875rem', marginTop: '0.25rem', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', fontFamily: 'monospace', fontSize: '0.75rem', lineHeight: '1.5' }}>
                {agent.systemPrompt}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <div className="text-secondary" style={{ fontSize: '0.75rem' }}>Temperature</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 300 }}>{agent.temperature}</div>
              </div>
              <div>
                <div className="text-secondary" style={{ fontSize: '0.75rem' }}>Max Tokens</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 300 }}>{agent.maxTokens}</div>
              </div>
            </div>
            <div>
              <div className="text-secondary" style={{ fontSize: '0.75rem' }}>Description</div>
              <div style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>{agent.description}</div>
            </div>
          </div>
        </div>

        {/* Chat Interface (client component) */}
        <AgentChatInterface agentId={agent.id} agentName={agent.name} />
      </div>

      {/* Execution History */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.125rem' }}>Execution History</h3>
          <span className="text-secondary" style={{ fontSize: '0.75rem' }}>{recentRuns.length} recent runs</span>
        </div>

        {/* Run volume chart */}
        <div style={{ marginBottom: '1.5rem' }}>
          <BarChart data={runChartData} color="rgba(255,255,255,0.3)" height="60px" />
        </div>

        {recentRuns.length === 0 ? (
          <p className="text-secondary" style={{ fontSize: '0.875rem' }}>No execution history yet. Run the agent to see results here.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 400 }} className="text-secondary">Time</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 400 }} className="text-secondary">Input</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 400 }} className="text-secondary">Output</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 400 }} className="text-secondary">Tokens</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 400 }} className="text-secondary">Latency</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 400 }} className="text-secondary">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentRuns.map(run => (
                  <tr key={run.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                    <td style={{ padding: '0.75rem' }}>{new Date(run.createdAt).toLocaleTimeString()}</td>
                    <td style={{ padding: '0.75rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{run.input}</td>
                    <td style={{ padding: '0.75rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{run.output}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>{run.tokensUsed}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>{run.latencyMs}ms</td>
                    <td style={{ padding: '0.75rem', textAlign: 'right', color: run.status === 'success' ? 'var(--neon-green)' : 'var(--text-secondary)' }}>{run.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
