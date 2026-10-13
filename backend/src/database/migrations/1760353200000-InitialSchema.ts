import type { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1760353200000 implements MigrationInterface {
  name = 'InitialSchema1760353200000';

  async up(queryRunner: QueryRunner): Promise<void> {
    // btree_gist lets the exclusion constraint combine `user_id =` with `daterange &&`.
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS btree_gist`);
    await queryRunner.query(`CREATE TYPE user_role AS ENUM ('REQUESTER', 'VALIDATOR')`);
    await queryRunner.query(`CREATE TYPE vacation_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED')`);

    await queryRunner.query(`
      CREATE TABLE users (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name text NOT NULL,
        email text NOT NULL CONSTRAINT users_email_unique UNIQUE,
        password text NOT NULL,
        role user_role NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE vacation_requests (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        start_date date NOT NULL,
        end_date date NOT NULL,
        reason text,
        status vacation_status NOT NULL DEFAULT 'PENDING',
        comments text,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT vacation_requests_end_after_start CHECK (end_date > start_date),
        CONSTRAINT vacation_requests_rejection_comment CHECK (
          status <> 'REJECTED' OR (comments IS NOT NULL AND btrim(comments) <> '')
        ),
        -- Inclusive bounds '[]': a request ending on day X conflicts with one starting on day X.
        -- Only PENDING/APPROVED requests reserve dates, so a rejected request frees its range.
        CONSTRAINT vacation_requests_no_overlap EXCLUDE USING gist (
          user_id WITH =,
          daterange(start_date, end_date, '[]') WITH &&
        ) WHERE (status IN ('PENDING', 'APPROVED'))
      )
    `);

    await queryRunner.query(
      `CREATE INDEX vacation_requests_user_created_idx ON vacation_requests (user_id, created_at DESC)`,
    );
    await queryRunner.query(
      `CREATE INDEX vacation_requests_status_created_idx ON vacation_requests (status, created_at DESC)`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE vacation_requests`);
    await queryRunner.query(`DROP TABLE users`);
    await queryRunner.query(`DROP TYPE vacation_status`);
    await queryRunner.query(`DROP TYPE user_role`);
  }
}
