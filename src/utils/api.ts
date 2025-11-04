import axios from "axios";


/**
 * Axios instance configured with the application's base URL and default headers.
 *
 * @constant
 * @type {import('axios').AxiosInstance}
 *
 * @remarks
 * - The `baseURL` is set from the environment variable `VITE_BASE_URl` using Vite's import.meta.env.
 * - The default `Content-type` header is set to `application/json` for all requests.
 *
 * @example
 * // Use the `app` instance to make API requests:
 * app.get('/endpoint').then(response => { ... });
 */
const app: import('axios').AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_BASE_URl,
    withCredentials: true,
    headers: {
        "Content-type": "application/json"
    }
});

// app.interceptors.response.use(undefined,async(error)=>{
//     if(error.response?.status === 403 || error.response?.status === 401){
//         window.location.href = '/';
//         throw error;
//     }
//     return app(error.config)   
// })

export default app;