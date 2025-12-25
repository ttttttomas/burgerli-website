"use client";
import { Inter, Pattaya } from "next/font/google";
import { Eye, EyeOff, Mail, Lock, User, Phone, Home, MapPin } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useSession } from "@/app/context/SessionContext";
import { useRouter } from "next/navigation";

const pattaya = Pattaya({
  weight: ["400"],
  variable: "--font-pattaya",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

type RegisterData = {
  id_user_client: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  address: string[];
  locality: string;
  notes: string;
};

export default function RegisterPage() {
  const router = useRouter();
  const { registerUser, loading } = useSession();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<RegisterData>({
    id_user_client: "",
    name: "",
    email: "",
    password: "",
    phone: "",
    address: [],
    locality: "Lanús",
    notes: "",
  });

  // Validaciones
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    // Acepta formatos: 1123456789, 11-2345-6789, (11) 2345-6789, +54 11 2345 6789
    const phoneRegex = /^(\+?54)?[\s-]?(\(?\d{2,4}\)?)?[\s-]?\d{4}[\s-]?\d{4}$/;
    return phoneRegex.test(phone.trim());
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 6;
  };

  const validateForm = (): string | null => {
    if (!data.name.trim()) {
      return "Por favor ingresa tu nombre completo";
    }
    if (data.name.trim().length < 3) {
      return "El nombre debe tener al menos 3 caracteres";
    }
    if (!data.email.trim()) {
      return "Por favor ingresa tu correo electrónico";
    }
    if (!validateEmail(data.email)) {
      return "Por favor ingresa un correo electrónico válido";
    }
    if (!data.password) {
      return "Por favor ingresa una contraseña";
    }
    if (!validatePassword(data.password)) {
      return "La contraseña debe tener al menos 6 caracteres";
    }
    if (!data.phone.trim()) {
      return "Por favor ingresa tu teléfono";
    }
    if (!validatePhone(data.phone)) {
      return "Por favor ingresa un teléfono válido (ej: 11-2345-6789)";
    }
    if (!data.addresses[0] || !data.addresses[0].trim()) {
      return "Por favor ingresa tu dirección";
    }
    if (data.addresses[0].trim().length < 5) {
      return "La dirección debe tener al menos 5 caracteres";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validar formulario
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Limpiar addresses (eliminar vacíos)
      const cleanedAddresses = data.address.filter(addr => addr.trim() !== "");
      
      const registerData = {
        ...data,
        address: cleanedAddresses,
        notes: data.notes || "", // Asegurar que notes no sea undefined
      };
      console.log(registerData);
      
      // Registrar usuario
      await registerUser(registerData);
      
      
      // Redirigir a la página principal
      router.push('/login');
    
    } catch (err: unknown) {
      console.error("Error en registro:", err);
      
      const error = err as Error;
      
      // El backend devuelve mensajes específicos en error.message
      // Ejemplos: "Email already registered", "Error al crear usuario. Vuelva a intentarlo más tarde."
      
      if (error.message?.toLowerCase().includes("email already registered") || 
          error.message?.toLowerCase().includes("email ya registrado")) {
        setError("Este correo electrónico ya está registrado. Por favor usa otro o inicia sesión.");
      } else if (error.message?.toLowerCase().includes("error al crear usuario")) {
        setError("Error al crear el usuario. Por favor intenta nuevamente más tarde.");
      } else if (error.message?.includes("500")) {
        setError("Error del servidor. Intenta nuevamente más tarde.");
      } else {
        // Mostrar el mensaje exacto del backend si existe
        setError(error.message || "Error al registrar. Por favor intenta nuevamente.");
      }
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
  };

  const isFormValid = 
    data.name.trim() && 
    data.email.trim() && 
    data.password && 
    data.phone.trim() && 
    data.address[0]?.trim();

  return (
    <main
      className={`w-full bg-[#fdecc9] flex items-center my-30 justify-center p-6 ${inter.className}`}
    >
      <div className="w-full relative max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-3xl overflow-hidden shadow-2xl">
        {/* Left: image + copy */}
        <div className="relative hidden lg:block">
          <img
            src="/login.png"
            alt="Burger background"
            className="w-full h-full object-cover blur-[5px]"
          />
          <div className="absolute inset-0 bg-[#262626] opacity-80" />
          <div className="absolute inset-0 flex flex-col justify-center px-6 text-white">
            <h2
              className={`text-3xl font-extrabold leading-tight ${pattaya.className}`}
            >
              ¡Empezá a disfrutar de las mejores hamburguesas! 
              <br />
              <span className={pattaya.className}>Burgerli</span>
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-relaxed opacity-90">
              Creá tu cuenta y disfrutá de promos exclusivas, seguimiento de
              pedidos en tiempo real y las mejores hamburguesas de la zona.
              ¡Tu primera orden te está esperando!
            </p>
          </div>
        </div>

        {/* Right: form panel */}
        <form
          onSubmit={handleSubmit}
          className={`bg-[#4b2f1e] flex flex-col justify-between h-full z-0 text-white px-8 sm:px-10 py-10 overflow-y-auto`}
        >
          {/* Logo circle */}
          <div className="absolute -top-2 right-5 md:right-54 z-20 flex items-center justify-center">
            <img src="/logo.png" alt="Burgerli Logo" className="w-36 z-20" />
          </div>

          <div className="pt-16 max-w-md mx-auto w-full">
            <h3 className="text-2xl font-bold mb-6">Crear cuenta</h3>

            {/* Nombre */}
            <label className="block text-sm font-semibold mb-2">
              Nombre completo
            </label>
            <div className="flex items-center gap-2 bg-transparent border-b border-white/50 focus-within:border-white transition">
              <User className="w-4 h-4 opacity-80" />
              <input
                value={data.name}
                onChange={(e) => setData({ ...data, name: e.target.value })}
                type="text"
                placeholder="Ingresa tu nombre completo"
                className="w-full bg-transparent outline-none py-3 placeholder:text-white/70"
              />
            </div>

            {/* Email */}
            <label className="block text-sm font-semibold mt-4 mb-2">
              Correo electrónico
            </label>
            <div className="flex items-center gap-2 bg-transparent border-b border-white/50 focus-within:border-white transition">
              <Mail className="w-4 h-4 opacity-80" />
              <input
                value={data.email}
                onChange={(e) => setData({ ...data, email: e.target.value })}
                type="email"
                placeholder="tu@email.com"
                className="w-full bg-transparent outline-none py-3 placeholder:text-white/70"
              />
            </div>

            {/* Password */}
            <label className="block text-sm font-semibold mt-4 mb-2">
              Contraseña
            </label>
            <div className="flex items-center gap-2 bg-transparent border-b border-white/50 focus-within:border-white transition">
              <Lock className="w-4 h-4 opacity-80" />
              <input
                value={data.password}
                onChange={(e) => setData({ ...data, password: e.target.value })}
                type={showPass ? "text" : "password"}
                placeholder="Mínimo 6 caracteres"
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
            {data.password && !validatePassword(data.password) && (
              <p className="text-xs text-yellow-300 mt-1">
                La contraseña debe tener al menos 6 caracteres
              </p>
            )}

            {/* Teléfono */}
            <label className="block text-sm font-semibold mt-4 mb-2">
              Teléfono
            </label>
            <div className="flex items-center gap-2 bg-transparent border-b border-white/50 focus-within:border-white transition">
              <Phone className="w-4 h-4 opacity-80" />
              <input
                value={data.phone}
                onChange={(e) => setData({ ...data, phone: e.target.value })}
                type="tel"
                placeholder="11-2345-6789"
                className="w-full bg-transparent outline-none py-3 placeholder:text-white/70"
              />
            </div>
            {data.phone && !validatePhone(data.phone) && (
              <p className="text-xs text-yellow-300 mt-1">
                Formato: 11-2345-6789 o similar
              </p>
            )}

            {/* Dirección */}
            <label className="block text-sm font-semibold mt-4 mb-2">
              Dirección de entrega
            </label>
            <div className="flex items-center gap-2 bg-transparent border-b border-white/50 focus-within:border-white transition">
              <Home className="w-4 h-4 opacity-80" />
              <input
                value={data.address[0] || ""}
                onChange={(e) => setData({ ...data, address: [e.target.value] })}
                type="text"
                placeholder="Calle, número, piso, depto"
                className="w-full bg-transparent outline-none py-3 placeholder:text-white/70"
              />
            </div>

            {/* Localidad */}
            <label className="block text-sm font-semibold mt-4 mb-2">
              Localidad
            </label>
            <div className="flex items-center gap-2 bg-transparent border-b border-white/50 focus-within:border-white transition">
              <MapPin className="w-4 h-4 opacity-80" />
              <select
                value={data.locality}
                onChange={(e) => setData({ ...data, locality: e.target.value })}
                className="w-full bg-transparent outline-none py-3 text-white"
              >
                <option className="text-black" value="Lanús">Lanús</option>
                <option className="text-black" value="Gerli">Gerli</option>
                <option className="text-black" value="Avellaneda">Avellaneda</option>
              </select>
            </div>

            {/* Notas (opcional) */}
            <label className="block text-sm font-semibold mt-4 mb-2">
              Notas adicionales <span className="text-white/50">(opcional)</span>
            </label>
            <div className="flex items-center gap-2 bg-transparent border-b border-white/50 focus-within:border-white transition">
              <input
                value={data.notes}
                onChange={(e) => setData({ ...data, notes: e.target.value })}
                type="text"
                placeholder="Ej: Timbre roto, tocar puerta"
                className="w-full bg-transparent outline-none py-3 placeholder:text-white/70"
              />
            </div>

            {/* Error message */}
            {error && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-sm text-red-200">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting || !isFormValid}
              className="mt-6 w-full rounded-xl py-3 font-semibold bg-[#b36912] text-black hover:bg-[#a35f0f] active:scale-[.99] transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#b36912]"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                  <span>Creando cuenta...</span>
                </div>
              ) : (
                "Crear cuenta"
              )}
            </button>

            {/* Login */}
            <div className="flex mt-8 gap-2 items-center justify-center">
              <p className="text-center text-sm">¿Ya tienes cuenta?</p>
              <Link
                href="/login"
                className="text-[#ffd21f] hover:underline font-semibold"
              >
                Inicia sesión
              </Link>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
