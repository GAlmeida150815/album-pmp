"use client";
import { useState, FormEvent } from "react";
import { useUser } from "@/context/UserContext";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const { loginAsGuest, user } = useUser();
  const [input, setInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (user) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-black'>
        <div className='glass p-8 rounded-xl text-center'>
          <h2 className='text-xl font-bold mb-4'>
            Iniciaste sessão como {user.username}
          </h2>
          <Link
            href='/'
            className='bg-white text-black px-6 py-2 rounded-full font-bold'
          >
            Ir para o Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setIsSubmitting(true);
    await loginAsGuest(input);
  };

  return (
    <div className='min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden'>
      <div className='absolute top-10 left-10 w-64 h-64 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob'></div>
      <div className='absolute bottom-10 right-10 w-64 h-64 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000'></div>

      <div className='glass w-full max-w-md p-8 rounded-2xl border border-white/10 relative z-10 shadow-2xl'>
        <div className='text-center mb-8'>
          <h1 className='text-4xl font-black bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent mb-2'>
            Album PMP
          </h1>
          <p className='text-gray-400'>
            Avalia o gosto dos teus amigos (sem julgamentos)
          </p>
        </div>

        <form onSubmit={handleLogin} className='space-y-6'>
          <div>
            <label className='block text-sm font-medium text-gray-400 mb-2'>
              Escolhe um Nome de Utilizador
            </label>
            <input
              type='text'
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder='e.g. DJ Khaled'
              className='w-full bg-black/40 border border-white/10 rounded-lg p-4 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all'
              autoFocus
            />
          </div>

          <button
            type='submit'
            disabled={isSubmitting || !input}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-200 
              ${
                isSubmitting || !input
                  ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg hover:shadow-purple-500/25 transform hover:-translate-y-0.5"
              } flex items-center justify-center gap-2`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className='animate-spin' /> A entrar...
              </>
            ) : (
              "Entrar no Clube"
            )}
          </button>
        </form>

        <p className='text-xs text-center text-gray-600 mt-6'>
          *Login Anónimo: Se limpares os cookies do navegador, perderás a tua
          conta.
        </p>
      </div>
    </div>
  );
}
