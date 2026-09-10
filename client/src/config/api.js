import Axios from "axios";

const API_URL =
  import.meta.env.VITE_SERVER_API_URL ||
  "http://localhost:4000/api";

const api = Axios.create({
  baseURL: API_URL,
});


export default api;
