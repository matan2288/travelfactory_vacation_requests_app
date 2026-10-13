import bcrypt from 'bcryptjs';
import { loadEnv } from 'commoneventframework';
import { initDataSource } from './data-source';
import { User, type UserRole } from './entities/user.entity';
import { VacationRequest, type VacationStatus } from './entities/vacation-request.entity';

/** Shared password for every demo account (documented in the README). */
export const DEMO_PASSWORD = 'demo1234';

// Same names and emails as frontend/src/mocks/mock-data.ts so mock and real modes look alike.
const DEMO_USERS: { name: string; email: string; role: UserRole }[] = [
  { name: 'Alex Morgan', email: 'alex.requester@company.internal', role: 'REQUESTER' },
  { name: 'Sarah Chen', email: 'sarah.dev@company.internal', role: 'REQUESTER' },
  { name: 'Marcus Vance', email: 'marcus.eng@company.internal', role: 'REQUESTER' },
  { name: 'Elena Rostova', email: 'elena.validator@company.internal', role: 'VALIDATOR' },
];

type SeedRequest = {
  email: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: VacationStatus;
  comments?: string;
};

const DEMO_REQUESTS: SeedRequest[] = [
  { email: 'alex.requester@company.internal', startDate: '2026-10-20', endDate: '2026-10-24', reason: 'Autumn family holiday & rest', status: 'APPROVED', comments: 'Approved. Enjoy your time off!' },
  { email: 'alex.requester@company.internal', startDate: '2026-11-16', endDate: '2026-11-20', reason: 'Tech symposium attendance & study leave', status: 'PENDING' },
  { email: 'alex.requester@company.internal', startDate: '2026-09-08', endDate: '2026-09-12', reason: 'Late summer trip', status: 'REJECTED', comments: 'Overlaps with the core sprint delivery and quarterly client milestone. Please reschedule for October.' },
  { email: 'sarah.dev@company.internal', startDate: '2026-10-26', endDate: '2026-10-30', reason: 'Personal leave for family relocation', status: 'APPROVED', comments: 'Approved. Handover confirmed with platform team.' },
  { email: 'sarah.dev@company.internal', startDate: '2026-12-21', endDate: '2026-12-29', reason: 'End-of-year winter holidays', status: 'PENDING' },
  { email: 'marcus.eng@company.internal', startDate: '2026-10-16', endDate: '2026-10-18', reason: 'Long weekend wellness trip', status: 'PENDING' },
  { email: 'marcus.eng@company.internal', startDate: '2026-11-23', endDate: '2026-11-27', reason: 'Annual family holiday', status: 'APPROVED', comments: 'Approved.' },
];

/** Idempotent: inserts missing demo users, and sample requests only for users that have none. */
async function seed(): Promise<void> {
  await loadEnv();
  const ds = await initDataSource();
  try {
    await ds.transaction(async (manager) => {
      const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
      await manager
        .createQueryBuilder()
        .insert()
        .into(User)
        .values(DEMO_USERS.map((u) => ({ ...u, password: passwordHash })))
        .orIgnore()
        .execute();

      const users = await manager.find(User);
      const idByEmail = new Map(users.map((u) => [u.email, u.id]));
      const seededUserIds = new Set(
        (await manager.createQueryBuilder(VacationRequest, 'r').select('DISTINCT r.user_id', 'userId').getRawMany<{ userId: string }>())
          .map((r) => r.userId),
      );

      const rows = DEMO_REQUESTS.filter((r) => !seededUserIds.has(idByEmail.get(r.email)!)).map((r) =>
        manager.create(VacationRequest, {
          userId: idByEmail.get(r.email)!,
          startDate: r.startDate,
          endDate: r.endDate,
          reason: r.reason,
          status: r.status,
          comments: r.comments ?? null,
        }),
      );
      await manager.save(rows);
      console.log(`Seed complete: ${DEMO_USERS.length} demo users ensured, ${rows.length} requests inserted.`);
    });
  } finally {
    await ds.destroy();
  }
}

if (require.main === module) {
  seed().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
