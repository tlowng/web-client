// src/hooks/use-fetch.ts
import { useState, useEffect, useRef, useCallback } from 'react';

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useFetch<T>(
  fetcher: () => Promise<any>, 
  initialData: T | null = null,
  dependencies: any[] = []
): FetchState<T> {
  const [data, setData] = useState<T | null>(initialData);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Use ref to track if component is mounted
  const isMountedRef = useRef(true);
  const hasFetchedRef = useRef(false);
  
  const fetchData = useCallback(async () => {
    console.log("useFetch: Starting fetch...");
    setLoading(true);
    setError(null);
    
    try {
      console.log("useFetch: Calling fetcher...");
      const response = await fetcher();
      console.log("useFetch: Raw response:", response);
      
      if (!isMountedRef.current) {
        console.log("useFetch: Component unmounted after fetch completed");
        return;
      }
      
      // Process response data
      const responseData = response;
      console.log("useFetch: Processed data:", responseData);
      
      // Set data immediately
      console.log("useFetch: Setting data...");
      setData(responseData);
      setError(null);
      hasFetchedRef.current = true;
      console.log("useFetch: Data set successfully");
      
    } catch (err: any) {
      console.error("useFetch: Error occurred:", err);
      
      if (!isMountedRef.current) {
        console.log("useFetch: Error handling cancelled due to component unmount");
        return;
      }
      
      const errorMessage = err.response?.data?.message || err.message || 'An unexpected error occurred.';
      console.log("useFetch: Setting error:", errorMessage);
      setError(errorMessage);
      setData(initialData);
      
    } finally {
      if (isMountedRef.current) {
        console.log("useFetch: Setting loading to false");
        setLoading(false);
      }
    }
  }, [fetcher, initialData]);
  
  useEffect(() => {
    // Reset mounted status
    isMountedRef.current = true;
    
    let cancelled = false;
    
    const runFetch = async () => {
      if (cancelled) {
        console.log("useFetch: Request was cancelled before starting");
        return;
      }
      
      await fetchData();
    };

    console.log("useFetch: useEffect triggered with dependencies:", dependencies);
    
    // Small delay to ensure component is stable
    const timeoutId = setTimeout(() => {
      if (!cancelled && isMountedRef.current) {
        runFetch();
      }
    }, 0);

    // Cleanup function
    return () => {
      console.log("useFetch: Cleanup function called");
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, dependencies);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log("useFetch: Component unmounting - setting isMountedRef to false");
      isMountedRef.current = false;
    };
  }, []);

  console.log("useFetch: Current state - data:", data, "loading:", loading, "error:", error, "hasFetched:", hasFetchedRef.current);
  
  // Return với refetch function
  return { 
    data, 
    loading, 
    error, 
    refetch: fetchData 
  };
}