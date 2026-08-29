import { Injectable } from '@angular/core';

export interface ButtonFanMetrics {
  height: number;
  paddingTop: number;
  paddingLeft: number;
}

const DEFAULTS: ButtonFanMetrics = { height: 52, paddingTop: 140, paddingLeft: 50 };

/**
 * Servicio singleton que recoge las métricas de cada ButtonFanMentosComponent
 * y reparte el máximo a todas. Así, cuando se ponen varios en fila,
 * los stages crecen lo necesario para el más ancho y todos quedan
 * alineados al mismo nivel.
 */
@Injectable({ providedIn: 'root' })
export class ButtonFanMetricsService {
  private metrics = new Map<symbol, ButtonFanMetrics>();
  private listeners = new Set<() => void>();

  register(id: symbol): void {
    if (!this.metrics.has(id)) {
      this.metrics.set(id, { ...DEFAULTS });
    }
  }

  unregister(id: symbol): void {
    this.metrics.delete(id);
    this.notify();
  }

  report(id: symbol, m: ButtonFanMetrics): void {
    this.metrics.set(id, m);
    this.notify();
  }

  getMax(): ButtonFanMetrics {
    let max: ButtonFanMetrics | null = null;
    for (const m of this.metrics.values()) {
      max = max === null
        ? { height: m.height, paddingTop: m.paddingTop, paddingLeft: m.paddingLeft }
        : {
            height: Math.max(max.height, m.height),
            paddingTop: Math.max(max.paddingTop, m.paddingTop),
            paddingLeft: Math.max(max.paddingLeft, m.paddingLeft),
          };
    }
    return max ?? { ...DEFAULTS };
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    for (const l of this.listeners) l();
  }
}
