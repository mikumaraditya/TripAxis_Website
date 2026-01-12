import { Component, OnInit, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-hero-section',
  templateUrl: './hero-section.html',
  styleUrls: ['./hero-section.css'],
  imports: [FormsModule, CommonModule, RouterLink],
  standalone: true
})
export class HeroSection implements OnInit {
  searchQuery: string = '';
  placeholder: string = 'Where would you like to go?';
  isBrowser: boolean = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    if (this.isBrowser) {
      this.updatePlaceholder(window.innerWidth);
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    if (this.isBrowser) {
      this.updatePlaceholder(event.target.innerWidth);
    }
  }

  private updatePlaceholder(width: number) {
    this.placeholder = width <= 768 ? 'Find Destination' : 'Where would you like to go?';
  }

  onSearch() {
    if (this.searchQuery) {
      console.log('Searching for:', this.searchQuery);
    }
  }
}