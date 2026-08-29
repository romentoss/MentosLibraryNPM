import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonFanMentosComponent, ButtonFanMentosIcon } from './button-fan-mentos.component';
import { ButtonFanMetricsService } from './button-fan-metrics.service';

const DEFAULT_RECT = {
  width: 100,
  height: 50,
  top: 0,
  left: 0,
  right: 100,
  bottom: 50,
  x: 0,
  y: 0,
  toJSON: () => ({}),
} as DOMRect;

function rectOf(overrides: Partial<DOMRect>): DOMRect {
  return { ...DEFAULT_RECT, ...overrides } as DOMRect;
}

declare global {
  // eslint-disable-next-line no-var
  var __triggerResizeObservers: () => void;
}

describe('ButtonFanMentosComponent', () => {
  let fixture: ComponentFixture<ButtonFanMentosComponent>;
  let component: ButtonFanMentosComponent;
  let metrics: ButtonFanMetricsService;

  beforeEach(async () => {
    jest
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockReturnValue(DEFAULT_RECT);

    await TestBed.configureTestingModule({
      imports: [ButtonFanMentosComponent],
    }).compileComponents();

    metrics = TestBed.inject(ButtonFanMetricsService);
    fixture = TestBed.createComponent(ButtonFanMentosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  function getBtn(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('button.btn') as HTMLButtonElement;
  }
  function getIcon(): HTMLElement | null {
    return fixture.nativeElement.querySelector('.icon') as HTMLElement | null;
  }
  function getStage(): HTMLElement {
    return fixture.nativeElement.querySelector('.stage') as HTMLElement;
  }
  function triggerResize(): void {
    __triggerResizeObservers();
  }

  describe('renderizado de inputs', () => {
    it('muestra el texto en el botón', () => {
      component.text = 'Guardar';
      fixture.detectChanges();
      expect(getBtn().textContent?.trim()).toBe('Guardar');
    });

    it('aplica el color de fondo en el botón (jsdom normaliza hex a rgb)', () => {
      component.color = '#dc2626';
      fixture.detectChanges();
      expect(getBtn().style.background).toContain('rgb(220, 38, 38)');
    });

    it('aplica el ángulo de rotación como CSS custom property', () => {
      component.rotationAngle = -30;
      fixture.detectChanges();
      expect(getBtn().style.getPropertyValue('--rotation-angle')).toBe('-30deg');
    });

    it('no renderiza .icon cuando icon es "none"', () => {
      component.icon = 'none';
      fixture.detectChanges();
      expect(getIcon()).toBeNull();
    });

    it.each<[ButtonFanMentosIcon, string]>([
      ['cursor', 'M3 3l7.07'],
      ['save', 'M19 21H5'],
      ['trash', 'M19 6v14'],
    ])('renderiza el svg correspondiente para icon="%s"', (icon, svgPathStartsWith) => {
      component.icon = icon;
      fixture.detectChanges();
      const iconEl = getIcon();
      expect(iconEl).not.toBeNull();
      const svg = iconEl!.querySelector('svg');
      expect(svg).not.toBeNull();
      expect(svg!.innerHTML).toContain(svgPathStartsWith);
    });
  });

  describe('cálculo de métricas (padding)', () => {
    it('reporta paddingTop, paddingLeft y height según la fórmula con rotationAngle=-45', () => {
      const max = metrics.getMax();
      expect(max.height).toBe(50);
      expect(max.paddingTop).toBe(73);
      expect(max.paddingLeft).toBe(52);
    });

    it('añade el paddingMargin a ambos paddings', () => {
      jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(DEFAULT_RECT);

      component.paddingMargin = 0;
      triggerResize();
      const baseTop = metrics.getMax().paddingTop;
      const baseLeft = metrics.getMax().paddingLeft;

      component.paddingMargin = 32;
      triggerResize();
      const newTop = metrics.getMax().paddingTop;
      const newLeft = metrics.getMax().paddingLeft;

      expect(newTop - baseTop).toBe(32);
      expect(newLeft - baseLeft).toBe(32);
    });

    it('reporta altura 0 y padding=margin cuando el botón no tiene dimensiones', () => {
      jest
        .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
        .mockReturnValue(rectOf({ width: 0, height: 0 }));

      triggerResize();

      const max = metrics.getMax();
      expect(max.height).toBe(0);
      expect(max.paddingTop).toBe(component.paddingMargin);
      expect(max.paddingLeft).toBe(component.paddingMargin);
    });

    it('cuando rotationAngle=0 los paddings son básicamente el margen', () => {
      component.rotationAngle = 0;
      triggerResize();

      const max = metrics.getMax();
      expect(max.paddingLeft).toBe(component.paddingMargin);
    });
  });

  describe('métricas compartidas con el servicio', () => {
    it('aplica las CSS custom properties del máximo en el .stage', () => {
      metrics.report(Symbol('otro'), {
        height: 50,
        paddingTop: 123,
        paddingLeft: 45,
      });
      fixture.detectChanges();

      const stage = getStage();
      expect(stage.style.getPropertyValue('--btn-height')).toBe('50px');
      expect(stage.style.getPropertyValue('--btn-padding-top')).toBe('123px');
      expect(stage.style.getPropertyValue('--btn-padding-left')).toBe('52px');
    });

    it('suscriptor: reacciona cuando otra instancia reporta métricas nuevas', () => {
      fixture.detectChanges();

      metrics.report(Symbol('otro'), {
        height: 200,
        paddingTop: 250,
        paddingLeft: 100,
      });
      fixture.detectChanges();

      const stage = getStage();
      expect(stage.style.getPropertyValue('--btn-height')).toBe('200px');
      expect(stage.style.getPropertyValue('--btn-padding-top')).toBe('250px');
      expect(stage.style.getPropertyValue('--btn-padding-left')).toBe('100px');
    });

    it('cada instancia toma el máximo independiente por campo', () => {
      fixture.detectChanges();

      metrics.report(Symbol('otro'), {
        height: 500,
        paddingTop: 60,
        paddingLeft: 30,
      });
      fixture.detectChanges();

      const stage = getStage();
      expect(stage.style.getPropertyValue('--btn-height')).toBe('500px');
      expect(stage.style.getPropertyValue('--btn-padding-top')).toBe('73px');
      expect(stage.style.getPropertyValue('--btn-padding-left')).toBe('52px');
    });
  });

  describe('ciclo de vida', () => {
    it('ngAfterViewInit registra la instancia con un id único en el servicio', () => {
      const spy = jest.spyOn(metrics, 'register');
      const otherFixture = TestBed.createComponent(ButtonFanMentosComponent);
      const otherComponent = otherFixture.componentInstance;
      otherFixture.detectChanges();

      expect(spy).toHaveBeenCalledWith(otherComponent['id']);
      expect(otherComponent['id']).not.toBe(component['id']);
    });

    it('ngOnDestroy desconecta el ResizeObserver, hace unregister y desuscribe', () => {
      fixture.detectChanges();

      const unregisterSpy = jest.spyOn(metrics, 'unregister');
      const disconnectSpy = jest.fn();
      (component['resizeObserver'] as unknown as { disconnect: () => void }).disconnect =
        disconnectSpy;

      component.ngOnDestroy();

      expect(disconnectSpy).toHaveBeenCalledTimes(1);
      expect(unregisterSpy).toHaveBeenCalledWith(component['id']);

      const heightBefore = getStage().style.getPropertyValue('--btn-height');
      metrics.report(Symbol('otro'), {
        height: 999,
        paddingTop: 999,
        paddingLeft: 999,
      });
      fixture.detectChanges();
      const heightAfter = getStage().style.getPropertyValue('--btn-height');
      expect(heightAfter).toBe(heightBefore);
    });
  });

  describe('mouse tracking (HostListener document:mousemove)', () => {
    beforeEach(() => {
      component.icon = 'cursor';
      component.iconColor = '#fff';
      jest
        .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
        .mockReturnValue(rectOf({ left: 50, top: 50, width: 100, height: 100 }));
      fixture.detectChanges();
    });

    it('actualiza --mx, --my, --mr, --ms en el icono', () => {
      const ev = new MouseEvent('mousemove', { clientX: 200, clientY: 50 });
      document.dispatchEvent(ev);
      fixture.detectChanges();

      const icon = getIcon()!;
      expect(icon.style.getPropertyValue('--mx')).not.toBe('');
      expect(icon.style.getPropertyValue('--my')).not.toBe('');
      expect(icon.style.getPropertyValue('--mr')).not.toBe('');
      expect(icon.style.getPropertyValue('--ms')).not.toBe('');
    });

    it('--ms escala entre 1.0 y 1.15 según la proximidad', () => {
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: 10000, clientY: 10000 }));
      fixture.detectChanges();
      const msFar = parseFloat(getIcon()!.style.getPropertyValue('--ms'));

      document.dispatchEvent(new MouseEvent('mousemove', { clientX: 100, clientY: 100 }));
      fixture.detectChanges();
      const msClose = parseFloat(getIcon()!.style.getPropertyValue('--ms'));

      expect(msFar).toBeGreaterThanOrEqual(1);
      expect(msFar).toBeLessThanOrEqual(1.15);
      expect(msClose).toBeGreaterThanOrEqual(1);
      expect(msClose).toBeLessThanOrEqual(1.15);
      expect(msClose).toBeGreaterThanOrEqual(msFar);
    });

    it('--mr está clampado entre -20deg y 20deg', () => {
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: 100000, clientY: -100000 }));
      fixture.detectChanges();
      const mr = parseFloat(getIcon()!.style.getPropertyValue('--mr'));
      expect(mr).toBeGreaterThanOrEqual(-20);
      expect(mr).toBeLessThanOrEqual(20);
    });

    it('si icon="none" no peta al recibir mousemove', () => {
      const noIconFixture = TestBed.createComponent(ButtonFanMentosComponent);
      noIconFixture.componentInstance.icon = 'none';
      noIconFixture.detectChanges();

      expect(() => {
        document.dispatchEvent(new MouseEvent('mousemove', { clientX: 0, clientY: 0 }));
        noIconFixture.detectChanges();
      }).not.toThrow();
    });
  });
});
