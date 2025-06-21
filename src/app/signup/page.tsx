import { Toaster } from 'react-hot-toast';
import { SignupForm } from '@/app/signup/_components/SignupForm'; // We'll create this next

export default function SignupPage() {
  return (
    <>
      {/* Toaster is for showing success/error pop-up notifications */}
      <Toaster position="top-center" reverseOrder={false} />
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="shadow-lg rounded-sm max-w-2xl w-full p-8 bg-white h-full">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">
            Create Your Account
          </h1>
          <SignupForm />
        </div>
      </div>
    </>
  );
}