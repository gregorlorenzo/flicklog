-- DropForeignKey
ALTER TABLE "Space" DROP CONSTRAINT "Space_owner_id_fkey";

-- AddForeignKey
ALTER TABLE "Space" ADD CONSTRAINT "Space_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "Profile"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
