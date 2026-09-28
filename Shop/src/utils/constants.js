export const FRONTEND_BASE_URL =
  import.meta.env.VITE_FRONTEND_BASE_URL ||
  import.meta.env.VITE_FRONTEND_URL ||
  import.meta.env.FRONTEND_URL ||
  "https://infinitohq.com";

export const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL ||
  import.meta.env.VITE_BASE_URL ||
  import.meta.env.BACKEND_URL ||
  "https://infinitocomics-68cr.onrender.com";

export const RESEARCH_BASE_URL =
  import.meta.env.VITE_RESEARCH_BASE_URL || "https://research.infinitohq.com";

export const FOUNDATION_BASE_URL =
  import.meta.env.VITE_FOUNDATION_BASE_URL || "https://foundation.infinitohq.com";
