import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  user: any = null;
  stats: any = {};

  constructor(
    private authService: AuthService,
    private dashboardService: DashboardService
  ) { }

  ngOnInit() {
    this.loadUser();
    this.loadStats();
  }
  loadStats() {
    this.dashboardService.getStats().subscribe({
      next: (data) => {
        this.stats = data;
        console.log('Stats loaded:', this.stats);
      },
      error: (err) => {
        console.error('Failed to load stats:', err);
      }
    });
  }
  loadUser() {
    this.authService.getMe().subscribe({
      next: (data) => {
        this.user = data;
        console.log('User data loaded:', this.user);
      },
      error: (err) => {
        console.error('Failed to load user data:', err);
      }
    });
  }
}
