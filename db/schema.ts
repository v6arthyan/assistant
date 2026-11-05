import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
export const aiUsage = sqliteTable('ai_usage', {
  bucket: text('bucket').primaryKey(),
  attempts: integer('attempts').notNull().default(0),
});
