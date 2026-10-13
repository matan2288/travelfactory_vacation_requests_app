import axios from 'axios';

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.response?.data && typeof error.response.data === 'object') {
      const data = error.response.data as { message?: string; error?: string };
      if (data.message) return data.message;
      if (data.error) return data.error;
    }
    return error.message || 'An unexpected network error occurred.';
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'An unexpected error occurred. Please try again.';
}
