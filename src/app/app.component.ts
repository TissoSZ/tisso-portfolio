import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

interface Project {
  index: string;
  name: string;
  kind: string;
  description: string;
  stack: string[];
  href?: string;
  accent: string;
  symbol: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  readonly menuOpen = signal(false);
  readonly year = new Date().getFullYear();
  readonly skills = ['JAVA', 'SPRING BOOT', 'ANGULAR', 'TYPESCRIPT', 'POSTGRESQL', 'HIBERNATE', 'SQL', 'REST APIs', 'GIT', 'DOCKER'];
  readonly projects: Project[] = [
    {
      index: '01', name: 'Portfólio pessoal', kind: 'EM CONSTRUÇÃO',
      description: 'Uma experiência digital autoral para apresentar minha trajetória, projetos e evolução como desenvolvedor.',
      stack: ['Angular', 'TypeScript', 'CSS'], accent: 'lime', symbol: 'ME.'
    },
    {
      index: '02', name: 'Java RMI · urna acadêmica', kind: 'ESTUDO / JAVA',
      description: 'Simulação acadêmica de comunicação distribuída usando interfaces remotas, serialização e cliente-servidor.',
      stack: ['Java', 'RMI', 'Cliente/Servidor'],
      accent: 'violet', symbol: '{ }'
    }
  ];
  closeMenu(): void { this.menuOpen.set(false); }
}
