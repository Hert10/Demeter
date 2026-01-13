'use client';
import { useEffect, useState } from 'react';
import BaseLayout from '../../../baseLayout';
import { useParams } from 'next/navigation';
import HistoryClient from './charts';

export default function History({ user }: { user: any }) {
  const params = useParams();
  const lat = params.lat as string;
  const lng = params.lng as string;
  
  return (
    <BaseLayout isAuthenticated={true} username={user.username}>
      <div className="container mx-auto px-4 py-8">
        <HistoryClient lat={lat} lng={lng} />
      </div>
    </BaseLayout>
  );
}