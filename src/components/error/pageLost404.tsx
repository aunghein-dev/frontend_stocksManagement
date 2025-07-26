import Image from "next/image";
import React from 'react'; // Import React if not already imported implicitly

type Props = {
  header: string,
  message: string,
  reload: () => void
}

export default function PageLost404(props: Props) {
  return (
    <div className="flex flex-col lg:flex-row items-center justify-center h-full">

         <div className="min-h-[300px] max-h-[300px] flex items-center justify-center"> 
           <Image
            className="mb-10" // Apply margin bottom here, or outside if you prefer.
            src="/lost.svg"
            alt="Lost 404"
            width={280}
            height={280}
            priority
          />
        </div>

        <div className="flex flex-col items-center justify-center lg:ml-12">
           <div className="flex flex-col items-center justify-center gap-1 mb-8">
                <p className="text-lg font-semibold text-gray-400">{props.header}</p>
                <p className="text-sm text-center px-4 text-gray-400">{props.message}</p>
            </div>
            <button
              onClick={props.reload}
              className="bg-blue-600 hover:bg-blue-600 text-white border-[0.5px] border-blue-600 
                          text-sm py-2 px-4 rounded-xs transition-all
                          duration-200 cursor-pointer" >
              Retry
          </button>
        </div>
       
    </div>
  );
} 