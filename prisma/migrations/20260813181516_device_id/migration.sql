-- CreateTable
CREATE TABLE "DeviceSession" (
    "id" SERIAL NOT NULL,
    "deviceId" TEXT NOT NULL,
    "token" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeviceSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DeviceSession_deviceId_key" ON "DeviceSession"("deviceId");
