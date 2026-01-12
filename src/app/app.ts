import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './navbar/navbar';
import { FooterSection } from './footer-section/footer-section';
import { Notification } from './notification/notification'; 

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Navbar, FooterSection, Notification], 
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {}