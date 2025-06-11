// Performance testing utility
export function measurePerformance(name, fn) {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  
  console.log(`⏱️  ${name}: ${(end - start).toFixed(2)}ms`);
  
  if (end - start > 16) {
    console.warn(`🐌 ${name} is slow (>${16}ms)`);
  }
  
  return result;
}

export function trackLCP() {
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'largest-contentful-paint') {
          console.log(`🎯 LCP: ${entry.startTime.toFixed(2)}ms`);
          
          if (entry.startTime > 2500) {
            console.error('❌ LCP is poor (>2.5s)');
          } else if (entry.startTime > 1000) {
            console.warn('⚠️ LCP needs improvement (>1s)');
          } else {
            console.log('✅ LCP is good (<1s)');
          }
        }
      }
    });
    
    try {
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      console.log('LCP observation not supported');
    }
  }
}

export function trackResourceTiming() {
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 1000) { // Resources taking >1s
          console.warn(`🐌 Slow resource: ${entry.name} took ${entry.duration.toFixed(2)}ms`);
        }
      }
    });
    
    try {
      observer.observe({ entryTypes: ['resource'] });
    } catch (e) {
      console.log('Resource timing observation not supported');
    }
  }
}

// Auto-start tracking in development
if (import.meta.env.DEV) {
  trackLCP();
  trackResourceTiming();
} 