import { Routes } from '@angular/router';
import { HomeComponent } from './home.component';
import { DestinationsPageComponent } from './destinations-page/destinations-page';
import { LoginComponent } from './login/login';
import { SignupComponent } from './signup/signup';
import { BookingSuccessComponent } from './booking-success/booking-success';
import { ContactPageComponent } from './contact-page/contact-page'; 

export const routes: Routes = [
  { path: '', component: HomeComponent, pathMatch: 'full' },
  { path: 'destinations', component: DestinationsPageComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'booking-success/:id', component: BookingSuccessComponent },
  { path: 'contact', component: ContactPageComponent }, 
  
  { path: '**', redirectTo: '' }
];