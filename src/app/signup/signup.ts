import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { NotificationService } from '../notification.service'; 

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './signup.html',
  styleUrl: './signup.css'
})
export class SignupComponent {
  signupForm = new FormGroup({
    fullName: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(8)])
  });

  // --- We no longer need these ---
  // signupSuccess = false;
  // signupError: string | null = null; 
  // ---

  constructor(
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService 
  ) {}

  onSubmit() {
    if (this.signupForm.valid) {
      const fullName = this.signupForm.value.fullName!;
      const email = this.signupForm.value.email!;
      const password = this.signupForm.value.password!;

      this.authService.register(fullName, email, password).subscribe({
        next: (response: any) => {
          this.notificationService.show('Account created successfully! Redirecting...', 'success');
          setTimeout(() => {
            this.router.navigate(['/login']); 
          }, 1000); 
        },
        error: (err: any) => {
          const message = err.error?.message || 'Signup failed. Please try again.';
          this.notificationService.show(message, 'error');
          console.error('Signup error:', err);
        }
      });
    } else {
      this.signupForm.markAllAsTouched(); 
    }
  }
}