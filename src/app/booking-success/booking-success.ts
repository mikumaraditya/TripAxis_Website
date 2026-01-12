import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common'; 
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../auth.service'; 
import jsPDF from 'jspdf'; 

@Component({
  selector: 'app-booking-success',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyPipe, DatePipe], 
  templateUrl: './booking-success.html',
  styleUrls: ['./booking-success.css']
})
export class BookingSuccessComponent implements OnInit {
  bookingId: string | null = null;
  bookingDetails: any = null;
  isLoading = true; 
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService 
  ) {}

  ngOnInit(): void {
    this.bookingId = this.route.snapshot.paramMap.get('id');
    
    if (this.bookingId) {
      this.isLoading = true;
      this.authService.getBookingDetails(this.bookingId).subscribe({
        next: (details) => {
          this.bookingDetails = details;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error fetching booking details:', err);
          this.error = 'Could not fetch your booking details. Please try again later.';
          this.isLoading = false;
        }
      });
    } else {
      this.error = 'No booking ID found in URL.';
      this.isLoading = false;
    }
  }
  private toBase64(url: string): Promise<{ data: string, format: string }> { 
    return new Promise((resolve, reject) => {
      const fullUrl = new URL(url, window.location.origin).href;

      fetch(fullUrl) 
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.blob();
        })
        .then(blob => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64Data = reader.result as string;
            const format = base64Data.substring(base64Data.indexOf('/') + 1, base64Data.indexOf(';'));
            resolve({ data: base64Data, format: format.toUpperCase() }); 
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        })
        .catch(error => {
          console.error('toBase64 fetch error:', error);
          reject(error);
        });
    });
  }

  async downloadPdf(): Promise<void> {
    if (!this.bookingDetails) return;

    try {
      const doc = new jsPDF();
      const b = this.bookingDetails;
      const pageHeight = doc.internal.pageSize.getHeight();
      const pageWidth = doc.internal.pageSize.getWidth();
      const startDate = new Date(b.travelDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      const endDate = b.endDate ? new Date(b.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';
      const bookedOn = new Date(b.timestamp).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
      const phoneNumber = b.phoneNumber || 'N/A';
      const travelers = b.travelers.toString();
      const basePrice = b.amount / b.travelers;
      const basePriceStr = `INR ${basePrice.toLocaleString()}`;
      const totalAmountStr = `INR ${b.amount.toLocaleString()}`;


      let imageData: string | null = null;
      let imageFormat = 'JPEG';
      if (b.imageUrl) {
        try {
          const result = await this.toBase64(b.imageUrl);
          imageData = result.data;
          imageFormat = result.format;
          if (imageFormat === 'AVIF' || imageFormat === 'WEBP') {
            console.warn(`PDF generator does not support ${imageFormat}. Skipping image.`);
            imageData = null;
          }
        } catch (e) {
          console.error("Could not load image for PDF:", e);
          imageData = null;
        }
      }

      const primaryColor = '#3b82f6'; 
      const secondaryColor = '#0c1a3e'; 
      const lightGray = '#f1f5f9';
      const darkGray = '#334155';
      const mediumGray = '#64748b';
      const successGreen = '#10b981';

      doc.setFillColor(secondaryColor);
      doc.rect(0, 0, pageWidth, 30, 'F');
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor('#FFFFFF');
      doc.text("TripAxis", 20, 18);
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'normal');
      doc.text("Booking Receipt", pageWidth - 20, 18, { align: 'right' });

      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(successGreen);
      doc.text("PAYMENT CONFIRMED", 20, 45);

      let startY = 58;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(mediumGray);
      doc.text("BILL TO:", 20, startY);

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(darkGray);
      doc.text(b.fullName, 20, startY + 6);
      doc.text(b.userEmail, 20, startY + 12);
      doc.text(phoneNumber, 20, startY + 18); 
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(mediumGray);
      doc.text("BOOKED ON:", 20, startY + 28); 
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(darkGray);
      doc.text(bookedOn, 20, startY + 34); 
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(mediumGray);
      doc.text("BOOKING ID:", pageWidth / 2 + 10, startY);

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(darkGray);
      doc.text(b.bookingId, pageWidth / 2 + 10, startY + 6);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(mediumGray);
      doc.text("ORDER ID:", pageWidth / 2 + 10, startY + 12);
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(darkGray);
      doc.text(b.orderId, pageWidth / 2 + 10, startY + 18);

      startY += 50; 

      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(mediumGray);
      doc.text("YOUR TRIP:", 14, startY);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(darkGray);
      const descriptionY = startY + 7;
      doc.text(b.item, 14, descriptionY, { maxWidth: pageWidth - 28, align: 'left' });
      
      const descHeight = doc.getTextDimensions(b.item, { maxWidth: pageWidth - 28, fontSize: 12 }).h;
      startY += descHeight + 15;

      const tableStartX = 14;
      const tableWidth = pageWidth - 28;
      const colWidth = tableWidth / 3;

      doc.setFillColor(lightGray);
      doc.rect(tableStartX, startY, tableWidth, 10, 'F');
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(darkGray);
      doc.text("START DATE", tableStartX + 5, startY + 7);
      doc.text("END DATE", tableStartX + colWidth + 5, startY + 7);
      doc.text("TRAVELERS", tableStartX + (colWidth * 2) + 5, startY + 7);
      startY += 10;
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(darkGray);
      const rowY = startY + 7;
      doc.text(startDate, tableStartX + 5, rowY);
      doc.text(endDate, tableStartX + colWidth + 5, rowY);
      doc.text(travelers, tableStartX + (colWidth * 2) + 5, rowY);
      
      startY += 15;

      if (imageData) {
        try {

          const priceSectionTop = pageHeight - 80; 
          if (startY < priceSectionTop) {
            const imgProps = doc.getImageProperties(imageData);
            const imgWidth = 80;
            const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
            const imgX = (pageWidth - imgWidth) / 2;

         
            if (startY + imgHeight < priceSectionTop) {
              doc.addImage(imageData, imageFormat, imgX, startY, imgWidth, imgHeight);
            } else {
              console.warn("Image was too large to fit, skipping.");
            }
          }
        } catch (e) {
          console.error("Error adding image to PDF:", e);
        }
      }

      const rightMargin = pageWidth - 20;
      const labelX = pageWidth - 70; 
      
    
      let priceY = pageHeight - 60; 
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(darkGray);
      
      doc.text("Price (per traveler):", labelX, priceY, { align: 'right' });
      doc.text(basePriceStr, rightMargin, priceY, { align: 'right' });
      
      priceY += 7;
      doc.text("Travelers:", labelX, priceY, { align: 'right' });
      doc.text(travelers, rightMargin, priceY, { align: 'right' });
      
      priceY += 7; 
      doc.setDrawColor(mediumGray);
      doc.line(labelX - 10, priceY, rightMargin, priceY); 
      priceY += 7;
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(darkGray);
      doc.text("Total Amount Paid:", labelX, priceY, { align: 'right' });
      
      doc.setTextColor(primaryColor);
      doc.text(totalAmountStr, rightMargin, priceY, { align: 'right' });

      const footerY = pageHeight - 20;
      doc.setFillColor(lightGray);
      doc.rect(0, footerY - 5, pageWidth, 25, 'F');
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(primaryColor);
      doc.text("Thank you for choosing TripAxis!", pageWidth / 2, footerY + 2, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(mediumGray);
      doc.text("Questions? Contact us at support@tripaxis.com", pageWidth / 2, footerY + 8, { align: 'center' });

      doc.save(`TripAxis-Receipt-${b.bookingId}.pdf`);

    } catch (error) { 
      console.error("Error generating PDF:", error);
      alert("Sorry, we couldn't generate the PDF. Please try again.");
    }
  }
}