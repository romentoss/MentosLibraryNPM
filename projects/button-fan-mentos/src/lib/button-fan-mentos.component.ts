import {
  Component,
  Input,
  HostListener,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonFanMetricsService } from './button-fan-metrics.service';

export type ButtonFanMentosIcon = 'cursor' | 'save' | 'trash' | 'none';

@Component({
  selector: 'button-fan-mentos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button-fan-mentos.component.html',
  styleUrls: ['./button-fan-mentos.component.css'],
})
export class ButtonFanMentosComponent implements AfterViewInit, OnDestroy {
  /** Texto del botón. */
  @Input() text: string = 'Button';

  /** Color de fondo del botón. */
  @Input() color: string = '#2563eb';

  /** Icono que se ve en la sombra. 'none' para no mostrar icono. */
  @Input() icon: ButtonFanMentosIcon = 'none';

  /** Color del trazo del icono. Tonos claros para que contraste con la sombra. */
  @Input() iconColor: string = '#ffffff';

  /** Ángulo de apertura del abanico en grados (negativo abre hacia arriba-izquierda). */
  @Input() rotationAngle: number = -45;

  /** Margen extra (px) añadido al padding calculado para dejar aire. */
  @Input() paddingMargin: number = 16;

  @ViewChild('btn', { static: true }) btnRef!: ElementRef<HTMLElement>;

  private id = Symbol('ButtonFanMentosInstance');
  private resizeObserver?: ResizeObserver;
  private unsubscribeMetrics?: () => void;

  constructor(
    private host: ElementRef<HTMLElement>,
    private metricsService: ButtonFanMetricsService,
  ) {}

  ngAfterViewInit(): void {
    this.metricsService.register(this.id);
    this.calculateAndReport();
    this.resizeObserver = new ResizeObserver(() => this.calculateAndReport());
    this.resizeObserver.observe(this.btnRef.nativeElement);
    this.unsubscribeMetrics = this.metricsService.subscribe(() => this.applySharedMetrics());
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    this.metricsService.unregister(this.id);
    this.unsubscribeMetrics?.();
  }

  /**
   * Mide el botón, calcula el padding necesario para la rotación y
   * lo reporta al servicio compartido. El servicio reparte el máximo
   * a todas las instancias para que queden alineadas.
   */
  private calculateAndReport(): void {
    const btn = this.btnRef.nativeElement;
    const rect = btn.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;

    const angle = (Math.abs(this.rotationAngle) * Math.PI) / 180;
    const sin = Math.sin(angle);
    const cos = Math.cos(angle);

    const paddingTop = Math.max(0, Math.ceil(w * sin - h * (1 - cos))) + this.paddingMargin;
    const paddingLeft = Math.max(0, Math.ceil(h * sin)) + this.paddingMargin;

    this.metricsService.report(this.id, { height: h, paddingTop, paddingLeft });
  }

  /** Aplica las métricas compartidas (el máximo de todas las instancias). */
  private applySharedMetrics(): void {
    const m = this.metricsService.getMax();
    const stage = this.host.nativeElement.querySelector('.stage') as HTMLElement | null;
    if (!stage) return;
    stage.style.setProperty('--btn-height', `${m.height}px`);
    stage.style.setProperty('--btn-padding-top', `${m.paddingTop}px`);
    stage.style.setProperty('--btn-padding-left', `${m.paddingLeft}px`);
  }

  /**
   * Seguimiento del ratón: actualiza las custom properties del icono
   * para que se desplace, gire y escale hacia el cursor.
   */
  @HostListener('document:mousemove', ['$event'])
  onMouseMove(e: MouseEvent): void {
    const icon = this.host.nativeElement.querySelector('.icon') as HTMLElement | null;
    if (!icon) return;

    const r = icon.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.hypot(dx, dy);
    const maxDist = 14;
    const clamped = Math.min(dist / 25, maxDist);
    const angle = Math.atan2(dy, dx);
    const mx = Math.cos(angle) * clamped;
    const my = Math.sin(angle) * clamped;
    const mr = Math.max(-20, Math.min(20, (angle * 180) / Math.PI * 0.2));
    const proximity = 1 - clamped / maxDist;
    const ms = 1 + proximity * 0.15;

    icon.style.setProperty('--mx', mx + 'px');
    icon.style.setProperty('--my', my + 'px');
    icon.style.setProperty('--mr', mr + 'deg');
    icon.style.setProperty('--ms', String(ms));
  }
}
