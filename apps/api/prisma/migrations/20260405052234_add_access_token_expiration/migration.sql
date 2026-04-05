/*
  Warnings:

  - Added the required column `expiresAt` to the `AccessToken` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AccessToken" (
    "token" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AccessToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_AccessToken" ("createdAt", "token", "userId", "expiresAt") SELECT "createdAt", "token", "userId", datetime('now', '+15 minutes') FROM "AccessToken";
DROP TABLE "AccessToken";
ALTER TABLE "new_AccessToken" RENAME TO "AccessToken";
CREATE INDEX "AccessToken_userId_idx" ON "AccessToken"("userId");
CREATE INDEX "AccessToken_expiresAt_idx" ON "AccessToken"("expiresAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
