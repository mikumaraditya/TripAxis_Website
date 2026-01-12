import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingModalComponent } from '../booking-modal/booking-modal'; 
import { AuthService } from '../auth.service'; 
import { Router } from '@angular/router'; 

@Component({
  selector: 'app-packages-section',
  standalone: true,
  imports: [CommonModule, BookingModalComponent], 
  templateUrl: './packages.html',
  styleUrl: './packages.css'
})
export class PackagesSection {
  isModalOpen = false;
  selectedPackage: any = null;
  
  packages = [
    {
      title: 'Tropical Paradise Getaway',
      duration: '7 Days / 6 Nights',
      durationDays: 7, 
      price: 21999,
      imageUrl: 'https://images.pexels.com/photos/2213443/pexels-photo-2213443.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      features: ['All-inclusive Resort', 'Guided Snorkeling Tour', 'Private Beach Access', 'Airport Transfers']
    },
    {
      title: 'Mountain Adventure Trek',
      duration: '5 Days / 4 Nights',
      durationDays: 5, 
      price: 16999, 
      imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format=fit=crop',
      features: ['Expert Mountain Guide', 'All Camping Gear', 'Daily Meals Included', 'National Park Fees']
    },
    {
      title: 'Historic City Explorer',
      duration: '4 Days / 3 Nights',
      durationDays: 4, 
      price: 14999, 
      imageUrl: 'https://images.unsplash.com/photo-1513407030348-c983a97b98d8?q=80&w=2072&auto=format&fit=crop',
      features: ['4-Star Hotel Stay', 'Guided City Tours', 'Museum Entry Tickets', 'Daily Breakfast']
    },
     {
      title: 'Luxury Safari Adventure',
      duration: '6 Days / 5 Nights',
      durationDays: 6, 
      price: 19999, 
      imageUrl: 'https://images.unsplash.com/photo-1556960146-ba4d5f5fa2f9?q=80&w=1932&auto=format&fit=crop&ixlib-rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%D%D',
      features: ['Luxury Lodge Stay', 'Guided Game Drives', 'Bush Dinners', 'Park Entrance Fees']
    },
    {
      title: 'Cultural Capitals Tour',
      duration: '10 Days / 9 Nights',
      durationDays: 10, 
      price: 24999, 
      imageUrl: 'https://cdn.pixabay.com/photo/2023/04/08/18/02/eternal-city-7909907_1280.jpg',
      features: ['Boutique Hotels', 'Local Food Tours', 'Historical Site Visits', 'Private Transport']
    },
    {
      title: 'Serenity Retreat',
      duration: '3 Days / 2 Nights',
      durationDays: 3, 
      price: 9999, 
      imageUrl: 'https://cdn.pixabay.com/photo/2016/02/03/22/10/women-1178187_1280.jpg',
      features: ['5-Star Resort', 'Daily Spa Treatments', 'Yoga & Meditation', 'Healthy Gourmet Meals']
    }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  openBookingModal(pkg: any) {
    if (this.authService.isLoggedIn()) {
      this.selectedPackage = pkg;
      this.isModalOpen = true;
    } else {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/#packages' } });
    }
  }

  closeBookingModal() {
    this.isModalOpen = false;
    this.selectedPackage = null;
  }
}