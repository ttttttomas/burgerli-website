"use client";
import { Inter, Pattaya } from "next/font/google";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/app/context/SessionContext";

const pattaya = Pattaya({
  weight: ["400"],
  variable: "--font-pattaya",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export default function LoginPage() {
  const router = useRouter();
  const { loginUser, loading } = useSession();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError("Por favor completa todos los campos");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    
    try {
      const result = await loginUser(email, password);
      
      if (result && result.id) {
        
        // Redirigir a la página principal
        router.push('/');
        
        // Forzar recarga para asegurar que todo el estado se actualice
        setTimeout(() => {
          window.location.href = '/';
        }, 100);
      }
    } catch (err: any) {
      setError(err.message || "Credenciales inválidas. Por favor intenta nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Si está verificando la sesión, mostrar loading
  if (loading) {
    return (
      <main
        className={`w-full bg-[#fdecc9] flex items-center justify-center min-h-screen ${inter.className}`}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#b36912] mx-auto"></div>
          <p className="mt-4 text-[#4b2f1e] font-medium">Verificando sesión...</p>
        </div>
      </main>
    );
  }

  return (
    <main
      className={`w-full bg-[#fdecc9] flex items-center my-30 justify-center p-6" ${inter.className}`}
    >
      <div className="w-full relative max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-3xl overflow-hidden shadow-2xl">
        {/* Left: image + copy */}
        <div className="relative hidden lg:block">
          <img
            src="/login.png"
            alt="Burger background"
            className="w-full h-[600px] object-cover blur-[5px]"
          />
          <div className="absolute inset-0 bg-[#262626] opacity-80" />
          <div className="absolute inset-0 flex flex-col justify-center px-10 text-white">
            <h2
              className={`text-4xl font-extrabold leading-tight ${pattaya.className}`}
            >
              Volvé a disfrutar de tus
              <br />
              <span className={pattaya.className}>hamburguesas favoritas</span>
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-relaxed opacity-90">
              Iniciá sesión y descubrí promos especiales, tus hamburguesas
              favoritas y novedades deliciosas. ¡Tu próxima comida está a un
              clic!
            </p>
          </div>
        </div>

        {/* Right: form panel */}
        <form
          onSubmit={handleSubmit}
          className={`bg-[#4b2f1e] flex flex-col justify-between h-full z-0 text-white px-8 sm:px-10 py-10`}
        >
          {/* Logo circle */}
          <div className="absolute -top-2 right-5 md:right-54 z-20 flex items-center justify-center">
            <img src="/logo.png" alt="Burgerli Logo" className="w-36 z-20" />
          </div>

          <div className="pt-16 max-w-md mx-auto w-full">
            {/* Email */}
            <label className="block text-sm font-semibold mb-2">
              Correo electrónico
            </label>
            <div className="flex items-center gap-2 bg-transparent border-b border-white/50 focus-within:border-white transition">
              <Mail className="w-4 h-4 opacity-80" />
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="text"
                autoComplete="username"
                placeholder="Ingrese su correo electrónico"
                className="w-full bg-transparent outline-none py-3 placeholder:text-white/70"
              />
            </div>

            {/* Password */}
            <label className="block text-sm font-semibold mt-6 mb-2">
              Contraseña
            </label>
            <div className="flex items-center gap-2 bg-transparent border-b border-white/50 focus-within:border-white transition">
              <Lock className="w-4 h-4 opacity-80" />
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={showPass ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Ingrese su contraseña"
                className="w-full bg-transparent outline-none py-3 placeholder:text-white/70"
              />
              <button
                type="button"
                onClick={() => setShowPass((s) => !s)}
                className="p-1 -mr-1 opacity-80 hover:opacity-100"
                aria-label={
                  showPass ? "Ocultar contraseña" : "Mostrar contraseña"
                }
              >
                {showPass ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            
            {/* Error message */}
            {error && (
              <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-sm text-red-200">{error}</p>
              </div>
            )}
            
            {/* <button type="button" className="mt-3 text-sm underline underline-offset-2 opacity-90 hover:opacity-100">
              ¿Olvidaste tu contraseña?
            </button> */}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting || !email || !password}
              className="mt-6 w-full rounded-xl py-3 font-semibold bg-[#b36912] text-black hover:bg-[#a35f0f] active:scale-[.99] transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#b36912]"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                  <span>Iniciando sesión...</span>
                </div>
              ) : (
                "Ingresar"
              )}
            </button>

            {/* Register */}
            <p className="mt-10 text-center text-sm">
              ¿Todavía no tenes cuenta?{" "}
              <Link
                href="/register"
                className="text-[#ffd21f] hover:underline font-semibold"
              >
                Registrate
              </Link>
            </p>
          </div>
        </form>
      </div>
    </main>
  );
}
