-- CreateTable
CREATE TABLE "IPs" (
    "id" SERIAL NOT NULL,
    "ipAddressHash" TEXT NOT NULL,
    "blacklisted" BOOLEAN NOT NULL DEFAULT true,
    "until" TIMESTAMP(3) NOT NULL DEFAULT NOW() + interval '1 day',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IPs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "IPs_ipAddressHash_key" ON "IPs"("ipAddressHash");

-- CreateIndex
CREATE INDEX "IPs_ipAddressHash_idx" ON "IPs"("ipAddressHash");
