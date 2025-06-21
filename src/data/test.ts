import axios from 'axios';

export async function fetchData() {
  const API = process.env.NEXT_PUBLIC_API_URL;

  try {
    const response = await axios.get(`${API}/auth/info`, {
      withCredentials: true,
      headers: { 'Content-Type': 'application/json' }
    });

    console.log("Data fetched successfully:", response.data);

  } catch (error: any) {
    console.error("Request failed:", error.response?.data?.message || error.message);
  }
}
