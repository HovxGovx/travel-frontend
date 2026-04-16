import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  error: string = '';
  constructor(private authService: AuthService, private router: Router) {}

  onLogin() {
    const data = {
      email: this.email,
      password: this.password
    };
    this.authService.login(data).subscribe({
      next: (res) => {
        this.authService.loadUser();
        this.router.navigate(['/dashboard']);
      }
    });
  }
}
