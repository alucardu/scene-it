import { Component, inject } from '@angular/core';
import { UserService } from '../../shared/service/user.service';
import { AuthService } from '../../auth/auth.service';
import { SessionListComponent } from '../../session/session-list/session-list.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  imports: [SessionListComponent]
})
export class DashboardComponent {
  private authService = inject(AuthService);
  private userService = inject(UserService);
  user = this.userService.userResource;

  signOut(): void {
    this.authService.signOut();
  }
}
