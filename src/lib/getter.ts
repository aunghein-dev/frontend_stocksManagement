import axios from 'axios';

export const getter = async (url: string) => {
  const res = await axios.get(url,{ withCredentials: true });
  return res.data;
};
