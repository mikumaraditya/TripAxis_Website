import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

declare var Razorpay: any;

@Component({
  selector: 'app-booking-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule], 
  templateUrl: './booking-modal.html',
  styleUrl: './booking-modal.css'
})
export class BookingModalComponent implements OnInit, OnChanges {
  @Input() isOpen = false;
  @Input() item: any = null;
  @Output() closeModal = new EventEmitter<void>();

  bookingForm: FormGroup;
  displayItem: { title: string, price: number, durationDays?: number } = { title: '', price: 0 };
  minDate: string;
  isProcessing = false; 

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.minDate = new Date().toISOString().split('T')[0];
    
    this.bookingForm = new FormGroup({
      fullName: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      phoneNumber: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{10}$')]),
      travelDate: new FormControl('', [Validators.required, this.dateValidator.bind(this)]),
      endDate: new FormControl({ value: '', disabled: true }), 
      travelers: new FormControl(1, [Validators.required, Validators.min(1)]),
    });
  }

  ngOnInit() {
    this.updateDisplayItem();
    this.bookingForm.get('travelDate')?.valueChanges.subscribe(value => {
      this.calculateEndDate(value);
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['item'] && this.item) {
      this.updateDisplayItem();
      this.calculateEndDate(this.bookingForm.get('travelDate')?.value);
    }
  }

  private updateDisplayItem() {
    if (this.item) {
      this.displayItem.title = this.item.name || this.item.title;
      this.displayItem.price = this.item.price;
      this.displayItem.durationDays = this.item.durationDays || this.getDurationFromPackage(this.item.duration);
    }
  }
 
  private getDurationFromPackage(durationString: string): number | undefined {
    if (!durationString) return undefined;
    const match = durationString.match(/^(\d+)\s+Days/);
    return match ? parseInt(match[1], 10) : undefined;
  }


  calculateEndDate(startDateValue: string | null) {
    const duration = this.displayItem.durationDays;
    if (startDateValue && duration) {
      try {
        const startDate = new Date(startDateValue);
        startDate.setDate(startDate.getDate() + (duration - 1));
        const formattedEndDate = startDate.toISOString().split('T')[0];
        this.bookingForm.get('endDate')?.setValue(formattedEndDate);

      } catch (e) {
        this.bookingForm.get('endDate')?.setValue('');
      }
    } else {
      this.bookingForm.get('endDate')?.setValue('');
    }
  }

  close() {
    this.closeModal.emit();
    this.bookingForm.reset({ travelers: 1 });
    this.isProcessing = false; 
  }

  onSubmit() {
    if (this.bookingForm.invalid || this.isProcessing) {
      this.bookingForm.markAllAsTouched();
      return;
    }
    
    this.isProcessing = true; 
    
    const formValue = this.bookingForm.getRawValue();

    this.authService.createOrder(this.item, formValue).subscribe({
      next: (order) => {
        console.log('Order created:', order);
        
        const options = {
          key: order.key_id || 'rzp_test_RZkFQFg5TFUWQ4', 
          amount: order.amount,
          currency: "INR",
          name: "TripAxis",
          description: `Booking for ${this.displayItem.title}`,
          order_id: order.id,
          
          handler: (response: any) => {
            console.log('Razorpay response:', response);
            
            const verificationPayload = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              item: this.item,
              formValue: formValue 
            };

            this.authService.verifyPayment(verificationPayload).subscribe({
              next: (verificationResponse) => {
                console.log('Payment verification successful:', verificationResponse);
                this.close(); 
                this.router.navigate(['/booking-success', verificationResponse.bookingId]);
              },
              error: (err) => {
                console.error('Payment verification failed:', err);
                this.isProcessing = false; 
                alert(`Payment verification failed: ${err.error?.message || 'Please try again.'}`);
              }
            });
          },
          prefill: {
            name: formValue.fullName,
            email: formValue.email,
            contact: formValue.phoneNumber 
          },
          theme: {
            color: "#0b7592"
          }
        };

        const rzp = new Razorpay(options);
        rzp.open();

        
        rzp.on('payment.failed', (response: any) => {
          console.log('Payment failed:', response);
          this.isProcessing = false; 
          alert(`Payment failed: ${response.error.description}`);
        });
        
      },
      error: (err) => {
        console.error('Create order failed:', err);
        this.isProcessing = false;
        alert(`Could not create order: ${err.error?.message || 'Please try again.'}`);
      }
    });
  }

  onModalContentClick(event: Event) {
    event.stopPropagation();
  }

 
  private dateValidator(control: any) {
    if (!control.value) {
      return null;
    }
    const selectedDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      return { pastDate: true };
    }
    return null;
  }
}