export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-8">
      <h1 className="text-4xl sm:text-5xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-500 bg-clip-text text-transparent drop-shadow-lg">
        Hello to our blog
      </h1>
      <p className="text-lg text-gray-700 dark:text-gray-300 text-center max-w-xl">
        Welcome to our gaming content platform! Explore posted articles, manage your bucket, and view translations using the navigation above.
      </p>
    </div>
  );
}
