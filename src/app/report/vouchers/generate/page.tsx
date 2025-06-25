// src/app/report/vouchers/generate/page.tsx
// This is now a Server Component by default

import { Suspense } from 'react';
import VoucherContent from './VoucherContent'; // Import the new client component

export default function GenerateVoucherPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="w-7 h-7 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="mt-4 text-gray-600 text-sm">Loading voucher page...</span>
      </div>
    }>
      <VoucherContent />
    </Suspense>
  );
}