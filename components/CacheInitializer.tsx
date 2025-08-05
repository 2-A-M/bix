'use client';

import { useEffect } from 'react';
import { initializeCache } from '@/lib/cache';

// Componente para inicializar sistema de cache
export function CacheInitializer() {
  useEffect(() => {
    initializeCache();
  }, []);

  return null; // Componente invisible
}