---
name: Supabase schema setup
description: The environment-specific boundary between the Replit Supabase connector and database schema management.
---

The Replit Supabase connector exposes the project's PostgREST data API, not a SQL execution endpoint for creating tables.

**Why:** A request to a missing table returns a PostgREST schema-cache error, while the connector can only read and mutate rows in tables that already exist.

**How to apply:** Keep an idempotent schema SQL file in the project and direct the user to run it once in Supabase SQL Editor before testing client persistence.