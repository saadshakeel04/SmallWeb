import axios from "axios";
import type { Person, Site } from "@/types/api";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
  "http://localhost:3001/api/v1";

export const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: 10_000,
  headers: { Accept: "application/json" },
});

export async function getPeople(signal?: AbortSignal): Promise<Person[]> {
  const response = await api.get<Person[]>("/people", { signal });
  return response.data;
}

export async function getSite(address: string): Promise<Site> {
  const response = await api.get<Site>(`/sites/${encodeURIComponent(address)}`);
  return response.data;
}
