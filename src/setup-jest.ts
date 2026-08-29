import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';

setupZoneTestEnv();

// jsdom no implementa ResizeObserver; polyfill que captura los callbacks
// para que los tests puedan forzar el recálculo de métricas.
type ROCallback = () => void;
const roCallbacks = new Set<ROCallback>();

(globalThis as unknown as { ResizeObserver: new (cb: ROCallback) => unknown }).ResizeObserver =
  class {
    private cb: ROCallback;
    constructor(cb: ROCallback) {
      this.cb = cb;
      roCallbacks.add(cb);
    }
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {
      roCallbacks.delete(this.cb);
    }
  };

(globalThis as unknown as { __triggerResizeObservers: () => void }).__triggerResizeObservers =
  () => {
    for (const cb of Array.from(roCallbacks)) cb();
  };

