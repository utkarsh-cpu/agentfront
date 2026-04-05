import path from 'node:path'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import { PrismaClient } from '@prisma/client'

function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL ?? 'file:./prisma/dev.db'

  if (!databaseUrl.startsWith('file:')) {
    return databaseUrl
  }

  const filePath = databaseUrl.slice('file:'.length)
  if (path.isAbsolute(filePath)) {
    return databaseUrl
  }

  return `file:${path.resolve(process.cwd(), filePath)}`
}

declare global {
  var __prisma__: PrismaClient | undefined
}

const adapter = new PrismaLibSql({
  url: getDatabaseUrl(),
})

export const prisma = globalThis.__prisma__ ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma__ = prisma
}