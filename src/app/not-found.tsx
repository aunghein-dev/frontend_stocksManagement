"use client";
import Image from "next/image";
import { useState, useEffect } from "react"; // Import useState and useEffect
import Link from "next/link"; // For the "Back to homepage" button

export default function NotFound() {
  const [isImageVisible, setIsImageVisible] = useState(false);
  const [isContentVisible, setIsContentVisible] = useState(false);

  useEffect(() => {
    // When the component mounts, set the state to true to trigger animations.
    // A small timeout can create a nice staggered effect or ensure
    // the initial render is complete before the transition starts.
    const imageTimer = setTimeout(() => {
      setIsImageVisible(true);
    }, 100); // Image starts animating after 100ms

    const contentTimer = setTimeout(() => {
      setIsContentVisible(true);
    }, 400); // Text content starts animating after 400ms (after image)

    // Cleanup timers if the component unmounts before they fire
    return () => {
      clearTimeout(imageTimer);
      clearTimeout(contentTimer);
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    <section>
      <div className="min-h-[calc(100dvh-110px)] bg-white w-full rounded-lg flex flex-col items-center justify-center">
        
          {/* Main content container - added flex-col to stack items properly */}
          <div className="transition duration-200 ease-in-out p-1 flex flex-col items-center">
             
             {/* Image Container with animation classes */}
             <div className={`h-[220px] w-full max-w-[400px] relative overflow-hidden
                           transition-all duration-700 ease-out
                           ${isImageVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'}`}> 
                <Image
                  src="/404.svg"
                  alt="Empty 404 Image"
                  aria-label="Invalid URL"
                  fill // Use 'fill' to make the image cover its parent 'div'
                  className="object-contain" // This ensures the image maintains aspect ratio within the fill area     
                  unoptimized
                />
             </div>
              
              {/* Text Content Container with animation classes */}
              <div className={`flex flex-col items-center gap-1 px-4 md:px-2 mt-4
                              transition-all duration-700 ease-out delay-200
                              ${isContentVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                  <h1 className="text-2xl font-bold md:text-3xl">Oh no. We lost this page</h1>
                  <span className="text-gray-600 text-sm md:text-md
                                  ">We searched everywhere but couldn’t find what you’re looking for.</span>
                  <span className="text-gray-600 text-sm md:text-md">Let’s find a better place for you to go.</span>
                  
                  {/* Added Tailwind classes for button styling */}
                  <Link href="/">
                      <button className="mt-4 px-6 py-3
                                        bg-blue-600 text-white rounded-sm
                                        hover:bg-blue-700 transition-colors duration-200
                                        text-sm md:text-md cursor-pointer">
                        Back to homepage
                      </button>
                  </Link>
              </div>
          </div>
      </div>
    </section>
  );
}
