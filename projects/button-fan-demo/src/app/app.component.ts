import { Component } from '@angular/core';
import { ButtonFanMentosComponent } from 'button-fan-angular';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ButtonFanMentosComponent],
  template: `
    <div class="demo">
      <button-fan-mentos
        text="Pasa por encima a ver q pasa"
        color="yellow"
        icon="cursor"
        iconColor="blue"
      ></button-fan-mentos>

      <button-fan-mentos
        text="Guardar"
        color="#16a34a"
        icon="save"
        iconColor="#4ade80"
      ></button-fan-mentos>

      <button-fan-mentos
        text="Eliminar"
        color="#dc2626"
        icon="trash"
        iconColor="#f87171"
      ></button-fan-mentos>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .demo {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 80px;
      background: #f3f4f6;
      font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
    }
  `],
})
export class AppComponent {}
