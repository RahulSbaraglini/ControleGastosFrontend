import axios from "axios";

export const http = axios.create({
  baseURL: "http://localhost:5172/api",
  timeout: 10000,
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === "ERR_NETWORK") {
      return Promise.reject(
        new Error("Não foi possível conectar com a API.")
      );
    }

    const apiMessage =
      error?.response?.data?.message ||
      error?.response?.data?.title ||
      "Erro ao processar requisição.";
    return Promise.reject(new Error(apiMessage));
  }
);