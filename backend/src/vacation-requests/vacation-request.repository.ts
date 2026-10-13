import { Brackets } from 'typeorm';
import { getDataSource } from '../database/data-source';
import { VacationRequest, type VacationStatus } from '../database/entities/vacation-request.entity';
import { fromDatabaseError } from '../shared/errors';
import type { ListVacationRequestsQuery } from './vacation-request.schemas';

const repo = () => getDataSource().getRepository(VacationRequest);

const withUser = () => repo().createQueryBuilder('r').innerJoinAndSelect('r.user', 'u');

const escapeLike = (value: string) => value.replace(/[\\%_]/g, '\\$&');

export const vacationRequestRepository = {
  /** Overlaps are rejected by the `vacation_requests_no_overlap` exclusion constraint (race-safe). */
  async insert(data: Pick<VacationRequest, 'userId' | 'startDate' | 'endDate' | 'reason'>): Promise<string> {
    try {
      const saved = await repo().save(repo().create({ ...data, status: 'PENDING' }));
      return saved.id;
    } catch (error) {
      throw fromDatabaseError(error);
    }
  },

  findById(id: string): Promise<VacationRequest | null> {
    return repo().findOneBy({ id });
  },

  findByIdWithUser(id: string): Promise<VacationRequest | null> {
    return withUser().where('r.id = :id', { id }).getOne();
  },

  /**
   * Atomic PENDING -> APPROVED/REJECTED transition. The `status = 'PENDING'` guard in the UPDATE makes
   * concurrent decisions safe without explicit locks: only one caller can match the row.
   * Returns false when the request is missing or already decided.
   */
  async decide(id: string, status: Exclude<VacationStatus, 'PENDING'>, comments: string | null): Promise<boolean> {
    const result = await repo()
      .createQueryBuilder()
      .update()
      .set({ status, comments })
      .where('id = :id AND status = :pending', { id, pending: 'PENDING' })
      .execute();
    return result.affected === 1;
  },

  listByUser(userId: string): Promise<VacationRequest[]> {
    return withUser().where('r.userId = :userId', { userId }).orderBy('r.createdAt', 'DESC').addOrderBy('r.id', 'DESC').getMany();
  },

  /** Pending first, then newest; `id` breaks ties so pages are stable. */
  listPaged({ status, userId, search, page, pageSize }: ListVacationRequestsQuery): Promise<[VacationRequest[], number]> {
    const query = withUser();
    if (status && status !== 'ALL') query.andWhere('r.status = :status', { status });
    if (userId) query.andWhere('r.userId = :userId', { userId });
    if (search) {
      const term = `%${escapeLike(search)}%`;
      query.andWhere(
        new Brackets((qb) => qb.where('u.name ILIKE :term', { term }).orWhere('u.email ILIKE :term').orWhere('r.reason ILIKE :term')),
      );
    }
    return query
      .orderBy(`CASE WHEN r.status = 'PENDING' THEN 0 ELSE 1 END`, 'ASC')
      .addOrderBy('r.createdAt', 'DESC')
      .addOrderBy('r.id', 'DESC')
      // offset/limit (not skip/take) is correct here: the join is many-to-one, so rows never multiply.
      .offset((page - 1) * pageSize)
      .limit(pageSize)
      .getManyAndCount();
  },

  /** Requests that reserve dates (PENDING/APPROVED) and touch the inclusive range. */
  listActiveInRange(start: string, end: string): Promise<VacationRequest[]> {
    return withUser()
      .where('r.status IN (:...statuses)', { statuses: ['PENDING', 'APPROVED'] })
      .andWhere('r.startDate <= :end AND r.endDate >= :start', { start, end })
      .orderBy('r.startDate', 'ASC')
      .getMany();
  },
};
