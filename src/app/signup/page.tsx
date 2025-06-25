import { Toaster } from 'react-hot-toast';
import { SignupForm } from '@/app/signup/_components/SignupForm';
import Image from 'next/image';

export default function SignupPage() {
  return (
     <div className='absolute top-0 left-0 w-full h-full flex items-center justify-center flex-col min-h-[100dvh]'> 
      
       <div className="flex items-center justify-center p-1 shadow-lg rounded-sm max-w-2xl w-full bg-white min-h-[100dvh]">
        <Toaster position="top-center" reverseOrder={false} />
        <div className="w-full px-2 sm:px-6 py-6  
                         overflow-auto custom-scrollbar sm:h-[calc(100dvh-50px)] h-full">
            <h1 className="text-xl font-extrabold text-gray-900 mb-6 text-center flex items-center justify-center">
              <div className="w-10 h-10 mr-1">
                <Image
                  src="/onlylogo.png"
                  alt="Openware"
                  width={40}
                  height={40}
                />
              </div>
              <span className="text-blue-600 mr-1">Register</span>
              <span>your FREE account</span>
              <span className="text-blue-600 text-2xl">&#46;</span>
            </h1>
            <SignupForm />
          </div>
          </div>
     </div>
  );
}


