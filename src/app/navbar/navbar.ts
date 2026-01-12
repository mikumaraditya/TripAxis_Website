import { Component, HostListener, ElementRef, Renderer2, AfterViewInit, signal, WritableSignal, ViewChild } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class Navbar implements AfterViewInit {
  isMenuOpen = false;
  isScrolled = false;
  activeSection = 'home';
  isHomePage = true;
  
  isLoggedIn: WritableSignal<boolean>; 
  
  isProfileMenuOpen = false;
  @ViewChild('profileMenu') profileMenuRef?: ElementRef;

  private sectionOffsets: Map<string, number> = new Map();

  constructor(
    private el: ElementRef, 
    private renderer: Renderer2, 
    private router: Router,
    private authService: AuthService
  ) {
    this.isLoggedIn = this.authService.isLoggedIn; 

    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      
      const url = event.urlAfterRedirects;
      this.isHomePage = url.startsWith('/#') || url === '/';
      
      if (this.isHomePage) {
        this.isScrolled = (typeof window !== 'undefined') ? window.scrollY > 10 : false;
        setTimeout(() => this.calculateSectionOffsets(), 100);
      } else {
        this.activeSection = '';
      }
    });
  }
  
  ngAfterViewInit(): void {
    if (this.isHomePage) {
        this.calculateSectionOffsets();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (this.isProfileMenuOpen && !this.profileMenuRef?.nativeElement.contains(event.target)) {
      this.isProfileMenuOpen = false;
    }
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    if (typeof window === 'undefined') return;

    this.isScrolled = window.scrollY > 10;

    if (this.isHomePage) {
      const scrollPosition = window.scrollY + window.innerHeight / 2;
      let currentSection = 'home';

      this.sectionOffsets.forEach((offset: number, sectionId: string) => {
        if (scrollPosition >= offset) {
          currentSection = sectionId;
        }
      });

      this.activeSection = currentSection;
    }
  }

  @HostListener('window:resize', [])
  onResize(): void {
    if (this.isHomePage) {
      this.calculateSectionOffsets();
    }
  }

  private calculateSectionOffsets(): void {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    this.sectionOffsets.clear();
    const sections: NodeListOf<HTMLElement> = document.querySelectorAll('section[id]');
    sections.forEach((section: HTMLElement) => {
      this.sectionOffsets.set(section.id, section.offsetTop);
    });
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
    this.isProfileMenuOpen = false; 
  }

  toggleProfileMenu(): void {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
    this.isMenuOpen = false; 
  }

  closeMenu(): void {
    this.isMenuOpen = false;
    this.isProfileMenuOpen = false;
  }

  scrollTo(sectionId: string): void {
    this.closeMenu();
    if (this.isHomePage) {
        const element: HTMLElement | null = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    } else {
        this.router.navigate(['/'], { fragment: sectionId });
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']); 
    this.closeMenu(); 
  }
}