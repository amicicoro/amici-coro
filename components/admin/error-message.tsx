import { AlertCircle } from 'lucide-react';

interface ErrorMessageProps {
  message: string | null;
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  if (!message) return null;

  return (
    <div className='bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-6'>
      <div className='flex items-center'>
        <AlertCircle className='h-5 w-5 mr-2' />
        {message}
      </div>
    </div>
  );
}
