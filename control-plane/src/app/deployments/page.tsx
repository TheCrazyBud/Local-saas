import prisma from "../../lib/prisma";
import { revalidatePath } from "next/cache";

export default async function Deployments() {
  const deployments = await prisma.deployment.findMany({
    orderBy: { createdAt: 'desc' }
  });

  async function addDeployment() {
    "use server";
    await prisma.deployment.create({
      data: {
        name: `Llama-3-${Math.floor(Math.random() * 100)}B-MoE`,
        region: ["EU Central", "US East", "Asia Pacific"][Math.floor(Math.random() * 3)],
        vpcId: `vpc-${Math.floor(Math.random() * 90000) + 10000}`,
      }
    });
    revalidatePath("/deployments");
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1>Deployments</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>View and manage active model deployments across regions.</p>
        </div>
        <form action={addDeployment}>
          <button className="btn" type="submit">Add Deployment</button>
        </form>
      </div>
      
      {deployments.length === 0 ? (
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <p>No deployments found. Create one to get started.</p>
        </div>
      ) : (
        <div className="grid-cards">
          {deployments.map((dep) => (
            <div key={dep.id} className="glass-panel" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{dep.name}</h3>
              <p style={{ fontSize: '0.875rem' }}>Region: {dep.region}</p>
              <p style={{ fontSize: '0.875rem' }}>VPC: {dep.vpcId}</p>
              <p style={{ color: 'var(--success-color)', fontSize: '0.875rem', marginTop: '0.5rem' }}>Status: {dep.status}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
