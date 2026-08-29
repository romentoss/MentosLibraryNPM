# button-fan-mentos

Angular 17 standalone button that opens like a fan on hover, leaving a shadow with an icon that follows the cursor.

## Install

```bash
npm install button-fan-mentos
```

Peer dependencies: `@angular/common` and `@angular/core` (^17.3.0).

## Usage

```ts
import { Component } from '@angular/core';
import { ButtonFanMentosComponent } from 'button-fan-mentos';

@Component({
  standalone: true,
  imports: [ButtonFanMentosComponent],
  template: `<button-fan-mentos text="Eliminar" color="#dc2626" icon="trash" iconColor="#f87171"></button-fan-mentos>`,
})
export class MyComponent {}
```

## Inputs

| Input            | Type                                      | Default     | Description                                                              |
| ---------------- | ----------------------------------------- | ----------- | ------------------------------------------------------------------------ |
| `text`           | `string`                                  | `'Button'`  | Texto del botón.                                                         |
| `color`          | `string`                                  | `'#2563eb'` | Color de fondo del botón.                                                |
| `icon`           | `'cursor' \| 'save' \| 'trash' \| 'none'` | `'none'`    | Icono que se ve en la sombra.                                            |
| `iconColor`      | `string`                                  | `'#ffffff'` | Color del trazo del icono. Tonos claros para que contraste con la sombra. |
| `rotationAngle`  | `number`                                  | `-45`       | Ángulo de apertura del abanico en grados. Negativo abre hacia arriba-izquierda. |
| `paddingMargin`  | `number`                                  | `16`        | Margen extra (px) sobre el padding calculado.                            |

## Cómo funciona

Cuando varias instancias se montan, se registran en `ButtonFanMetricsService` (singleton, `providedIn: 'root'`) que calcula y reparte el `paddingTop` / `paddingLeft` máximos para que los stages queden alineados al mismo nivel aunque los botones tengan anchos distintos.

Cada instancia mide su `<button>` con `getBoundingClientRect()` y aplica la fórmula de la rotación:

```
paddingTop  = max(0, ceil(W·sinθ - H·(1-cosθ))) + paddingMargin
paddingLeft = max(0, ceil(H·sinθ))               + paddingMargin
```

Un `ResizeObserver` recalcula al cambiar el tamaño. Un `HostListener('document:mousemove')` mueve y rota el icono hacia el cursor con CSS custom properties (`--mx`, `--my`, `--mr`, `--ms`).

## Demo local

```bash
git clone https://github.com/romentoss/MentosLibraryNPM.git
cd MentosLibraryNPM
npm install
npm start
```

Abre `http://localhost:4200`.

## Licencia

MIT. Ver [LICENSE](projects/button-fan-mentos/LICENSE).