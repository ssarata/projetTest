import axios from "axios"

const API_BASE_URL = "http://localhost:3000/api/"

const getAuthToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token") || ""
  }
  return ""
}

export const fetchVariables = async () => {
  const token = getAuthToken()
  const response = await axios.get<{ id: string; nomVariable: string }[]>(`${API_BASE_URL}variables`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return response.data
}

export const createVariable = async (nomVariable: string) => {
  const token = getAuthToken()
  const response = await axios.post(
    `${API_BASE_URL}variables`,
    { nomVariable },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )
  return response.data
}


export const updateVariable = async (id: number, newName: string) => {
  const token = getAuthToken();
  const response = await axios.put(
    `${API_BASE_URL}variables/${id}`,
    { nomVariable: newName },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const deleteVariable = async (id: number) => {
  const token = getAuthToken();
  const response = await axios.delete(
    `${API_BASE_URL}variables/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};