import prisma from './prisma';
import * as crypto from 'crypto';

/**
 * Hash a plaintext password with SHA-256.
 * In production, use bcrypt or argon2 instead.
 */
export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

/**
 * Verify a plaintext password against a hash.
 */
export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

/**
 * Get the default organization (for single-org mode or fallback).
 * This is the org created by the seed script.
 */
export async function getDefaultOrg() {
  const org = await prisma.organization.findFirst({
    orderBy: { createdAt: 'asc' },
  });
  return org;
}

/**
 * Get org by ID with settings.
 */
export async function getOrgWithSettings(orgId: string) {
  return prisma.organization.findUnique({
    where: { id: orgId },
    include: { settings: true },
  });
}

/**
 * Resolve the current orgId from a cookie or fallback to default.
 * In a full auth system, this would come from the JWT session.
 * For now, we use a simpler approach: check for an orgId cookie,
 * otherwise return the first/default org.
 */
export async function resolveOrgId(cookieOrgId?: string | null): Promise<string> {
  if (cookieOrgId) {
    const org = await prisma.organization.findUnique({ where: { id: cookieOrgId } });
    if (org) return org.id;
  }
  
  const defaultOrg = await getDefaultOrg();
  if (!defaultOrg) {
    throw new Error('No organization found. Run `npx prisma db seed` first.');
  }
  return defaultOrg.id;
}
