import { Component, inject, input, OnInit } from '@angular/core';
import { SessionService } from '../session.service';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { GuessComponent } from '../../guess/guess/guess.component';
import { RoundsComponent } from '../../round/rounds/rounds.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-session',
  templateUrl: './session.component.html',
  styleUrls: ['./session.component.css'],
  imports: [MatCardModule, MatListModule, GuessComponent, RoundsComponent, CommonModule]
})
export class SessionComponent implements OnInit {
  private sessionService = inject(SessionService);

  uid = input.required<string>()

  ngOnInit() {
    this.sessionService.getCurrentSessionId.set(this.uid());
  }

  session = this.sessionService.sessionResource;
}
