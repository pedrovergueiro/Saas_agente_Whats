import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Bots() {
  const router = useRouter();

  useEffect(() => {
    // Redirecionar para o dashboard principal
    router.push('/dashboard');
  }, [router]);

  return null;
}
