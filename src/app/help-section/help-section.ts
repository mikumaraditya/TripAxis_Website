import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-help-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './help-section.html',
  styleUrl: './help-section.css'
})
export class HelpSection {
  faqs = [
    {
      question: 'How do I book a travel package?',
      answer: 'Booking is easy! Simply browse our packages, select the one that suits you, and click the "Book Now" button. You will be guided through a secure payment process to confirm your reservation.'
    },
    {
      question: 'What is your cancellation policy?',
      answer: 'We offer a flexible cancellation policy. You can cancel up to 14 days before your trip for a full refund. Cancellations made within 14 days are subject to a partial fee. Please refer to our terms and conditions for full details.'
    },
    {
      question: 'Can I customize a travel package?',
      answer: 'Absolutely! We specialize in creating personalized experiences. Contact our support team with your requirements, and we will tailor a package that fits your needs and budget.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and direct bank transfers. All transactions are securely processed.'
    },
    {
      question: 'Do you offer travel insurance?',
      answer: 'While we do not sell travel insurance directly, we highly recommend it. We have partnered with trusted insurance providers and can guide you in choosing the best plan for your trip.'
    }
  ];
}
