-- AlterTable
ALTER TABLE "winners" ADD COLUMN "guest_id" TEXT,
ALTER COLUMN "user_id" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "winners_event_id_guest_id_key" ON "winners"("event_id", "guest_id");

-- AddForeignKey
ALTER TABLE "winners" ADD CONSTRAINT "winners_guest_id_fkey" FOREIGN KEY ("guest_id") REFERENCES "guests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
