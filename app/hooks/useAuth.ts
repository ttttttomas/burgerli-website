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
  address: string
}


export default function useAuth() {

  const login = async ({ email, password }: Auth) => {
      const res = await axios.post(`http://localhost:8000/token-user-client`, { email, password }, {
        withCredentials: true,
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        validateStatus: s => s < 500,
      });
      // if (res.data === null) {
      //   throw new Error("Credenciales inválidas");
      // }
       // MAPEÁ SIEMPRE A UN NOMBRE CONSISTENTE
  const api = res.data;               
  const id = String(api.user_id ?? api.id);  
  if (!id) throw new Error("Falta user_id en la respuesta");

      return res;
  };
  
  const register = async (data : Register) => {
    try {
      const res = await fetch("https://api-burgerli.iwebtecnology.com/api/create_user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),                      
      });
    
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error("Error 422 detail:", err); // mira aquí el detalle exacto
        throw new Error(`HTTP ${res.status}`);
      }
      return res.json();
    } catch (error) {
      console.log(error);
    }
  };

  const getUserById = async (id_user_client: string) => {
    try {
      const response = await axios.get(
        `http://localhost:8000/get_users/${id_user_client}`,
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
        `http://localhost:8000/verify-cookie`,
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
        `http://localhost:8000/getOrderById/${id}`,
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
        `http://localhost:8000/logout`,
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