import { Toaster } from 'react-hot-toast';
import { SignupForm } from '@/app/signup/_components/SignupForm';
import Image from 'next/image';
import dayjs from 'dayjs';

export default function SignupPage() {
  return (
     <div className='absolute top-0 left-0 w-full h-full flex items-center justify-center flex-col'> 
      
       <div className="flex items-center justify-center px-0 min-[640px]:px-3 md:px-4 max-w-3xl w-full
                       h-[100dvh] sm:h-[90dvh]">
        <Toaster position="top-center" reverseOrder={false} />
        <div className="w-full h-full bg-white shadow-lg rounded-0 sm:rounded-lg custom-scrollbar">
        <div className="w-full 
                        h-full flex flex-row">
            <div className='hidden sm:w-[400px] h-full rounded-l-lg border-r-[1px] border-gray-100
            sm:flex flex-col items-center justify-between py-7 bg-[#111827]'>
             
             <div className='w-full text-left pl-8 pr-2 flex flex-col gap-1'>
               <h1 className="text-2xl font-bold text-white">OPENWARE</h1>
               <p className='text-gray-400'>Join us with your business.</p>
             </div>
            

              <span className='text-[#6b7280] text-sm flex items-center justify-center'>@{dayjs().format('YYYY')} OPENWARE.</span>
            </div>
            <div className='overflow-auto custom-scrollbar px-2 sm:px-8 py-6 w-full my-3'>
            <h1 className="text-xl font-extrabold text-gray-900 mb-6 text-center flex items-center justify-center">
              <div className="w-10 h-10 mr-1">
                <Image
                  src="/onlylogo.png"
                  alt="Openware"
                  width={40}
                  height={40}
                  unoptimized
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
     </div>
  );
}


