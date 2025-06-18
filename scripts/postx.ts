/**
 * Standalone Node.js script to call the Next.js /api/test-twitter endpoint.
 *
 * This script does not require a browser or any HTML. It makes a direct
 * HTTP POST request to your server-side API route and logs the response
 * to the console.
 *
 * To run this script:
 * 1. Ensure your Next.js application is running and the /api/test-twitter
 * endpoint is accessible (e.g., at http://localhost:3000/api/test-twitter).
 * 2. Save this code as a .js file (e.g., `testTwitterApi.js`).
 * 3. Open your terminal or command prompt.
 * 4. Navigate to the directory where you saved the file.
 * 5. Run the script using Node.js: `node testTwitterApi.js`
 */

async function runTwitterApiTest() {
    // IMPORTANT: Replace this with the actual base URL of your Next.js app.
    // For local development, it's usually 'http://localhost:3000'
    const API_BASE_URL = 'http://localhost:3000';
    const API_ENDPOINT = `${API_BASE_URL}/api/test/x`;

    console.log(`--- Attempting to call Twitter API test endpoint ---`);
    console.log(`Target URL: ${API_ENDPOINT}`);

    try {
        // Make a POST request to the specified API endpoint
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Parse the JSON response from your Next.js API route
        const data = await response.json();

        // Check if the HTTP response status is OK (2xx range)
        if (response.ok) {
            console.log('✅ SUCCESS: Twitter API test passed!');
            console.log('Response data:', data);
            console.log(`Test tweet ID: ${data.tweetId}`);
        } else {
            // Log server-side errors returned by your API route
            const errorMessage = data.details || data.error || 'An unknown error occurred on the server.';
            console.error('❌ ERROR: Twitter API test failed!');
            console.error('Status:', response.status);
            console.error('Details:', errorMessage);
            console.error('Full response data:', data);
        }

    } catch (error) {
        // Log network errors or issues with the fetch request itself
        console.error('❌ NETWORK ERROR: Could not reach the API endpoint.');
        console.error('Please ensure your Next.js application is running and accessible at:', API_BASE_URL);
        if (error instanceof Error) {
            console.error('Error details:', error.message);
        } else {
            console.error('Error details:', error);
        }
    } finally {
        console.log(`--- Twitter API test attempt complete ---`);
    }
}

// Execute the test function when the script is run
runTwitterApiTest();
