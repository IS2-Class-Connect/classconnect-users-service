/*
  Warnings:

  - A unique constraint covering the columns `[userId,answer]` on the table `Feedback` will be added. If there are existing duplicate values, this will fail.

*/

-- CreateIndex
CREATE UNIQUE INDEX "Feedback_userId_answer_key" ON "Feedback"("userId", "answer");
