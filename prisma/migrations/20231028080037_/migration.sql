-- AlterEnum
ALTER TYPE "CheckType" ADD VALUE 'BLACKLIST';

-- AlterTable
ALTER TABLE "Ipaddresses" ALTER COLUMN "until" SET DEFAULT NOW() + interval '1 day';
