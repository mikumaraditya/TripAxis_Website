import { Component } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common'; 
import { BookingModalComponent } from '../booking-modal/booking-modal'; 
import { AuthService } from '../auth.service'; 
import { Router } from '@angular/router'; 

@Component({
  selector: 'app-destinations',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, BookingModalComponent], 
  templateUrl: './destinations.html',
  styleUrl: './destinations.css'
})
export class Destinations {
  isModalOpen = false;
  selectedDestination: any = null;

  destinations = [
    {
      name: 'Santorini',
      country: 'Greece',
      rating: '4.9',
      imageUrl: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?q=80&w=735&auto=format=fit=crop&ixlib-rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      description: 'Iconic blue-domed churches and stunning sunsets.',
      price: 19999,
      durationDays: 7 
    },
    {
      name: 'Kyoto',
      country: 'Japan',
      rating: '4.8',
      imageUrl: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?q=80&w=2070&auto=format=fit=crop',
      price: 22999,
      durationDays: 5 
    },
    {
      name: 'Bora Bora',
      country: 'French Polynesia',
      rating: '4.9',
      imageUrl: 'https://images.unsplash.com/photo-1652842183703-47c2f7bb8c3c?q=80&w=1332&auto=format=fit=crop&ixlib-rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      price: 16999,
      durationDays: 10 
    },
    {
      name: 'Rome',
      country: 'Italy',
      rating: '4.7',
      imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=1996&auto=format=fit=crop',
      price: 14999,
      durationDays: 6 
    },
    {
      name: 'Paris',
      country: 'France',
      rating: '4.8',
      imageUrl: 'https://images.unsplash.com/photo-1609971757431-439cf7b4141b?q=80&w=687&auto=format=fit=crop&ixlib-rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      price: 15999,
      durationDays: 6 
    },
    {
      name: 'Fulhadhoo Beach',
      country: 'Maldives',
      rating: '4.9',
      imageUrl: 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?q=80&w=1974&auto=format=fit=crop',
      price: 12999,
      durationDays: 8 
    }
  ];


  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  openBookingModal(dest: any) {
    if (this.authService.isLoggedIn()) {
      this.selectedDestination = dest;
      this.isModalOpen = true;
    } else {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/#destinations' } });
    }
  }

  closeBookingModal() {
    this.isModalOpen = false;
    this.selectedDestination = null;
  }
}