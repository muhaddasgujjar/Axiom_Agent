const { Pool } = require("pg");
const p = new Pool({ connectionString: process.env.DATABASE_URL });
p.query("SELECT to_regclass('public.research') AS tbl")
  .then((r) => {
    console.log("TABLE:", JSON.stringify(r.rows[0]));
    return p.query("SELECT COUNT(*) AS n FROM research");
  })
  .then((r) => {
    console.log("ROWS:", r.rows[0].n);
    return p.end();
  })
  .catch((e) => {
    console.error("ERR", e.message);
    process.exit(1);
  });
