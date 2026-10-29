import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ScrollRevealDirective } from './scroll-reveal.directive';

interface Technology {
  id: string;
  name: string;
  description: string;
}

interface TechnologyGroup {
  title: string;
  items: readonly Technology[];
}

@Component({
  selector: 'app-technology-explorer',
  standalone: true,
  imports: [ScrollRevealDirective],
  templateUrl: './technology-explorer.component.html',
  styleUrl: './technology-explorer.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TechnologyExplorerComponent {
  readonly groups: readonly TechnologyGroup[] = [
    {
      title: 'Experiência profissional',
      items: [
        { id: 'java', name: 'Java', description: 'Base da minha atuação na Supera Sistemas, no desenvolvimento e manutenção de aplicações corporativas.' },
        { id: 'hibernate', name: 'Hibernate', description: 'Utilizado na persistência e no mapeamento de dados das aplicações Java com as quais trabalho.' },
        { id: 'postgresql', name: 'PostgreSQL', description: 'Banco de dados utilizado nos sistemas corporativos com os quais trabalho, em conjunto com Java, Hibernate e SQL.' },
        { id: 'sql', name: 'SQL', description: 'Utilizado em consultas e no trabalho com dados de sistemas corporativos.' },
        { id: 'jsf', name: 'JSF', description: 'Faz parte da minha experiência profissional com o desenvolvimento e a manutenção de aplicações web em Java.' },
        { id: 'primefaces', name: 'PrimeFaces', description: 'Utilizado com JSF no desenvolvimento de interfaces de aplicações corporativas na Supera Sistemas.' }
      ]
    },
    {
      title: 'Novo sistema da empresa',
      items: [
        { id: 'spring-boot', name: 'Spring Boot', description: 'Utilizado no backend do novo sistema da empresa, em cujo desenvolvimento participo.' },
        { id: 'angular', name: 'Angular', description: 'Utilizado no frontend do novo sistema da empresa e na construção deste portfólio.' }
      ]
    },
    {
      title: 'Ferramentas e conhecimentos adicionais',
      items: [
        { id: 'typescript', name: 'TypeScript', description: 'Utilizado neste portfólio e no desenvolvimento frontend com Angular, com tipagem para organizar a lógica da interface.' },
        { id: 'git', name: 'Git', description: 'Utilizado para versionar o código deste portfólio e acompanhar as alterações ao longo do desenvolvimento.' },
        { id: 'html', name: 'HTML', description: 'Utilizado na estrutura das páginas deste portfólio, com elementos semânticos para navegação e conteúdo.' },
        { id: 'css', name: 'CSS', description: 'Utilizado no layout, na responsividade e nos efeitos visuais deste portfólio, incluindo a esfera e as animações.' },
        { id: 'rest', name: 'APIs REST', description: 'Conhecimento relacionado ao meu foco em backend com Java e Spring Boot, incluindo comunicação entre aplicações.' }
      ]
    }
  ];

  readonly selectedTechnology = signal<Technology & { context: string }>({
    ...this.groups[0].items[0], context: this.groups[0].title
  });

  selectTechnology(technology: Technology, context: string): void {
    if (this.selectedTechnology().id === technology.id) return;
    this.selectedTechnology.set({ ...technology, context });
  }
}
