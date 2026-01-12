import { Injectable, signal, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http'; 
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common'; 
import { tap } from 'rxjs/operators'; 
import { Observable } from 'rxjs'; 

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  isLoggedIn = signal(false);
  
  private authToken: string | null = null;
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    private router: Router,   
    @Inject(PLATFORM_ID) private platformId: Object 
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.loadToken(); 
  }

  private loadToken() {
    if (this.isBrowser) {
      const token = localStorage.getItem('token');
      if (token) {
        this.authToken = token;
        this.isLoggedIn.set(true);
      }
    }
  }

  register(fullName: string, email: string, password: string): Observable<any> {
    return this.http.post('/api/auth/register', { fullName, email, password });
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>('/api/auth/login', { email, password })
      .pipe(
        tap(response => {
          if (response.token && this.isBrowser) {
            this.authToken = response.token;
            localStorage.setItem('token', response.token);
            this.isLoggedIn.set(true);
          }
        })
      );
  }

  logout() {
    if (this.isBrowser) {
      localStorage.removeItem('token');
    }
    this.authToken = null;
    this.isLoggedIn.set(false);
    this.router.navigate(['/']); 
  }

  getToken(): string | null {
    return this.authToken;
  }

  // +++ NEW RAZORPAY METHOD +++
  createOrder(item: any, formValue: any): Observable<any> {
    // This will be picked up by the AuthInterceptor to add the token
    return this.http.post('/api/payment/create-order', { item, formValue });
  }

  // +++ NEW RAZORPAY METHOD +++
  verifyPayment(payload: any): Observable<any> {
    // This will be picked up by the AuthInterceptor to add the token
    return this.http.post('/api/payment/verify-payment', payload);
  }
  
  // +++ NEW METHOD TO GET BOOKING DETAILS +++
  getBookingDetails(bookingId: string): Observable<any> {
    return this.http.get(`/api/payment/booking/${bookingId}`);
  }
}