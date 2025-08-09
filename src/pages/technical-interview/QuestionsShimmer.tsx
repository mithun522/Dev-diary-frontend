export default function QuestionsShimmer() {
  return (
    <div className="h-fit max-h-[100vh] space-y-3 animate-pulse">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="pb-3 last:border-none">
          <div className="flex justify-between items-start gap-2">
            {/* Left section: question & answer */}
            <div className="flex flex-col flex-1">
              {/* Question title shimmer */}
              <div className="h-8 w-[70%] bg-gray-300 rounded mb-2"></div>

              {/* Answer shimmer (multiple lines) */}
              <div className="space-y-1">
                <div className="h-6 w-[90%] bg-gray-300 rounded"></div>
                <div className="h-6 w-[85%] bg-gray-300 rounded"></div>
                <div className="h-6 w-[60%] bg-gray-300 rounded"></div>
              </div>
            </div>

            {/* Right section: buttons */}
            <div className="flex flex-shrink-0 space-x-2">
              <div className="h-6 w-6 bg-gray-300 rounded"></div>
              <div className="h-6 w-6 bg-gray-300 rounded"></div>
              <div className="h-6 w-6 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
