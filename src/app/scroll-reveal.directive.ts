import { afterNextRender, DestroyRef, Directive, ElementRef, inject, Injectable, input, signal } from '@angular/core';

/** One observer for the page; completed targets are immediately released. */
@Injectable({ providedIn: 'root' })
export class ScrollRevealObserver {
  private readonly destroyRef = inject(DestroyRef);
  private readonly targets = new Map<Element, () => void>();
  private observer?: IntersectionObserver;
  private motion?: MediaQueryList;

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.observer?.disconnect();
      this.targets.clear();
      this.motion?.removeEventListener('change', this.onMotionChange);
    });
  }

  observe(element: HTMLElement, reveal: () => void): () => void {
    // Called after render: SSR, unsupported browsers and reduced motion stay visible.
    if (!('IntersectionObserver' in window)) return () => {};
    if (!this.motion) {
      this.motion = window.matchMedia('(prefers-reduced-motion: reduce)');
      this.motion.addEventListener('change', this.onMotionChange);
    }
    if (this.motion.matches) return () => {};

    this.observer ??= new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const revealTarget = this.targets.get(entry.target);
        this.targets.delete(entry.target);
        this.observer?.unobserve(entry.target);
        revealTarget?.();
      }
    }, { threshold: 0, rootMargin: '0px 0px 24px 0px' });

    this.targets.set(element, reveal);
    this.observer.observe(element);
    return () => {
      this.targets.delete(element);
      this.observer?.unobserve(element);
    };
  }

  private readonly onMotionChange = (): void => {
    if (!this.motion?.matches) return;
    this.observer?.disconnect();
    this.targets.clear();
  };
}

@Directive({
  selector: '[appReveal]',
  standalone: true,
  host: {
    class: 'scroll-reveal',
    '[class.is-revealing]': 'entering()',
    '[style.--reveal-delay]': 'revealDelay() + "ms"',
    '(animationend)': 'finish($event)',
    '(animationcancel)': 'finish($event)',
    '(focusin)': 'finish()'
  }
})
export class ScrollRevealDirective {
  readonly revealDelay = input(0);
  readonly entering = signal(false);
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly observer = inject(ScrollRevealObserver);
  private readonly destroyRef = inject(DestroyRef);
  private stop = () => {};
  private finished = false;

  constructor() {
    afterNextRender(() => {
      if (!this.finished) {
        this.stop = this.observer.observe(this.element.nativeElement, () => this.entering.set(true));
      }
    });
    this.destroyRef.onDestroy(() => this.stop());
  }

  finish(event?: AnimationEvent): void {
    // Ignore animations bubbling from children (including the existing Hero).
    if (event && event.target !== this.element.nativeElement) return;
    this.finished = true;
    this.entering.set(false);
    this.stop();
  }
}
