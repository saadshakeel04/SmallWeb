import axios from "axios";
import type { CreateVisitInput, Person, Site, Visit, VisitPage } from "@/types/api";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
  "http://localhost:3001/api/v1";
const HISTORY_PAGE_SIZE = 5;

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

export async function recordVisit(input: CreateVisitInput): Promise<Visit> {
  const response = await api.post<Visit>("/visits", input);
  return response.data;
}

export async function getVisits(
  personId: string,
  page: number,
  signal?: AbortSignal,
): Promise<VisitPage> {
  const response = await api.get<VisitPage>("/visits", {
    params: { personId, page, limit: HISTORY_PAGE_SIZE },
    signal,
  });
  return response.data;
}
