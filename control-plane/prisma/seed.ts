import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Create default organization
  const defaultOrg = await prisma.organization.upsert({
    where: { slug: 'default' },
    update: {},
    create: {
      name: 'Default Organization',
      slug: 'default',
      plan: 'enterprise',
    },
  });
  console.log(`  ✓ Organization: ${defaultOrg.name} (${defaultOrg.id})`);

  // 2. Create default admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@enterprise.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@enterprise.com',
      passwordHash: hashPassword('password'),
    },
  });
  console.log(`  ✓ User: ${adminUser.name} (${adminUser.email})`);

  // 3. Add admin to org as owner
  await prisma.orgMembership.upsert({
    where: { userId_orgId: { userId: adminUser.id, orgId: defaultOrg.id } },
    update: {},
    create: {
      userId: adminUser.id,
      orgId: defaultOrg.id,
      role: 'owner',
    },
  });
  console.log('  ✓ Admin → Default Org (owner)');

  // 4. Create default teams
  const engineeringTeam = await prisma.team.upsert({
    where: { id: 'team-engineering' },
    update: {},
    create: {
      id: 'team-engineering',
      name: 'Engineering',
      orgId: defaultOrg.id,
    },
  });

  const opsTeam = await prisma.team.upsert({
    where: { id: 'team-operations' },
    update: {},
    create: {
      id: 'team-operations',
      name: 'Operations',
      orgId: defaultOrg.id,
    },
  });
  console.log('  ✓ Teams: Engineering, Operations');

  // 5. Add admin to engineering team
  await prisma.teamMembership.upsert({
    where: { userId_teamId: { userId: adminUser.id, teamId: engineeringTeam.id } },
    update: {},
    create: {
      userId: adminUser.id,
      teamId: engineeringTeam.id,
      role: 'lead',
    },
  });

  // 6. Create org settings
  await prisma.orgSettings.upsert({
    where: { orgId: defaultOrg.id },
    update: {},
    create: {
      orgId: defaultOrg.id,
      ollamaEndpoint: 'http://localhost:11434',
      gatewayEndpoint: 'http://localhost:8000',
      apiKey: 'enterprise-secret-key-123',
      defaultTemp: 0.7,
      defaultMaxTokens: 2048,
    },
  });
  console.log('  ✓ Org Settings configured');

  // 7. Backfill orgId on any existing records that don't have one
  await prisma.model.updateMany({ where: { orgId: '' }, data: { orgId: defaultOrg.id } });
  await prisma.agent.updateMany({ where: { orgId: '' }, data: { orgId: defaultOrg.id } });
  await prisma.deployment.updateMany({ where: { orgId: '' }, data: { orgId: defaultOrg.id } });
  await prisma.actionApproval.updateMany({ where: { orgId: '' }, data: { orgId: defaultOrg.id } });
  await prisma.auditLog.updateMany({ where: { orgId: '' }, data: { orgId: defaultOrg.id } });
  console.log('  ✓ Backfilled orgId on existing records');

  console.log('🎉 Seed complete!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Seed failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
