import axios from "axios";

type Auth = {
  email: string;
  password: string;
};

type Register = {
  name: string;
  password: string;
  email: string;
  phone: string;
  address: string[];
  locality: string;
  notes: string;
}


export default function useAuth() {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://burgerli.com.ar/MdpuF8KsXiRArNIHtI6pXO2XyLSJMTQ8_Burgerli/api';

  const login = async ({ email, password }: Auth) => {
      const res = await axios.post(
        `${API_BASE_URL}/token-user-client`,
        { email, password }, {
        withCredentials: true,
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        validateStatus: s => s < 500,
      });
       // MAPEÁ SIEMPRE A UN NOMBRE CONSISTENTE
  const api = res.data;               
  const id = String(api.user_id ?? api.id_user_client);  
  if (!id) throw new Error("Falta user_id en la respuesta");

      return res;
  };
  
  const register = async (data : Register) => {
    const res = await fetch("https://burgerli.com.ar/MdpuF8KsXiRArNIHtI6pXO2XyLSJMTQ8_Burgerli/api/registerUserClients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),                      
    });
  
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("❌ Error en registro:", err);
      
      // El backend devuelve { detail: "mensaje de error" }
      const errorMessage = err.detail || `Error ${res.status}`;
      throw new Error(errorMessage);
    }
    
    return res.json();
  };

  const getUserById = async (id_user_client: string) => {
    try {
      const response = await axios.get(
        `https://burgerli.com.ar/MdpuF8KsXiRArNIHtI6pXO2XyLSJMTQ8_Burgerli/api/get_users/${id_user_client}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        },
      );      
      if (response.status === 200) {
        return response;
      }
      return null;
    } catch (error) {
      console.log(error);
    }
  }
  const verifyCookie = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/verify-cookie`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        },
      );      
      if (response.status === 200) {
        return response;
      }
    }
    catch (error) {console.error(error)}
  }

  const getOrderById = async (id: string) => {
    try {
      const response = await axios.get(
        `https://burgerli.com.ar/MdpuF8KsXiRArNIHtI6pXO2XyLSJMTQ8_Burgerli/api/getOrderById/${id}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        },
      );      
      if (response.status === 200) {
        return response;
      }
    }
    catch (error) {console.error(error)}
  }

  const logout = async () => {
    try {
      const response = await axios.get(
        `https://burgerli.com.ar/MdpuF8KsXiRArNIHtI6pXO2XyLSJMTQ8_Burgerli/api/logout`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        },
      );      
      if (response.status === 200) {
        return response;
      }
    }
    catch (error) {console.error(error)}
  }

  return {login, register, getUserById, verifyCookie, logout, getOrderById};
}