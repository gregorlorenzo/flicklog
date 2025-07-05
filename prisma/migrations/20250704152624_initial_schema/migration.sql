-- CreateEnum
CREATE TYPE "SpaceType" AS ENUM ('PERSONAL', 'SHARED');

-- CreateEnum
CREATE TYPE "SpaceMemberRole" AS ENUM ('ADMIN', 'MEMBER');

-- CreateEnum
CREATE TYPE "CommentType" AS ENUM ('QUICK_TAKE', 'DEEPER_THOUGHTS');

-- CreateTable
CREATE TABLE "Profile" (
    "user_id" UUID NOT NULL,
    "username" TEXT NOT NULL,
    "display_name" TEXT,
    "avatar_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "Space" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "type" "SpaceType" NOT NULL DEFAULT 'PERSONAL',
    "owner_id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Space_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpaceMember" (
    "user_id" UUID NOT NULL,
    "space_id" UUID NOT NULL,
    "role" "SpaceMemberRole" NOT NULL DEFAULT 'MEMBER',

    CONSTRAINT "SpaceMember_pkey" PRIMARY KEY ("user_id","space_id")
);

-- CreateTable
CREATE TABLE "LogEntry" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "space_id" UUID NOT NULL,
    "tmdb_id" TEXT NOT NULL,
    "tmdb_type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LogEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rating" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "log_entry_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "watched_on" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Rating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "rating_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "type" "CommentType" NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PendingRating" (
    "log_entry_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,

    CONSTRAINT "PendingRating_pkey" PRIMARY KEY ("log_entry_id","user_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Profile_username_key" ON "Profile"("username");

-- CreateIndex
CREATE INDEX "Space_owner_id_idx" ON "Space"("owner_id");

-- CreateIndex
CREATE UNIQUE INDEX "LogEntry_space_id_tmdb_id_tmdb_type_key" ON "LogEntry"("space_id", "tmdb_id", "tmdb_type");

-- AddForeignKey
ALTER TABLE "Space" ADD CONSTRAINT "Space_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "Profile"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpaceMember" ADD CONSTRAINT "SpaceMember_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Profile"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpaceMember" ADD CONSTRAINT "SpaceMember_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "Space"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogEntry" ADD CONSTRAINT "LogEntry_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "Space"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_log_entry_id_fkey" FOREIGN KEY ("log_entry_id") REFERENCES "LogEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Profile"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_rating_id_fkey" FOREIGN KEY ("rating_id") REFERENCES "Rating"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Profile"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PendingRating" ADD CONSTRAINT "PendingRating_log_entry_id_fkey" FOREIGN KEY ("log_entry_id") REFERENCES "LogEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PendingRating" ADD CONSTRAINT "PendingRating_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Profile"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
