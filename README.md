# button-fan-mentos

> Angular 17 standalone button that opens like a fan on hover, leaving a shadow with an icon that follows the cursor.

[![npm version](https://img.shields.io/npm/v/button-fan-mentos.svg)](https://www.npmjs.com/package/button-fan-mentos)
[![MIT license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Angular](https://img.shields.io/badge/Angular-17-DD0031.svg)](https://angular.io/)

## Características

- **Standalone**: sin `NgModule`, listo para importar directamente en cualquier componente.
- **Personalizable**: color, icono, ángulo de apertura, padding y margen extra.
- **Auto‑alineación**: cuando hay varias instancias en pantalla, un servicio singleton reparte el `paddingTop` / `paddingLeft` para que los stages queden alineados aunque los botones tengan anchos distintos.
- **Icono que persigue al cursor**: CSS custom properties + `HostListener('document:mousemove')`.
- **Tree‑shakable**: `sideEffects: false` y campo `exports` bien definido.
- **Tipado estricto**: TypeScript `strict` + 31 tests con Jest.

## Instalación

```bash
npm install button-fan-mentos
```

Peer dependencies: `@angular/common` y `@angular/core` (`^17.3.0`).

## Uso básico

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

| Input           | Tipo                                      | Default     | Descripción                                                                |
| --------------- | ----------------------------------------- | ----------- | -------------------------------------------------------------------------- |
| `text`          | `string`                                  | `'Button'`  | Texto del botón.                                                           |
| `color`         | `string`                                  | `'#2563eb'` | Color de fondo del botón.                                                  |
| `icon`          | `'cursor' \| 'save' \| 'trash' \| 'none'` | `'none'`    | Icono que aparece en la sombra.                                            |
| `iconColor`     | `string`                                  | `'#ffffff'` | Color del trazo del icono. Tonos claros para que contraste con la sombra.   |
| `rotationAngle` | `number`                                  | `-45`       | Ángulo de apertura del abanico en grados. Negativo abre hacia arriba‑izquierda. |
| `paddingMargin` | `number`                                  | `16`        | Margen extra (px) sobre el padding calculado.                              |

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
