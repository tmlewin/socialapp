import axios from 'axios';

const instance = axios.create({
    baseURL: 'http://localhost:8080'
});

instance.interceptors.request.use(
    (config) => {
        console.log('Axios request:', config);
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        console.error('Axios request error:', error);
        return Promise.reject(error);
    }
);

instance.interceptors.response.use(
    (response) => {
        console.log('Axios response:', response);
        return response;
    },
    (error) => {
        console.error('Axios response error:', error);
        if (error.response && error.response.status === 401) {
            // Clear token and user data from localStorage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Redirect to login page
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default instance;
