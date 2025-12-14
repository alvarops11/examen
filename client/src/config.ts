/**
 * Configuración de ExamGen
 * Endpoint del Cloudflare Worker
 */

// URL del Cloudflare Worker
// Reemplaza esto con tu URL real cuando despliegues
export const WORKER_URL =
  import.meta.env.VITE_WORKER_URL ||
  "https://examgen-worker.example.workers.dev";

// URL de fallback para desarrollo local
export const LOCAL_WORKER_URL = "http://localhost:8787";

// Función para obtener la URL correcta del worker
export function getWorkerUrl(): string {
  // Si estamos en desarrollo local, intentar usar localhost primero
  if (import.meta.env.DEV) {
    return LOCAL_WORKER_URL;
  }
  return WORKER_URL;
}
