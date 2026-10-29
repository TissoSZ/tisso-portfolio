import { afterNextRender, ChangeDetectionStrategy, Component, DestroyRef, ElementRef, inject, NgZone, signal, viewChild } from '@angular/core';
import { ScrollRevealDirective } from './scroll-reveal.directive';
import { ProjectCardComponent, type Project } from './project-card.component';
import { TechnologyExplorerComponent } from './technology-explorer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ScrollRevealDirective, ProjectCardComponent, TechnologyExplorerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  readonly hero = viewChild.required<ElementRef<HTMLElement>>('hero');
  readonly heroMotion = signal({ x: 0, y: 0, light: 0 });
  private readonly zone = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);
  private target = { x: 0, y: 0, light: 0 };
  private motionAllowed = false;
  private heroVisible = true;
  private frame: number | null = null;
  private lastFrame = 0;

  constructor() {
    afterNextRender(() => {
      const pointer = window.matchMedia('(hover: hover) and (pointer: fine)');
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
      const updatePreference = () => {
        this.motionAllowed = pointer.matches && !reducedMotion.matches;
        this.resetHeroMotion();
      };
      updatePreference();
      pointer.addEventListener('change', updatePreference);
      reducedMotion.addEventListener('change', updatePreference);

      const observer = typeof IntersectionObserver === 'undefined' ? undefined : new IntersectionObserver(([entry]) => {
        this.heroVisible = entry.isIntersecting;
        if (!this.heroVisible) this.resetHeroMotion();
      });
      observer?.observe(this.hero().nativeElement);

      this.destroyRef.onDestroy(() => {
        this.stopHeroFrame();
        observer?.disconnect();
        pointer.removeEventListener('change', updatePreference);
        reducedMotion.removeEventListener('change', updatePreference);
      });
    });
  }

  moveHero(event: PointerEvent): void {
    if (!this.motionAllowed || !this.heroVisible || event.pointerType === 'touch') return;
    const bounds = (event.currentTarget as HTMLElement).getBoundingClientRect();
    this.target = {
      x: Math.max(-1, Math.min(1, (event.clientX - bounds.left) / bounds.width * 2 - 1)),
      y: Math.max(-1, Math.min(1, (event.clientY - bounds.top) / bounds.height * 2 - 1)),
      light: 1
    };
    this.startHeroFrame();
  }

  leaveHero(): void {
    this.target = { x: 0, y: 0, light: 0 };
    if (this.motionAllowed && this.heroVisible) this.startHeroFrame();
  }

  private startHeroFrame(): void {
    if (this.frame !== null) return;
    this.lastFrame = 0;
    this.zone.runOutsideAngular(() => {
      this.frame = requestAnimationFrame(this.animateHero);
    });
  }

  // Time-based easing keeps the same feel across different display refresh rates.
  private readonly animateHero = (time: number): void => {
    const elapsed = this.lastFrame ? Math.min(time - this.lastFrame, 64) : 16;
    this.lastFrame = time;
    const easing = 1 - Math.exp(-elapsed / 140);
    const current = this.heroMotion();
    const next = {
      x: current.x + (this.target.x - current.x) * easing,
      y: current.y + (this.target.y - current.y) * easing,
      light: current.light + (this.target.light - current.light) * easing
    };
    const settled = Math.max(
      Math.abs(next.x - this.target.x), Math.abs(next.y - this.target.y),
      Math.abs(next.light - this.target.light)
    ) < 0.001;
    this.heroMotion.set(settled ? { ...this.target } : next);
    this.frame = settled ? null : requestAnimationFrame(this.animateHero);
  };

  private stopHeroFrame(): void {
    if (this.frame !== null) cancelAnimationFrame(this.frame);
    this.frame = null;
    this.lastFrame = 0;
  }

  private resetHeroMotion(): void {
    this.stopHeroFrame();
    this.target = { x: 0, y: 0, light: 0 };
    this.heroMotion.set({ ...this.target });
  }

  readonly menuOpen = signal(false);
  readonly marqueePaused = signal(false);
  readonly year = new Date().getFullYear();
  readonly projects: Project[] = [
    {
      index: '01', name: 'Portfólio pessoal', kind: 'PROJETO PESSOAL',
      description: 'Portfólio desenvolvido com Angular, TypeScript e CSS, com apresentação profissional, projetos e animações de interface.',
      stack: ['Angular', 'TypeScript', 'CSS'], symbol: 'ME.',
      href: 'https://github.com/TissoSZ/tisso-portfolio'
    },
    {
      index: '02', name: 'ControleValidade', kind: 'ACADÊMICO / ANDROID',
      description: 'Aplicativo acadêmico Android em Java para praticar formulários e validações de dados de produtos, com categoria, armazenamento e seleção de data de validade.',
      stack: ['Java', 'Android', 'XML'], alternate: true, symbol: 'CV.',
      href: 'https://github.com/TissoSZ/ControleValidade'
    }
  ];
  closeMenu(): void { this.menuOpen.set(false); }

  closeMenuOnEscape(event: Event, button: HTMLButtonElement): void {
    if (!this.menuOpen()) return;
    event.preventDefault();
    this.closeMenu();
    button.focus();
  }
}
