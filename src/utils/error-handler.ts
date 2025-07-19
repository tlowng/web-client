export const handleApiError = (error: any): string => {
  if (error.response) {
    const status = error.response.status;
    const data = error.response.data;

    switch (status) {
      case 401:
        localStorage.removeItem('token');
        window.location.href = '/login';
        return 'Authentication required. Please login again.';
      case 403:
        return data?.message || 'You do not have permission to perform this action.';
      case 429:
        return data?.message || 'Too many requests. Please wait before trying again.';
      case 400:
        if (data?.errors && Array.isArray(data.errors)) {
          return data.errors.map((err: any) => err.message || err).join(', ');
        }
        return data?.message || 'Invalid request data.';
      case 404:
        return data?.message || 'Resource not found.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return data?.message || `Server error (${status})`;
    }
  } else if (error.request) {
    return 'Network error. Please check your connection.';
  } else {
    return error.message || 'An unexpected error occurred.';
  }
};
