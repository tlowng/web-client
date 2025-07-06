import { useState, useEffect, useCallback } from 'react';

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useFetch<T>(fetcher: () => Promise<any>, initialData: T | null = null): FetchState<T> {
  const [data, setData] = useState<T | null>(initialData);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetcher();
      console.log("useFetch: Fetched data successfully:", response.data); // New log for successful fetch
      setData(response.data);
    } catch (err: any) {
      console.error("useFetch: Failed to fetch data:", err); // New log for error
      setError(err.response?.data?.message || err.message || 'An unexpected error occurred.');
    } finally {
      console.log("useFetch: Fetching complete. Loading:", false); // New log for loading state
      setLoading(false);
    }
  }, [fetcher]);

  useEffect(() => {
    console.log("useFetch: useEffect triggered."); // New log for useEffect trigger
    fetchData();
  }, [fetchData]);

  console.log("useFetch: Current state - data:", data, ", loading:", loading, ", error:", error); // New log for current state

  return { data, loading, error };
}
