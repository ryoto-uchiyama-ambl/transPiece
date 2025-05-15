// lib/api.ts

import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000', // Laravel Sail のポート
  withCredentials: true, // Cookie を送信するために必要
  withXSRFToken: true,
});

export default api;
