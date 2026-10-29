import {
  afterNextRender, ChangeDetectionStrategy, Component, DestroyRef, ElementRef,
  inject, input, NgZone, Renderer2, RendererStyleFlags2, viewChild
} from '@angular/core';

export interface Project {
  index: string;
  name: string;
  kind: string;
  description: string;
  stack: readonly string[];
  href: string;
  alternate?: boolean;
  symbol: string;
}

@Component({
  selector: 'app-project-card',
  standalone: true,
  templateUrl: './project-card.component.html',
  styleUrl: './project-card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectCardComponent {
  readonly project = input.required<Project>();
  private readonly surface = viewChild.required<ElementRef<HTMLElement>>('surface');
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly renderer = inject(Renderer2);
  private readonly zone = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    afterNextRender(() => {
      const element = this.surface().nativeElement;
      const capability = window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
      let frame: number | null = null;
      let lastTime = 0;
      let pendingPointer = false;
      let clientX = 0;
      let clientY = 0;
      let current = { x: 0, y: 0 };
      let target = { x: 0, y: 0 };

      const style = (name: string, value: string) =>
        this.renderer.setStyle(element, name, value, RendererStyleFlags2.DashCase);
      const stopFrame = () => {
        if (frame !== null) cancelAnimationFrame(frame);
        frame = null;
        lastTime = 0;
      };
      const reset = () => {
        stopFrame();
        pendingPointer = false;
        current = target = { x: 0, y: 0 };
        style('--spot-active', '0');
        style('--tilt-x', '0deg');
        style('--tilt-y', '0deg');
      };
      const animate = (time: number) => {
        frame = null;
        if (!capability.matches) { reset(); return; }
        if (pendingPointer) {
          // Read the stable component host, not the tilted/revealed card surface.
          const bounds = this.host.nativeElement.getBoundingClientRect();
          if (!bounds.width || !bounds.height) { reset(); return; }
          target = {
            x: Math.max(-1, Math.min(1, (clientX - bounds.left) / bounds.width * 2 - 1)),
            y: Math.max(-1, Math.min(1, (clientY - bounds.top) / bounds.height * 2 - 1))
          };
          pendingPointer = false;
        }
        const elapsed = lastTime ? Math.min(time - lastTime, 64) : 16;
        lastTime = time;
        const easing = 1 - Math.exp(-elapsed / 80);
        current = {
          x: current.x + (target.x - current.x) * easing,
          y: current.y + (target.y - current.y) * easing
        };
        const settled = Math.max(Math.abs(target.x - current.x), Math.abs(target.y - current.y)) < 0.001;
        if (settled) current = { ...target };
        style('--spot-x', `${(current.x + 1) * 50}%`);
        style('--spot-y', `${(current.y + 1) * 50}%`);
        style('--tilt-x', `${-current.y * 3}deg`);
        style('--tilt-y', `${current.x * 3}deg`);
        style('--spot-active', '1');
        if (!settled) frame = requestAnimationFrame(animate);
      };
      const move = (event: PointerEvent) => {
        if (!capability.matches || event.pointerType === 'touch') return;
        clientX = event.clientX;
        clientY = event.clientY;
        pendingPointer = true;
        if (frame === null) {
          lastTime = 0;
          frame = requestAnimationFrame(animate);
        }
      };

      // No Angular signal updates or change detection on cursor movement.
      const unlisten = this.zone.runOutsideAngular(() => {
        capability.addEventListener('change', reset);
        return [
          this.renderer.listen(element, 'pointermove', move),
          this.renderer.listen(element, 'pointerleave', reset),
          this.renderer.listen(element, 'pointercancel', reset)
        ];
      });
      this.destroyRef.onDestroy(() => {
        stopFrame();
        unlisten.forEach(remove => remove());
        capability.removeEventListener('change', reset);
      });
    });
  }
}
