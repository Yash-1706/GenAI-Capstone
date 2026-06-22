import { useEffect, useState } from 'react';
import axios from 'axios';
import { apiClient } from '../api/client';

type Status = 'checking' | 'online' | 'offline';

// The health endpoint lives at the API host root, not under `/api`, so strip the
// trailing `/api` from the configured base URL.
const healthUrl = `${(apiClient.defaults.baseURL ?? '').replace(/\/api$/, '')}/health`;

const STATUS_CONFIG: Record<Status, { color: string; label: string }> = {
  checking: { color: 'bg-amber-400', label: 'Checking backend…' },
  online: { color: 'bg-emerald-500', label: 'Backend online' },
  offline: { color: 'bg-red-500', label: 'Backend offline' },
};

/**
 * Small live indicator that polls the backend `/health` endpoint and shows a
 * colored dot: amber while checking, green when online, red when unreachable.
 * Purely presentational/diagnostic — it never blocks the rest of the UI.
 */
export default function BackendStatus({ pollMs = 30000 }: { pollMs?: number }) {
  const [status, setStatus] = useState<Status>('checking');

  useEffect(() => {
    let active = true;

    const check = async () => {
      try {
        const res = await axios.get(healthUrl, { timeout: 5000 });
        if (active) setStatus(res.data?.status === 'ok' ? 'online' : 'offline');
      } catch {
        if (active) setStatus('offline');
      }
    };

    check();
    const id = setInterval(check, pollMs);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, [pollMs]);

  const { color, label } = STATUS_CONFIG[status];

  return (
    <div className="flex items-center gap-1.5 px-1" title={label} aria-label={label} role="status">
      <span className="relative flex h-2.5 w-2.5">
        {status === 'online' && (
          <span
            className={`absolute inline-flex h-full w-full animate-ping rounded-full ${color} opacity-60`}
          />
        )}
        <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${color}`} />
      </span>
      <span className="hidden lg:inline text-xs text-stone-500 dark:text-stone-400">{label}</span>
    </div>
  );
}
