'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

function SpillBillPage() {
  const searchParams = useSearchParams();
  const [jsonData, setJsonData] = useState(null);

  useEffect(() => {
    const data = searchParams.get('data');

    if (data) {
      try {
        // Decode the Base64 string
        const decodedString = Buffer.from(data, 'base64').toString('utf-8');
        // Parse the decoded string as JSON
        const json = JSON.parse(decodedString);
        setJsonData(json);
      } catch (error) {
        console.error('Error decoding Base64 or parsing JSON:', error);
      }
    }
  }, [searchParams]);

  if (!jsonData) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
      <h1>Decoded JSON Data</h1>
      <pre style={{ background: '#f0f0f0', padding: '10px', borderRadius: '5px' }}>
        {JSON.stringify(jsonData, null, 2)}
      </pre>
    </div>
  );
}

export default function SuspenseWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SpillBillPage />
    </Suspense>
  );
}