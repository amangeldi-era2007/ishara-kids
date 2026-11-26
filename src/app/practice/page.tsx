'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { PracticeStudio } from '@/components/practice-studio';

function SelectedPractice() {
  const params = useSearchParams();
  const sign = params.get('sign') ?? undefined;
  return <PracticeStudio key={sign} initialSign={sign} />;
}
export default function PracticePage() {
  return (
    <Suspense
      fallback={
        <p className="container" role="status">
          Загрузка… / Жүктелуде…
        </p>
      }
    >
      <SelectedPractice />
    </Suspense>
  );
}
