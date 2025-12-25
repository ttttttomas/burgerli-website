"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import { SessionUser } from "@/types";
import useAuth from "@/app/hooks/useAuth";

type LoginResult = { id: string };

type RegisterData = {
  name: string;
  email: string;
  password: string;
  phone: string;
  address: string[];
  locality: string;
  notes: string;
};

type Ctx = {
  loginUser: (username: string, password: string) => Promise<LoginResult>;
  registerUser: (data: RegisterData) => Promise<void>;
  session: SessionUser | null;
  loading: boolean;
  userById: (id: string) => Promise<void>;
  logoutUser: () => Promise<void>;
  OrderById: (id: string) => Promise<void>;
};

export const SessionContext = createContext<Ctx | null>(null);

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx)
    throw new Error("useSession debe usarse dentro de <SessionProvider>");
  return ctx;
}

export const SessionContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { login, register, getUserById, verifyCookie, logout, getOrderById } =
    useAuth();
  const [session, setSession] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true); // Iniciar en true para mostrar loading inicial

  const loginUser = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await login({ email, password });
      
      if (!res || !res.data) {
        throw new Error("Error en la respuesta del servidor");
      }

      const api = res.data;
      console.log("🔐 Login exitoso:", api);
      
      // Extraer datos con fallbacks seguros
      const name = api.name || api.username || "Usuario";
      const id = api.user_id || api.ID || api.user_id_user_client;
      const emailUser = api.email || email;
      const phone = api.phone || "";
      
      if (!id) {
        throw new Error("Error al iniciar sesión, intente de nuevo.");
      }

      const newSession: SessionUser = {
        user_id_user_client: String(id),
        username: String(name),
        email: String(emailUser),
        phone: String(phone),
      };

      // Actualizar la sesión inmediatamente
      setSession(newSession);
      console.log("✅ Sesión creada exitosamente:", newSession);

      // Esperar un momento para asegurar que el estado se propague
      await new Promise((resolve) => setTimeout(resolve, 150));

      return { id: String(id) };
    } catch (error: any) {
      console.error("❌ Error en loginUser:", error);
      setSession(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const registerUser = async (data: RegisterData) => {
    setLoading(true);

    try {
      const res = await register(data);
      console.log("📝 Registro exitoso:", res);

      if (!res) {
        throw new Error("Error en el registro");
      }

       toast.success("¡Registro exitoso! Bienvenido a Burgerli. Ingresa a tu cuenta.");

      // Esperar un momento para asegurar que el estado se propague
      await new Promise((resolve) => setTimeout(resolve, 150));

      return res;
    } catch (error: any) {
      console.error("❌ Error al registrar usuario:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Verificar si hay un usuario iniciado
  const checkAuthentication = async () => {
    try {
      const response = await verifyCookie();

      if (response && response.status === 200 && response.data) {
        const userData = response.data;

        // Extraer datos con fallbacks seguros
        const name = userData.username || userData.name || "Usuario";
        const id = userData.user_id || userData.id || userData.user_id_user_client;
        const email = userData.email || "";
        const phone = userData.phone || "";

        if (!id) {
          console.warn("⚠️ No se encontró user_id en la verificación de cookie");
          setSession(null);
          return;
        }

        const newSession: SessionUser = {
          user_id_user_client: String(id),
          username: String(name),
          email: String(email),
          phone: String(phone),
        };
        
        setSession(newSession);
        console.log("✅ Sesión verificada:", newSession);
      } else {
        // Si no hay cookie válida, limpiar la sesión
        setSession(null);
        console.log("ℹ️ No hay sesión activa");
      }
    } catch (error) {
      console.error("❌ Error verificando cookie:", error);
      setSession(null);
    }
  };

  const userById = async (id: string) => {
    try {
      const response = await getUserById(id);
      if (response?.status === 200) {
        return response.data;
      }
      return null;
    } catch (error) {
      console.error("Error during search user:", error);
      toast.error("Error inesperado. Intenta nuevamente.");
      return null;
    }
  };

  const logoutUser = async () => {
    setLoading(true);
    try {
      // 1. Llamar al endpoint del backend para borrar la cookie del servidor
      await logout();
      
      // 2. Llamar al endpoint de Next.js para borrar cookies del lado del cliente
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          credentials: 'include',
        });
      } catch (e) {
        console.warn("⚠️ No se pudo llamar al endpoint de logout de Next.js");
      }
      
      // 3. Limpiar la sesión del contexto
      setSession(null);
      console.log("✅ Sesión cerrada correctamente");
      toast.success("Sesión cerrada correctamente");
      
      // 4. Esperar un momento antes de continuar
      await new Promise((resolve) => setTimeout(resolve, 150));
    } catch (error) {
      console.error("❌ Error during logout:", error);
      // Aún así limpiar la sesión local
      setSession(null);
      toast.error("Error al cerrar sesión, pero se limpió localmente.");
    } finally {
      setLoading(false);
    }
  };

  const OrderById = async (id: string) => {
    try {
      const response = await getOrderById(id);
      if (response?.status === 200) {
        return response.data;
      }
      return null;
    } catch (error) {
      console.error("Error during search user:", error);
      toast.error("Error inesperado. Intenta nuevamente.");
      return null;
    }
  };

  // Verificar autenticación al montar el componente
  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      await checkAuthentication();
      setLoading(false);
    };

    initializeAuth();
  }, []);

  return (
    <SessionContext.Provider
      value={{
        loginUser,
        registerUser,
        session,
        loading,
        userById,
        OrderById,
        logoutUser,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};
