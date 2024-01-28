/*
  Warnings:

  - You are about to drop the `IPs` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "IPs";

-- CreateTable
CREATE TABLE "IpAddresses" (
    "id" SERIAL NOT NULL,
    "ipAddressHash" TEXT NOT NULL,
    "blacklisted" BOOLEAN NOT NULL DEFAULT true,
    "until" TIMESTAMP(3) NOT NULL DEFAULT NOW() + interval '1 day',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IpAddresses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "IpAddresses_ipAddressHash_key" ON "IpAddresses"("ipAddressHash");

-- CreateIndex
CREATE INDEX "IpAddresses_ipAddressHash_idx" ON "IpAddresses"("ipAddressHash");
