import { Component, inject, signal } from '@angular/core';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
  import { SessionService } from '../../session/session.service';
import { AuthService } from '../../auth/auth.service';
import { MatchComponent } from '../../match/match/match.component';
import { ReverseArrayPipe } from '../../shared/pipes/reverseArray.pipe';
import { MatList, MatListItem } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-rounds',
  templateUrl: './rounds.component.html',
  styleUrls: ['./rounds.component.css'],
  imports: [MatCard, MatCardContent, MatCardHeader, MatCardTitle, MatchComponent, ReverseArrayPipe, MatList, MatListItem, MatIconModule]
})
export class RoundsComponent {
  private authService = inject(AuthService);
  private sessionService = inject(SessionService);

  collapse = signal(0);

  sessionResource = this.sessionService.sessionResource;
  currentUser = this.authService.currentUser;
}
