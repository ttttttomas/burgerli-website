import { Orders } from "@/types";
import axios from "axios";

export default function useAuth() {
  const getBurgers = async () => {
    try {
      const response = await axios.get(
        "https://api-burgerli.iwebtecnology.com/api/burgers",
      );

      if (response.status === 200) {
        return response.data;
      }
    } catch (error) {
      console.log(error);
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 400) {
          console.error("Invalid username or password");
        } else {
          console.error(error);
        }
      } else {
        console.error("An unexpected error occurred");
      }
    }
  };

  const createOrder = async (order: Orders) => {
    try {
      const response = await axios.post(
        "https://api-burgerli.iwebtecnology.com/api/createOrder", order,{
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        return response.data;
      }
    } catch (error) {
      console.log(error);
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 400) {
          console.error("Invalid username or password");
        } else {
          console.error(error);
        }
      } else {
        console.error("An unexpected error occurred");
      }
    }

  };
  const getOrder = async (id: string) => {
    try {
      const response = await axios.get(
        `https://api-burgerli.iwebtecnology.com/api/orders/${id}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        return response.data;
      }
    }catch (error) {
      console.log(error);
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 400) {
          console.error("Invalid username or password");
        } else {
          console.error(error);
        }
      } else {
        console.error("An unexpected error occurred");
      }
    }
  }
  return {getBurgers, getOrder, createOrder};
}