-- AlterTable
ALTER TABLE "locations" ADD COLUMN     "description" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "map_url" TEXT,
ADD COLUMN     "phone" TEXT;
