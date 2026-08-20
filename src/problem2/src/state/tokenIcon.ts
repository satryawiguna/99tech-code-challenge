/**
 * Presentation may depend on State (and Domain types), not Infrastructure
 * directly (architecture.md §5.1) — this thin re-export is the sanctioned
 * path for Presentation to reach Infrastructure's icon resolver.
 */
export { resolveTokenIconPath, FALLBACK_TOKEN_ICON_PATH } from "@/infrastructure";
