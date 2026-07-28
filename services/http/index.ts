/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

export const api = axios.create({
  baseURL: "https://api.vibezz.com",
  // withCredentials: true,
});

export async function handleRequest<T>(
  promise: Promise<{ data: T }>,
): Promise<T> {
  try {
    const { data } = await promise;
    return data;
  } catch (error: any) {
    console.error("API error:", error?.response?.data || error.message);
    throw error?.response?.data || new Error("Erro na requisição");
  }
}
