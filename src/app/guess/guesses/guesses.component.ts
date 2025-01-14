import { Component, inject, signal } from '@angular/core';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { MatList, MatListItem } from '@angular/material/list';
  import { SessionService } from '../../session/session.service';
import { AuthService } from '../../auth/auth.service';
import { MatchComponent } from '../../match/match/match.component';

@Component({
  selector: 'app-guesses',
  templateUrl: './guesses.component.html',
  styleUrls: ['./guesses.component.css'],
  imports: [MatListItem, MatCard, MatCardContent, MatCardHeader, MatList, MatCardTitle, MatchComponent]
})
export class GuessesComponent {
  private authService = inject(AuthService);
  private sessionService = inject(SessionService);

  sessionResource = this.sessionService.sessionResource;
  currentUser = this.authService.currentUser;
  currentGuess = signal<string | undefined>((this.sessionResource.value()?.current_round?.find((guess) => guess.user_id === this.authService.currentUser()?.uid)?.movie_title));
}
