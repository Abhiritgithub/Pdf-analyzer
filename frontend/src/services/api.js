import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 40000,
  headers: {
    'Content-Type': 'application/json'
  }
});

export async function analyzePdf(url) {
  const response = await api.post('/api/analyze', { url });
  return response.data.data;
}
