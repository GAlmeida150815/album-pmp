import { Loader2 } from "lucide-react";

export default function PageLoader() {
  return (
    <div className='min-h-screen w-full flex flex-col items-center justify-center bg-black z-50'>
      <Loader2 className='animate-spin text-purple-500 mb-4' size={48} />
      <p className='text-gray-500 text-sm animate-pulse font-mono tracking-widest uppercase'>
        A carregar...
      </p>
    </div>
  );
}
