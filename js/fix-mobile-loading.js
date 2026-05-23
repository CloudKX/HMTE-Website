/* ═══════════════════════════════════════════════════════════════════
   FIX MOBILE LOADING/RE-RENDER ISSUE
   Pasang script ini SEBELUM semua component scripts di index.html
═══════════════════════════════════════════════════════════════════ */

(function() {
  'use strict';

  // ─── CACHE SYSTEM ───────────────────────────────────────────────
  // Simpan data yang sudah di-fetch agar tidak di-load ulang
  const DataCache = {
    data: {},
    set(key, value) {
      this.data[key] = { value, timestamp: Date.now() };
    },
    get(key) {
      const cached = this.data[key];
      return cached ? cached.value : null;
    },
    has(key) {
      return key in this.data;
    }
  };

  // ─── ANIMATION STATE TRACKER ───────────────────────────────────
  // Tandai element yang sudah dianimasikan, jangan ulang
  const AnimationState = {
    animated: new WeakSet(),
    mark(element) {
      this.animated.add(element);
    },
    isAnimated(element) {
      return this.animated.has(element);
    }
  };

  // ─── FIX INTERSECTION OBSERVER ──────────────────────────────────
  // Jangan reset class 'is-visible' setelah diset
  function createSafeObserver(options = {}) {
    const defaultOpts = {
      threshold: 0.08,
      rootMargin: '0px 0px -40px 0px',
      ...options
    };

    return new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Set class HANYA SEKALI
          if (!AnimationState.isAnimated(entry.target)) {
            entry.target.classList.add('is-visible');
            AnimationState.mark(entry.target);
            entry.observer.unobserve(entry.target);
          }
        }
      });
    }, defaultOpts);
  }

  // ─── FIX FETCH WITH CACHE ──────────────────────────────────────
  async function cachedFetch(url) {
    if (DataCache.has(url)) {
      return DataCache.get(url);
    }

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      DataCache.set(url, data);
      return data;
    } catch (error) {
      console.error(`[cachedFetch] Error: ${error.message}`);
      throw error;
    }
  }

  // ─── EXPORT KE GLOBAL ──────────────────────────────────────────
  window.__SafeAnimationUtils = {
    createSafeObserver,
    cachedFetch,
    DataCache,
    AnimationState
  };

  console.log('[SafeAnimationUtils] Loaded ✓');
})();
