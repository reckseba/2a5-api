/*
  Warnings:

  - You are about to drop the `IpAddresses` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "IpAddresses";

-- CreateTable
CREATE TABLE "Ipaddresses" (
    "id" SERIAL NOT NULL,
    "ipAddressHash" TEXT NOT NULL,
    "blacklisted" BOOLEAN NOT NULL DEFAULT true,
    "until" TIMESTAMP(3) NOT NULL DEFAULT NOW() + interval '1 day',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Ipaddresses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Ipaddresses_ipAddressHash_key" ON "Ipaddresses"("ipAddressHash");

-- CreateIndex
CREATE INDEX "Ipaddresses_ipAddressHash_idx" ON "Ipaddresses"("ipAddressHash");
