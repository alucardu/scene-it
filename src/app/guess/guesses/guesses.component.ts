import { Component, inject } from '@angular/core';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { MatList, MatListItem } from '@angular/material/list';
  import { SessionService } from '../../session/session.service';
import { AuthService } from '../../auth/auth.service';
import { GuessService } from '../guess.service';

@Component({
  selector: 'app-guesses',
  templateUrl: './guesses.component.html',
  styleUrls: ['./guesses.component.css'],
  imports: [MatListItem, MatCard, MatCardContent, MatCardHeader, MatList, MatCardTitle]
})
export class GuessesComponent {
  private authService = inject(AuthService);
  private sessionService = inject(SessionService);
  private guessService = inject(GuessService)

  sessionResource = this.sessionService.sessionResource;
  currentGuessResource = this.guessService.currentGuessResource;
}
