import axios from "axios";

// Axios instance pre-configured for the ShopKart backend
const api = axios.create({
  baseURL: "http://localhost:5000", // Lab_01 backend URL
  withCredentials: true,            // send & receive HttpOnly cookies automatically
});

export default api;
