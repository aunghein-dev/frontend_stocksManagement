import { Toaster } from 'react-hot-toast';
import { SignupForm } from '@/app/signup/_components/SignupForm'; // We'll create this next
import Image from 'next/image';
export default function SignupPage() {
  return (
    <>
      {/* Toaster is for showing success/error pop-up notifications */}
      <Toaster position="top-center" reverseOrder={false} />
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4 text-sm sm:text-base">
        <div className="shadow-lg rounded-sm max-w-2xl w-full px-2 sm:px-6 py-6 bg-white h-full">
          <h1 className="text-xl font-extrabold text-gray-900 mb-6 text-center flex flex-row
                      items-center justify-center sm:text-2xl"> {/* Changed justify-self-center to justify-center */}
            <div className='w-10 h-10 mr-1'> {/* Removed mx-auto */}
              <Image  
                src="/onlylogo.png" alt="Openware Logo" 
                width={40} height={40} />
            </div>
            <span className='text-blue-600 mr-1'>Register</span>
            <span>your FREE account</span>
            <span className='text-blue-600 text-2xl'>&#46;</span>
          </h1>
          <SignupForm />
        </div>
      </div>
    </>
  );
}