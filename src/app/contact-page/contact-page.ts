// In src/app/contact-page/contact-page.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { NotificationService } from '../notification.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-contact-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact-page.html',
  styleUrl: './contact-page.css'
})
export class ContactPageComponent {
  contactForm = new FormGroup({
    fullName: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    subject: new FormControl('', [Validators.required]),
    message: new FormControl('', [Validators.required, Validators.minLength(10)])
  });

  constructor(
    private notificationService: NotificationService,
    private router: Router
  ) {}

  onSubmit() {
    if (this.contactForm.valid) {
      console.log('Form Submitted:', this.contactForm.value);
      this.notificationService.show('Message sent successfully! We will get back to you soon.', 'success', 4000);
      this.contactForm.reset();
      setTimeout(() => {
        this.router.navigate(['/']);
      }, 1500);

    } else {
      this.contactForm.markAllAsTouched();
    }
  }
}