/*
  Warnings:

  - The values [PREMIUM] on the enum `MembershipType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "MembershipType_new" AS ENUM ('FREE', 'PRO', 'ENTERPRISE');
ALTER TABLE "User" ALTER COLUMN "membershipType" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "membershipType" TYPE "MembershipType_new" USING ("membershipType"::text::"MembershipType_new");
ALTER TYPE "MembershipType" RENAME TO "MembershipType_old";
ALTER TYPE "MembershipType_new" RENAME TO "MembershipType";
DROP TYPE "MembershipType_old";
ALTER TABLE "User" ALTER COLUMN "membershipType" SET DEFAULT 'FREE';
COMMIT;
