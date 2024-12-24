import axios from 'axios';

const apiUrl = 'http://localhost:3000/chatQandA';

export async function getChatResponse(data) {
  try {
    const response = await axios.post(apiUrl, data);
    return response.data;
  } catch (error) {
    console.error('Error making API call:', error);
    throw error;
  }
}