import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api/";

const getAuthToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token") || "";
  }
  return "";
};

export const fetchDocumentPersonnesByDocumentId = async (documentId: number, serverToken?: string) => {
  // Utilise le token du serveur s'il est fourni, sinon celui du client
  const token = serverToken || getAuthToken();
  const response = await axios.get(
    `${API_BASE_URL}document-personnes/document/${documentId}`,
    {
      headers: token ? {
        Authorization: `Bearer ${token}`
      } :{},
    }
  );
  return response.data;
};