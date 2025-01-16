import { Component, inject } from '@angular/core';
import { SessionService } from '../session.service';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { SessionInvitesService } from '../../shared/services/session-invites.service';
import { SessionGuess } from '../../shared/types/session.types';
import { DocumentData } from 'firebase/firestore/lite';

@Component({
  selector: 'app-sessions',
  templateUrl: './sessions.component.html',
  styleUrls: ['./sessions.component.css'],
  imports: [MatCardModule, MatInputModule, MatButtonModule, RouterLink]
})

export class SessionsComponent {
  private authService = inject(AuthService);
  private sessionService = inject(SessionService);
  private sessionInvitesService = inject(SessionInvitesService)

  user = this.authService.currentUser;

  sessions = this.sessionService.sessionsResource;
  currentUserPendingInvitesResource = this.sessionInvitesService.currentUserPendingInvitesResource;

  deleteSession(uid: string): void {
    this.sessionService.deleteSesion(uid);
  }

  getGuessState(session: DocumentData): string {
    if (session.current_round.length === 0) {
      return 'Ready to guess!'
    }

    const currentUserGuess = session.current_round.find((guess: SessionGuess) => guess.user_id === this.authService.currentUser()?.uid)
    if (currentUserGuess) {
      return `You guessed: ${currentUserGuess.movie_title}`
    }

    return ''
  }
}
