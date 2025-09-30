import axios from "axios";

type Auth = {
  username: string;
  password: string;
};


export default function useAuth() {

  const login = async ({ username, password }: Auth) => {
      const res = await axios.post(`http://localhost:8000/token`, { username, password }, {
        withCredentials: true,
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        validateStatus: s => s < 500,
      });
      if (res.data === null) {
        throw new Error("Credenciales inválidas");
      }
       // MAPEÁ SIEMPRE A UN NOMBRE CONSISTENTE
  const api = res.data as any;               
  const id = String(api.user_id ?? api.id);  
  if (!id) throw new Error("Falta user_id en la respuesta");

      return res;
  };
  
  const register = async ({username, password}: Auth) => {
    try {
      const response = await axios.post(
        "http://localhost:8000/register",
        {username, password},
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (response.status === 200) {
        return response;
      }
    } catch (error) {
      console.log(error);
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 400) {
          console.error("Invalid username or password");
        } else {
          console.error("An error occurred during login");
        }
      } else {
        console.error("An unexpected error occurred");
      }
    }
  };
  const getUserById = async (id: string) => {
    try {
      const response = await axios.get(
        `http://localhost:8000/getUserByID/${id}`,
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
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 400) {
          console.error("Invalid username or password");
        } else {
          console.error("An error occurred during login");
        }
      } else {
        console.error("An unexpected error occurred");
      }
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

  return {login, register, getUserById, verifyCookie, logout};
}