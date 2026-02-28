/**
 * Shared constants used by both middleware (Edge) and server code.
 * Edge-runtime compatible — no Node.js-specific APIs.
 */

export const ACCESS_TOKEN_COOKIE = "volttrack_access_token";
export const REFRESH_TOKEN_COOKIE = "volttrack_refresh_token";
export const CSRF_COOKIE_NAME = "volttrack_csrf_token";
export const CSRF_HEADER_NAME = "x-csrf-token";

export const ACCESS_TOKEN_EXPIRY = "15m";
export const ACCESS_TOKEN_MAX_AGE = 15 * 60; // 15 minutes in seconds
export const REFRESH_TOKEN_EXPIRY = "7d";
export const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds

/** Routes that require authentication */
export const PROTECTED_PATHS = ["/dashboard", "/charging", "/history", "/profile"];

/** Routes only for unauthenticated users */
export const AUTH_PATHS = ["/login", "/register"];

/** HTTP methods that require CSRF protection */
export const CSRF_METHODS = ["POST", "PATCH", "DELETE"];
