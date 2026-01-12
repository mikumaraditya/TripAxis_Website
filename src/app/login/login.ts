import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { NotificationService } from '../notification.service'; 

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent implements OnInit {
  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required])
  });

  // --- We no longer need these ---
  // loginSuccess = false;
  // loginError: string | null = null;
  // ---
  
  private returnUrl: string = '/destinations';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private notificationService: NotificationService 
  ) {}

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/destinations';
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const email = this.loginForm.value.email!;
      const password = this.loginForm.value.password!;

      this.authService.login(email, password).subscribe({
        next: (response: any) => {
          this.notificationService.show('Login successful! Redirecting...', 'success');
          setTimeout(() => {
            this.router.navigateByUrl(this.returnUrl);
          }, 1000); 
        },
        error: (err: any) => {
          const message = err.error?.message || 'Login failed. Please try again.';
          this.notificationService.show(message, 'error');
          console.error('Login error:', err);
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}