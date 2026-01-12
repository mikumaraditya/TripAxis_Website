import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { BookingModalComponent } from '../booking-modal/booking-modal'; 
import { AuthService } from '../auth.service'; 
import { Router } from '@angular/router'; 

@Component({
  selector: 'app-destinations-page',
  standalone: true,
  imports: [CommonModule, FormsModule, BookingModalComponent], 
  templateUrl: './destinations-page.html',
  styleUrls: ['./destinations-page.css']
})
export class DestinationsPageComponent implements OnInit {
  destinations: any[] = [];
  filteredDestinations: any[] = [];
  isLoading = false;
  loadingError = false;
  searchTerm = '';
  sortBy = 'all';
  filterBy = 'all';
  
  isModalOpen = false;
  selectedDestination: any = null;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadDestinations();
  }

  loadDestinations() {
    this.isLoading = true;
    this.loadingError = false;
    
    this.http.get<any[]>('/assets/destination.json')
      .pipe(
        catchError(error => {
          console.error('Error loading destinations:', error);
          this.loadingError = true;
          return of([]);
        })
      )
      .subscribe(data => {
        this.destinations = data;
        this.filteredDestinations = [...this.destinations];
        this.isLoading = false;
      });
  }

  searchDestinations() {
    let results = [...this.destinations];
    
    if (this.searchTerm.trim()) {
      results = results.filter(dest =>
        dest.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        dest.country.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
    
    if (this.filterBy !== 'all') {
      results = results.filter(dest => dest.type.toLowerCase() === this.filterBy);
    }
    
    this.filteredDestinations = results;
    this.applySorting(); 
  }

  onSortBy(sortType: string) {
    this.sortBy = sortType;
    this.applySorting();
  }

  filterByType(filterType: string) {
    this.filterBy = filterType;
    this.searchDestinations(); 
  }

  private applySorting() {
    if (this.sortBy === 'all') {
       this.searchDestinations(); 
       return;
    } 
    
    if (this.sortBy === 'name') {
      this.filteredDestinations.sort((a: any, b: any) => a.name.localeCompare(b.name));
    } else if (this.sortBy === 'price') {
      this.filteredDestinations.sort((a: any, b: any) => a.price - b.price);
    } else if (this.sortBy === 'rating') {
      this.filteredDestinations.sort((a: any, b: any) => b.rating - a.rating);
    }
  }

  openBookingModal(dest: any) {
    if (this.authService.isLoggedIn()) {
      this.selectedDestination = dest;
      this.isModalOpen = true;
    } else {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
    }
  }

  closeBookingModal() {
    this.isModalOpen = false;
    this.selectedDestination = null;
  }
}