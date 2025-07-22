// src/app/report/vouchers/generate/page.tsx
// This is now a Server Component by default

import { Suspense } from 'react';
import VoucherContent from './VoucherContent'; // Import the new client component

export default function GenerateVoucherPage() {
  return (
    <Suspense fallback={
      <></>
    }>
      <VoucherContent />
    </Suspense>
  );
}