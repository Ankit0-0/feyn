/*
  Warnings:

  - A unique constraint covering the columns `[provider,providerAccountId]` on the table `drive_connections` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "drive_connections_provider_providerAccountId_key" ON "drive_connections"("provider", "providerAccountId");
