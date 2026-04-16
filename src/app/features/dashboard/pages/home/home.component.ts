import { Component } from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  user: any = null;

  constructor(private authService: AuthService) { }

  ngOnInit() {
    this.loadUser();
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
