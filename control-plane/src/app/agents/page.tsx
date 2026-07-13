import prisma from "../../lib/prisma";
import { revalidatePath } from "next/cache";

export default async function Agents() {
  const agents = await prisma.agent.findMany({
    orderBy: { createdAt: 'desc' }
  });

  async function createAgent() {
    "use server";
    await prisma.agent.create({
      data: {
        name: ["HR Onboarding Agent", "IT Support Bot", "Finance Auditor", "Data Analyst"][Math.floor(Math.random() * 4)],
        description: "Automates internal enterprise workflows dynamically.",
      }
    });
    revalidatePath("/agents");
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1>AI Agents</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Manage micro-agent workflows and connections.</p>
        </div>
        <form action={createAgent}>
          <button className="btn" type="submit">Create Agent</button>
        </form>
      </div>
      
      {agents.length === 0 ? (
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <p>No agents configured yet.</p>
        </div>
      ) : (
        <div className="grid-cards">
          {agents.map((agent) => (
            <div key={agent.id} className="glass-panel" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>{agent.name}</h3>
                  <span className="status-badge status-active">{agent.status}</span>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{agent.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
