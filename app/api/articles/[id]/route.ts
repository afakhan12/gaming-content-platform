import { NextRequest, NextResponse } from "next/server";
import db from "@/db/db";

// GET handler for fetching a single article by ID.
// The first argument is the NextRequest object.
// The second argument is an object containing 'params',
// which holds the dynamic route segments like 'id'.
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } } // Inline type for dynamic params
) {
  // Convert the 'id' parameter from string (as it comes from the URL) to a number.
  const id = Number(params.id);

  try {
    // Attempt to find a unique article in the database using the provided ID.
    const article = await db.article.findUnique({
      where: { id },
    });

    // If no article is found, return a 404 Not Found response.
    if (!article) {
      return new NextResponse("Not Found", { status: 404 });
    }

    // Parse the 'originalText' field if it exists (assuming it's stored as a JSON string).
    // Provide default empty strings for 'translatedX' and 'translatedFacebook' if null/undefined.
    const parsed = {
      ...article,
      originalText: article.originalText ? JSON.parse(article.originalText) : [],
      translatedX: article.translatedX || "",
      translatedFacebook: article.translatedFacebook || "",
    };

    // Return the fetched and parsed article as a JSON response.
    return NextResponse.json(parsed);
  } catch (err) {
    // Log any errors that occur during the fetch operation.
    console.error("❌ Failed to fetch article:", err);
    // Return a 500 Server Error response in case of an exception.
    return new NextResponse("Server Error", { status: 500 });
  }
}

// PUT handler for updating an article by ID.
// The first argument is the NextRequest object.
// The second argument is an object containing 'params',
// which holds the dynamic route segments like 'id'.
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } } // Inline type for dynamic params
) {
  // Convert the 'id' parameter from string to a number.
  const id = Number(params.id);
  // Parse the request body as JSON.
  const body = await req.json();

  try {
    // Attempt to update the article in the database.
    // The 'where' clause specifies which article to update by its ID.
    // The 'data' object contains the fields to be updated.
    const updated = await db.article.update({
      where: { id },
      data: {
        isBucketed: body.isBucketed,
        Interesting: body.Interesting,
        updatedAt: new Date(), // Update the timestamp to the current date/time
      },
    });

    // Return the updated article as a JSON response.
    return NextResponse.json(updated);
  } catch (err) {
    // Log any errors that occur during the update operation.
    console.error("❌ Failed to update article:", err);
    // Return a 500 Server Error response in case of an exception.
    return new NextResponse("Server Error", { status: 500 });
  }
}
