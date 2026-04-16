import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule],
  templateUrl: './dashboard-layout.component.html',
  styleUrl: './dashboard-layout.component.css'
})
export class DashboardLayoutComponent implements OnInit{
  user: any;
  constructor(private authService: AuthService) { }
  ngOnInit(): void {
    this.authService.loadUser();
    this.authService.user$.subscribe(user =>{
      this.user = user;
    });
  }

  logout() {
    this.authService.logout();
  }
}
