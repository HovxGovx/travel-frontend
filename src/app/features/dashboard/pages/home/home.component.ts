import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../services/dashboard.service';
import { DashboardStats } from '../../../../core/services/admin.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  user: any = null;
  stats!: DashboardStats;
  loading = true;
  error = '';

  dashboardCards: {
    title: string;
    key: keyof DashboardStats;
    valueKey: keyof DashboardStats;
  }[] = [
    {
      title: 'Activités',
      key: 'activities',
      valueKey: 'activities'
    },
    {
      title: 'Utilisateurs',
      key: 'users',
      valueKey: 'users'
    },
    {
      title: 'Villes',
      key: 'cities',
      valueKey: 'cities'
    },
    {
      title: 'Hotels',
      key: 'hotels',
      valueKey: 'hotels'
    },
    {
      title: 'Restaurants',
      key: 'restaurants',
      valueKey: 'restaurants'
    },
    {
      title: 'Transports',
      key: 'transports',
      valueKey: 'transports'
    },
    {
      title: 'Plans générés',
      key: 'plans',
      valueKey: 'plans'
    }
  ];
  constructor(
    private authService: AuthService,
    private dashboardService: DashboardService,
    private adminService: DashboardService,
    private router: Router
  ) { }
  goTo(path: string) {
    this.router.navigate(['/dashboard/' + path]);
  }
  ngOnInit() {
    this.loadUser();
    this.loadStats();
  }
  loadStats() {
    this.adminService.getStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.loading = false;
        console.log('Stats loaded:', this.stats);
      },
      error: (err) => {
        console.error('Failed to load stats:', err);
        this.loading = false;
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
