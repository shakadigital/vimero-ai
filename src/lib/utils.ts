export { cn } from "cn"

export function getErrorMessage(error: unknown, fallback = "Terjadi kesalahan"): string {
  if (error instanceof Error) return error.message
  if (typeof error === "string" && error.length > 0) return error
  return fallback
}
