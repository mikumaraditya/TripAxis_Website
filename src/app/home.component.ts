import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HeroSection } from './hero-section/hero-section';
import { DealsSection } from './deals-section/deals-section';
import { Destinations } from './destinations/destinations';
import { PackagesSection } from './packages/packages';
import { AboutUsSection } from './about-us-section/about-us-section';
import { HelpSection } from './help-section/help-section';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    HeroSection,
    DealsSection,
    Destinations,
    PackagesSection,
    AboutUsSection,
    HelpSection,
  ],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit, OnDestroy {
  private fragmentSubscription: Subscription | undefined;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.fragmentSubscription = this.route.fragment.subscribe(fragment => {
      if (fragment) {
        setTimeout(() => this.scrollToSection(fragment), 100);
      }
    });
  }

  ngOnDestroy() {
    if (this.fragmentSubscription) {
      this.fragmentSubscription.unsubscribe();
    }
  }

  private scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}