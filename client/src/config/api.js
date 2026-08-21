import Axios from "axios";

const api = Axios.create({
  baseURL: import.meta.env.VITE_SERVER_API_URL,
});


export default api;
