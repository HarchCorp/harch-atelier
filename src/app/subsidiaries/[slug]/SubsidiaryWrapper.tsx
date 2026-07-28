'use client';

import { useParams } from 'next/navigation';
import SubsidiaryPageClient from './SubsidiaryPageClient';

export default function SubsidiaryPageClientWrapper() {
  const params = useParams();
  const slug = params.slug as string;
  return <SubsidiaryPageClient slug={slug} />;
}
