-- CreateTable
CREATE TABLE "Article" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sourceUrl" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "originalText" TEXT NOT NULL,
    "translatedText" TEXT,
    "imageUrl" TEXT,
    "localImagePath" TEXT,
    "author" TEXT,
    "pubDate" TEXT,
    "postedToFacebook" BOOLEAN NOT NULL DEFAULT false,
    "postedToX" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
