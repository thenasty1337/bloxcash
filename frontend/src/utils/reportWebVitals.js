import {
  onCLS,
  onFID,
  onLCP,
  onFCP,
  onTTFB,
  onINP,
} from 'web-vitals';

/**
 * Collects Web Vitals in the browser and forwards them to the provided callback.
 *
 * By default it logs metrics to the console, but you can send them to your backend
 * or an analytics service by passing a custom callback.
 *
 * Example:
 *   import { reportWebVitals } from './utils/reportWebVitals';
 *   reportWebVitals(metric => fetch('/analytics', { method: 'POST', body: JSON.stringify(metric) }));
 */
export function reportWebVitals(onReport = (metric) => {
  console.debug('[WebVitals]', metric.name, metric.value);
}) {
  if (typeof window === 'undefined') return;

  const register = (fn) => fn(onReport);

  register(onCLS);
  register(onFID);
  register(onLCP);
  register(onFCP);
  register(onTTFB);
  register(onINP);
} 