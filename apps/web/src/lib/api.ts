import type { FloorModel, ModelOptions, Project, TactileSummary } from "@capstone/shared";
import { apiErrors } from "@/data/content";

// Every call the webpage makes to the backend lives here.

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3003";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, init);
  } catch {
    throw new Error(apiErrors.unreachable);
  }
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: unknown } | null;
    const message = typeof body?.error === "string" ? body.error : apiErrors.requestFailed(response.status);
    throw new Error(message);
  }
  return (response.status === 204 ? undefined : await response.json()) as T;
}

const json = (method: string, body: unknown): RequestInit => ({
  method,
  headers: { "content-type": "application/json" },
  body: JSON.stringify(body),
});

export const modelsApi = {
  options: () => request<ModelOptions>("/models"),
};

export const projectsApi = {
  list: () => request<Project[]>("/projects"),
  get: (id: string) => request<Project>(`/projects/${id}`),
  upload: (form: FormData) =>
    request<Project>("/projects", { method: "POST", body: form }),
  createSample: () => request<Project>("/projects/sample", { method: "POST" }),
  remove: (id: string) => request<void>(`/projects/${id}`, { method: "DELETE" }),
  parse: (id: string) => request<Project>(`/projects/${id}/parse`, { method: "POST" }),
  saveModel: (id: string, model: FloorModel) =>
    request<Project>(`/projects/${id}/model`, json("PUT", model)),
  edit: (id: string, instruction: string) =>
    request<Project>(`/projects/${id}/edit`, json("POST", { instruction })),
  tactile: (id: string) => request<TactileSummary>(`/projects/${id}/tactile`),
};

export const imageUrl = (id: string) => `${API_URL}/projects/${id}/image`;

export const stlUrl = (id: string, plate: "map" | "legend", download = false) =>
  `${API_URL}/projects/${id}/${plate}.stl${download ? "?download=1" : ""}`;
