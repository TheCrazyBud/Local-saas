import prisma from '../../lib/prisma';
import { resolveOrgId } from '../../lib/auth';
import BarChart from '../../components/BarChart';
import ModelRegistrationForm from '../../components/ModelRegistrationForm';

export default async function ModelsPage() {
  const orgId = await resolveOrgId();

  let models: any[] = [];
  let totalRuns = 0;

  try {
    models = await prisma.model.findMany({
      where: { orgId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { agents: true, runs: true } },
      },
    });

    const runAgg = await prisma.agentRun.aggregate({
      where: { model: { orgId } },
      _sum: { tokensUsed: true },
    });
    totalRuns = runAgg._sum.tokensUsed || 0;
  } catch (error) {
    // DB offline fallback
  }

  // Generate chart data from model run counts
  const chartData = models.length > 0
    ? models.map(m => Math.min(m._count.runs * 10, 100) || 10)
    : [10, 25, 45, 30, 60, 80, 55, 90, 75, 40];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem' }}>Model Intelligence & Registry</h2>
      </div>

      {/* Top Visual Chart (White Box) */}
      <div className="glass-panel light-theme" style={{ padding: '1.5rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.125rem' }}>Model Intelligence & Registry</h3>
          <button className="pill-btn">This month</button>
        </div>

        <div style={{ display: 'flex', gap: '3rem', flex: 1 }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span className="text-secondary" style={{ fontSize: '0.875rem' }}>Model Usage ↑</span>
              <span className="text-secondary">•••</span>
            </div>
            <BarChart data={chartData} color="rgba(18,19,18,0.2)" height="120px" />
            <div style={{ marginTop: '1.5rem' }}>
              <div className="text-huge">{totalRuns > 1000 ? `${(totalRuns / 1000).toFixed(1)}k` : totalRuns}</div>
              <div className="text-secondary" style={{ fontSize: '0.75rem' }}>tokens processed</div>
            </div>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span className="text-secondary" style={{ fontSize: '0.875rem' }}>Registered Models</span>
              <span className="text-secondary">•••</span>
            </div>
            <BarChart data={[20, 30, 45, 80, 50, 60, 40]} color="rgba(18,19,18,0.8)" height="120px" />
            <div style={{ marginTop: '1.5rem' }}>
              <div className="text-huge">{models.length}</div>
              <div className="text-secondary" style={{ fontSize: '0.75rem' }}>models in registry</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>

        {/* Register Model Form (client component) */}
        <ModelRegistrationForm />

        {/* Existing Models Grid — real data */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {models.length === 0 ? (
            <div className="glass-panel" style={{ padding: '2rem', gridColumn: 'span 2', textAlign: 'center' }}>
              <p className="text-secondary" style={{ fontSize: '0.875rem' }}>No models registered yet. Use the form to connect your first model.</p>
            </div>
          ) : (
            models.map(model => (
              <div key={model.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.25rem' }}>{model.name}</h3>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: model.status === 'loaded' || model.status === 'available' ? 'var(--success-color)' : 'var(--text-secondary)' }} />
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                  <div style={{ padding: '0.4rem 0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', border: '1px solid var(--glass-border)', fontSize: '0.7rem' }}>
                    {model.provider}
                  </div>
                  {model.parameterCount && (
                    <div style={{ padding: '0.4rem 0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', border: '1px solid var(--glass-border)', fontSize: '0.7rem' }}>
                      {model.parameterCount}
                    </div>
                  )}
                </div>

                <div style={{ marginBottom: '1.5rem', flex: 1 }}>
                  <span className="text-secondary" style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.5rem' }}>Activity</span>
                  <BarChart data={[30, 45, 60, 40, 70]} color="rgba(255,255,255,0.2)" height="40px" />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
                  <div>
                    <div className="text-secondary" style={{ fontSize: '0.75rem' }}>Active Agents</div>
                    <div style={{ fontSize: '1.125rem', fontWeight: 300 }}>{model._count.agents}</div>
                  </div>
                  <div>
                    <div className="text-secondary" style={{ fontSize: '0.75rem' }}>Total Runs</div>
                    <div style={{ fontSize: '1.125rem', fontWeight: 300 }}>{model._count.runs}</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
