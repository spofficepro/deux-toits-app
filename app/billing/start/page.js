'use client';
import { useEffect, useState } from 'react';

export default function BillingStart() {
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/stripe/checkout', { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        if (data.url) window.location.href = data.url;
        else setError(data.error || 'Une erreur est survenue.');
      })
      .catch(() => setError('Impossible de contacter le serveur de paiement.'));
  }, []);

  return (
    <main className="max-w-[420px] mx-auto px-6 py-16 text-center">
      <p className="text-sm text-inksoft">
        {error || 'Redirection vers le paiement sécurisé…'}
      </p>
    </main>
  );
}
