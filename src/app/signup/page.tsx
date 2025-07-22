import { Toaster } from 'react-hot-toast';
import { SignupForm } from '@/app/signup/_components/SignupForm';
import Image from 'next/image';

export default function SignupPage() {
  return (
     <div className='absolute top-0 left-0 w-full h-full flex items-center justify-center flex-col'> 
      
       <div className="flex items-center justify-center px-4 md:px-1 max-w-3xl w-full"
            style={{ height: '95svh'}}>
        <Toaster position="top-center" reverseOrder={false} />
        <div className="w-full h-full bg-white p-1 shadow-lg rounded-xl custom-scrollbar">
        <div className="w-full px-2 sm:px-6 py-6  
                        overflow-auto custom-scrollbar h-full">
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
              <span> FREE account</span>
              <span className="text-blue-600 text-2xl">&#46;</span>
            </h1>
            <SignupForm />
          </div>
          </div>
          </div>
     </div>
  );
}


