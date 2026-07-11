-- CreateTable
CREATE TABLE "event_messages" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "event_messages_event_id_created_at_idx" ON "event_messages"("event_id", "created_at");

-- AddForeignKey
ALTER TABLE "event_messages" ADD CONSTRAINT "event_messages_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_messages" ADD CONSTRAINT "event_messages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
