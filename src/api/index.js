import axios from 'axios';

const API_URL = process.env.BACKEND_API_BASEURL

const api = axios.create({
  baseURL: `${API_URL}/api`,
});


api.interceptors.request.use((config) => {
  config.headers["ngrok-skip-browser-warning"] = "Yes";

  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      alert('Session expired. Please log in again.');
    }
    return Promise.reject(error);
  }
);

export const loginUser = (data) => api.post('/auth/login', data);
export const registerUser = (data) => api.post('/auth/register', data);
export const checkLogin = (login) => api.get(`/auth/check-login?login=${login}`);
export const checkEmail = (email) => api.get(`/auth/check-email?email=${email}`);
export const getCurrentUser = async () => {
  // const token = localStorage.getItem('token');
  // axios.defaults.headers.common["Authorization"] = token;
  // if (!token) {
  //   throw new Error('No token found');
  // }
  // const config = {
  //   headers: {
  //     Authorization: `Bearer ${token}`,
  //   },
  // };
  // console.log(config);
  return api.get('/users/me');
}
export const updateUser = async (data) => {
  // const token = localStorage.getItem('token');
  // if (!token) {
  //   throw new Error('No token found');
  // }
  // const config = {
  //   headers: {
  //     Authorization: `Bearer ${token}`,
  //   },
  //   params: data
  // };
  return api.put('/users/me/update-profile', data);
}
export const getUsers = async () => {
  // const token = localStorage.getItem('token');
  // if (!token) {
  //   throw new Error('No token found');
  // }
  // const config = {
  //   headers: {
  //     Authorization: `Bearer ${token}`,
  //   },
  // };
  return api.get('/users/');
}
export const getUserById = async (id) => {
  // const token = localStorage.getItem('token');
  // if (!token) {
  //   throw new Error('No token found');
  // }
  // const config = {
  //   headers: {
  //     Authorization: token ? `Bearer ${token}` : '',
  //   },
  // };
  return api.get(`/users/${id}`);
}
export const getMatches = async () => {
  // const token = localStorage.getItem('token');
  // if (!token) {
  //   throw new Error('No token found');
  // }
  // const config = {
  //   headers: {
  //     Authorization: `Bearer ${token}`,
  //   },
  // };
  return api.get(`/users/me/matches`);
}
export const getInterests = () => api.get(`/interests/`);
export const createConference = (data) => api.post('/conferences/', data);
export const getConferences = () => api.get('/conferences/');
export const getConferenceById = (id) => api.get(`/conferences/${id}`);
export const getRatings = (id) => api.get(`/ratings/me/conference/${id}`);
export const submitRating = (data) => api.post(`/ratings/me`, data)

export default api;