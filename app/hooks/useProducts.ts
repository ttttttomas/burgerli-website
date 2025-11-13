import axios from "axios";

export default function useAuth() {
  const getBurgers = async () => {
    try {
      const response = await axios.get(
        "https://api-burgerli.iwebtecnology.com/api/burgers",
      );
      if (!response) {
        return null;
      }
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

  const createOrder = async (order: any) => {
    const response = await fetch(
      "http://localhost:8000/createOrder",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order), // <-- objeto, NO array
      },
    );

    if (!response.ok) {
      const err = await response.text();
      throw new Error(
        `Error API externa: ${response.status} ${response.statusText} – ${err}`,
      );
    }

    const createdOrder = await response.json();
    console.log("✅ Orden creada exitosamente:", createdOrder);
    return createdOrder;
  };
  const getOrder = async (id: string) => {
    try {
      const response = await axios.get(
        `https://api-burgerli.iwebtecnology.com/api/orders/${id}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
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
  return { getBurgers, getOrder, createOrder };
}
