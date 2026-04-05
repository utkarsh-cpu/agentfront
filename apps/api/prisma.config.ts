import { defineConfig } from 'prisma/config'

function getDatabaseUrl() {
  return process.env.DATABASE_URL ?? 'file:./prisma/dev.db'
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: getDatabaseUrl(),
  },
})