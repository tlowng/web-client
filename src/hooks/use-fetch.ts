// src/hooks/use-fetch.ts
import { useState, useEffect, useRef } from 'react';

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
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
  
  useEffect(() => {
    // Reset mounted status
    isMountedRef.current = true;
    
    let cancelled = false;
    
    const fetchData = async () => {
      if (cancelled) {
        console.log("useFetch: Request was cancelled before starting");
        return;
      }
      
      console.log("useFetch: Starting fetch...");
      setLoading(true);
      setError(null);
      
      try {
        console.log("useFetch: Calling fetcher...");
        const response = await fetcher();
        console.log("useFetch: Raw response:", response);
        
        // Immediate check if still valid
        if (cancelled) {
          console.log("useFetch: Request was cancelled after fetch completed");
          return;
        }
        
        if (!isMountedRef.current) {
          console.log("useFetch: Component unmounted after fetch completed");
          return;
        }
        
        // Process response data
        const responseData = response.data || response;
        console.log("useFetch: Processed data:", responseData);
        
        // Set data immediately
        console.log("useFetch: Setting data...");
        setData(responseData);
        setError(null);
        hasFetchedRef.current = true;
        console.log("useFetch: Data set successfully");
        
      } catch (err: any) {
        console.error("useFetch: Error occurred:", err);
        
        if (cancelled) {
          console.log("useFetch: Error handling cancelled due to request cancellation");
          return;
        }
        
        if (!isMountedRef.current) {
          console.log("useFetch: Error handling cancelled due to component unmount");
          return;
        }
        
        const errorMessage = err.response?.data?.message || err.message || 'An unexpected error occurred.';
        console.log("useFetch: Setting error:", errorMessage);
        setError(errorMessage);
        setData(initialData);
        
      } finally {
        if (!cancelled && isMountedRef.current) {
          console.log("useFetch: Setting loading to false");
          setLoading(false);
        } else {
          console.log("useFetch: Skipping loading state update due to cancellation or unmount");
        }
      }
    };

    console.log("useFetch: useEffect triggered with dependencies:", dependencies);
    
    // Small delay to ensure component is stable
    const timeoutId = setTimeout(() => {
      if (!cancelled && isMountedRef.current) {
        fetchData();
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
  return { data, loading, error };
}