// axiosConfig.js
import axios from "axios";

const axiosInstance = axios.create({
    baseURL: " https://greenbazzarr-4.onrender.com/api",
    withCredentials: true
});


export default axiosInstance;
