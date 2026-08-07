const API_BASE = import.meta.env.VITE_API_BASE ?? "/api/v1";

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data?: T;
}

interface ApiErrorBody {
  message?: string;
  errors?: Array<{ path?: string | string[]; message?: string }>;
}

export class ApiError extends Error {
  readonly status: number;
  readonly fieldErrors: Record<string, string>;

  constructor(status: number, message: string, fieldErrors: Record<string, string> = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  const body = (await res.json().catch(() => null)) as ApiEnvelope<T> | ApiErrorBody | null;

  if (!res.ok) {
    const fieldErrors: Record<string, string> = {};
    const errorBody = body as ApiErrorBody | null;
    if (errorBody && Array.isArray(errorBody.errors)) {
      for (const e of errorBody.errors) {
        const key = Array.isArray(e.path) ? e.path[0] : e.path;
        if (key && !fieldErrors[key] && e.message) fieldErrors[key] = e.message;
      }
    }
    throw new ApiError(
      res.status,
      errorBody?.message ?? "Something went wrong. Please try again.",
      fieldErrors,
    );
  }

  return (body as ApiEnvelope<T>).data as T;
}
