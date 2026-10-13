import { loadEnv } from 'commoneventframework';
import { initDataSource } from './data-source';

/** Runs pending migrations, or reverts the last one with `--revert`. */
async function main(): Promise<void> {
  await loadEnv();
  const ds = await initDataSource();
  try {
    if (process.argv.includes('--revert')) {
      await ds.undoLastMigration({ transaction: 'all' });
      console.log('Reverted the last migration.');
    } else {
      const applied = await ds.runMigrations({ transaction: 'all' });
      console.log(applied.length ? `Applied: ${applied.map((m) => m.name).join(', ')}` : 'No pending migrations.');
    }
  } finally {
    await ds.destroy();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
