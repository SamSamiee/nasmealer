# Database Migrations

## Empty Plan Cleanup Migration

### What This Does

This migration adds automatic cleanup of empty plans in the database. When a meal is deleted:

1. The `ON DELETE CASCADE` constraint automatically removes the meal from all plans (via `meals_in_plan` table)
2. A database trigger checks if any plans now have zero meals
3. Plans with no meals are automatically deleted

### How It Works

- **Function**: `cleanup_empty_plans()` - Checks if a plan has no meals and deletes it
- **Trigger**: `cleanup_empty_plans_trigger` - Runs after each deletion from `meals_in_plan` table

### Applying to Existing Databases

If you have an existing database, run the migration script:

```bash
# Option 1: Using psql
psql -h <host> -U <user> -d <database> -f migrations/add_empty_plan_cleanup.sql

# Option 2: Using Node.js (if you have a connection script)
node -e "
const { Pool } = require('pg');
const fs = require('fs');
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});
const sql = fs.readFileSync('migrations/add_empty_plan_cleanup.sql', 'utf8');
pool.query(sql).then(() => {
  console.log('Migration applied successfully');
  process.exit(0);
}).catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
"
```

### For New Databases

The trigger is automatically included in `database.sql`, so new databases will have this functionality from the start.

### Testing

To verify it works:

1. Create a plan with some meals
2. Delete all the meals used in that plan
3. Check that the plan is automatically deleted (it should not appear in your plans list)


