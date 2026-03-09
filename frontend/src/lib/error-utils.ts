import { AxiosError } from 'axios';

/**
 * Extract a user-friendly error message from an Axios error or generic Error.
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const detail = error.response?.data?.detail;

    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail)) {
      return detail.map((d: any) => d.msg || String(d)).join('; ');
    }

    if (error.response) {
      const status = error.response.status;
      if (status === 401) return 'Session expired. Please sign in again.';
      if (status === 403) return 'You do not have permission for this action.';
      if (status === 404) return 'The requested resource was not found.';
      if (status === 422) return 'Invalid data submitted. Please check your input.';
      if (status >= 500) return 'Server error. Please try again later.';
    }

    if (error.code === 'ERR_NETWORK') return 'Network error. Please check your connection.';
    if (error.code === 'ECONNABORTED') return 'Request timed out. Please try again.';

    return error.message || 'Something went wrong.';
  }

  if (error instanceof Error) return error.message;
  return 'An unexpected error occurred.';
}
