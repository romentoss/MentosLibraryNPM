import { ButtonFanMetricsService } from './button-fan-metrics.service';

describe('ButtonFanMetricsService', () => {
  let service: ButtonFanMetricsService;
  const DEFAULTS = { height: 52, paddingTop: 140, paddingLeft: 50 };
  const id1 = Symbol('a');
  const id2 = Symbol('b');

  beforeEach(() => {
    service = new ButtonFanMetricsService();
  });

  describe('register', () => {
    it('inicializa la entrada con los valores por defecto', () => {
      service.register(id1);
      expect(service.getMax()).toEqual(DEFAULTS);
    });

    it('no sobrescribe si el id ya estaba registrado', () => {
      service.register(id1);
      service.report(id1, { height: 100, paddingTop: 200, paddingLeft: 80 });
      service.register(id1);
      expect(service.getMax()).toEqual({ height: 100, paddingTop: 200, paddingLeft: 80 });
    });
  });

  describe('unregister', () => {
    it('elimina la entrada del registro', () => {
      service.register(id1);
      service.unregister(id1);
      expect(service.getMax()).toEqual(DEFAULTS);
    });

    it('dispara notify al eliminar', () => {
      service.register(id1);
      const listener = jest.fn();
      service.subscribe(listener);
      service.unregister(id1);
      expect(listener).toHaveBeenCalledTimes(1);
    });
  });

  describe('report', () => {
    it('actualiza las métricas del id y dispara notify', () => {
      service.register(id1);
      const listener = jest.fn();
      service.subscribe(listener);

      service.report(id1, { height: 80, paddingTop: 160, paddingLeft: 60 });

      expect(service.getMax()).toEqual({ height: 80, paddingTop: 160, paddingLeft: 60 });
      expect(listener).toHaveBeenCalledTimes(1);
    });
  });

  describe('getMax', () => {
    it('devuelve los defaults si no hay instancias registradas', () => {
      expect(service.getMax()).toEqual(DEFAULTS);
    });

    it('devuelve el máximo independiente por cada campo', () => {
      service.register(id1);
      service.report(id1, { height: 30, paddingTop: 200, paddingLeft: 40 });
      service.register(id2);
      service.report(id2, { height: 80, paddingTop: 120, paddingLeft: 90 });

      expect(service.getMax()).toEqual({
        height: 80,
        paddingTop: 200,
        paddingLeft: 90,
      });
    });

    it('devuelve una copia, no la referencia interna', () => {
      service.register(id1);
      const m = service.getMax();
      m.height = 999;
      expect(service.getMax().height).toBe(DEFAULTS.height);
    });
  });

  describe('subscribe', () => {
    it('añade el listener y lo invoca en cada notify', () => {
      const listener = jest.fn();
      service.subscribe(listener);

      service.register(id1);
      service.report(id1, { height: 1, paddingTop: 2, paddingLeft: 3 });
      service.unregister(id1);

      expect(listener).toHaveBeenCalledTimes(2);
    });

    it('devuelve una función de unsubscribe que elimina al listener', () => {
      const listener = jest.fn();
      const unsubscribe = service.subscribe(listener);

      service.report(id1, { height: 1, paddingTop: 2, paddingLeft: 3 });
      expect(listener).toHaveBeenCalledTimes(1);

      unsubscribe();
      service.report(id1, { height: 4, paddingTop: 5, paddingLeft: 6 });
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('dispara a todos los listeners registrados', () => {
      const l1 = jest.fn();
      const l2 = jest.fn();
      service.subscribe(l1);
      service.subscribe(l2);

      service.report(id1, { height: 1, paddingTop: 2, paddingLeft: 3 });
      expect(l1).toHaveBeenCalledTimes(1);
      expect(l2).toHaveBeenCalledTimes(1);
    });
  });
});
