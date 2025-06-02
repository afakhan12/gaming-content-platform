/*
  Warnings:

  - You are about to drop the column `translatedText` on the `Article` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Article" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sourceUrl" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "originalText" TEXT NOT NULL,
    "translatedFacebook" TEXT,
    "translatedX" TEXT,
    "imageUrl" TEXT,
    "localImagePath" TEXT,
    "author" TEXT,
    "pubDate" TEXT,
    "postedToFacebook" BOOLEAN NOT NULL DEFAULT false,
    "postedToX" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Article" ("author", "createdAt", "id", "imageUrl", "localImagePath", "originalText", "postedToFacebook", "postedToX", "pubDate", "sourceUrl", "title") SELECT "author", "createdAt", "id", "imageUrl", "localImagePath", "originalText", "postedToFacebook", "postedToX", "pubDate", "sourceUrl", "title" FROM "Article";
DROP TABLE "Article";
ALTER TABLE "new_Article" RENAME TO "Article";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
