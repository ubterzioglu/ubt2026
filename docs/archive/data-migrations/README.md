# Data Migration Archive

This folder keeps non-sensitive migration notes and redacted examples for one-off data moves.

Raw CVOpt participant exports are not stored in the tracked repository because they contain names, LinkedIn URLs, WhatsApp/phone numbers, and review status data. The local copies were moved to:

```text
.local-archive/private-data/cvopt/
```

That directory is ignored by Git. If a future migration needs those raw files, retrieve them from the local/private archive or export fresh data from Supabase with the correct access controls.

