import { useEffect } from 'react';

export default function Redirect() {
  useEffect(() => {
    window.location.replace('https://schedulewhen.net');
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-black text-white gap-5">
      <div className="w-12 h-12 border-4 border-gray-600 border-t-white rounded-full animate-spin" />
      <p className="text-lg tracking-wide">Redirecting...</p>
    </div>
  );
}