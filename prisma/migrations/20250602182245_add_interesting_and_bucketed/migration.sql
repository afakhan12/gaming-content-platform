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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME,
    "Interesting" BOOLEAN NOT NULL DEFAULT true,
    "isBucketed" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_Article" ("author", "createdAt", "id", "imageUrl", "localImagePath", "originalText", "postedToFacebook", "postedToX", "pubDate", "sourceUrl", "title", "translatedFacebook", "translatedX") SELECT "author", "createdAt", "id", "imageUrl", "localImagePath", "originalText", "postedToFacebook", "postedToX", "pubDate", "sourceUrl", "title", "translatedFacebook", "translatedX" FROM "Article";
DROP TABLE "Article";
ALTER TABLE "new_Article" RENAME TO "Article";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
