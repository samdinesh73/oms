/*
  Warnings:

  - You are about to drop the `Order` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_orderId_fkey";

-- DropTable
DROP TABLE "Order";

-- CreateTable
CREATE TABLE "Orders" (
    "id" SERIAL NOT NULL,
    "wordpressId" INTEGER NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "customerId" INTEGER NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "paymentStatus" TEXT NOT NULL DEFAULT 'unpaid',
    "syncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Orders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Orders_wordpressId_key" ON "Orders"("wordpressId");

-- CreateIndex
CREATE UNIQUE INDEX "Orders_orderNumber_key" ON "Orders"("orderNumber");

-- CreateIndex
CREATE INDEX "Orders_wordpressId_idx" ON "Orders"("wordpressId");

-- CreateIndex
CREATE INDEX "Orders_status_idx" ON "Orders"("status");

-- CreateIndex
CREATE INDEX "Orders_customerId_idx" ON "Orders"("customerId");

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
