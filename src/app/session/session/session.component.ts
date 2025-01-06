import { Component, inject, Input, OnInit } from '@angular/core';
import { SessionService } from '../session.service';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-session',
  templateUrl: './session.component.html',
  styleUrls: ['./session.component.css'],
  imports: [MatCardModule, MatListModule]
})
export class SessionComponent implements OnInit {
  private sessionService = inject(SessionService);
  @Input() uid = '';

  ngOnInit() {
    this.sessionService.getCurrentSession.set(this.uid);
  }

  session = this.sessionService.sessionResource;
  sessionUsers = this.sessionService.sessionUsersResource
}
