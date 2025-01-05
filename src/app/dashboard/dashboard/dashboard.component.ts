import { Component, computed, inject } from '@angular/core';
import { UserService } from '../../shared/service/user.service';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: true,
  imports: []
})
export class DashboardComponent {
  private authService = inject(AuthService);
  private userService = inject(UserService);

  user = computed(() => this.userService.userResource.value());

  signOut(): void {
    this.authService.signOut();
  }
}
