import { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Clock } from 'lucide-react';

interface RateLimitWarningProps {
  type: 'topic' | 'post' | 'like';
  onTimeout?: () => void;
}

const RATE_LIMITS = {
  topic: { limit: 5, duration: 15 * 60 * 1000 },
  post: { limit: 10, duration: 60 * 1000 },
  like: { limit: 30, duration: 60 * 1000 }
};

export function RateLimitWarning({ type, onTimeout }: RateLimitWarningProps) {
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    const key = `rateLimit_${type}`;
    const stored = localStorage.getItem(key);

    if (stored) {
      const data = JSON.parse(stored);
      const now = Date.now();

      if (now < data.resetTime) {
        setTimeLeft(data.resetTime - now);

        const interval = setInterval(() => {
          const remaining = data.resetTime - Date.now();
          if (remaining <= 0) {
            setTimeLeft(null);
            localStorage.removeItem(key);
            onTimeout?.();
            clearInterval(interval);
          } else {
            setTimeLeft(remaining);
          }
        }, 1000);

        return () => clearInterval(interval);
      } else {
        localStorage.removeItem(key);
      }
    }
  }, [type, onTimeout]);

  if (!timeLeft) return null;

  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);

  return (
    <Alert className="mb-4">
      <Clock className="h-4 w-4" />
      <AlertDescription>
        Rate limit exceeded. Please wait {minutes}m {seconds}s before creating another {type}.
      </AlertDescription>
    </Alert>
  );
}

export function trackRateLimit(type: 'topic' | 'post' | 'like'): boolean {
  const key = `rateLimit_${type}`;
  const now = Date.now();
  const limit = RATE_LIMITS[type];

  const stored = localStorage.getItem(key);
  let data = stored ? JSON.parse(stored) : { count: 0, resetTime: now + limit.duration };

  if (now >= data.resetTime) {
    data = { count: 1, resetTime: now + limit.duration };
  } else {
    data.count++;
  }

  localStorage.setItem(key, JSON.stringify(data));
  return data.count >= limit.limit;
}
