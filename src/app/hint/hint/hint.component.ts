import { Component, inject } from '@angular/core';
import { SessionService } from '../../session/session.service';

@Component({
  selector: 'app-hint',
  templateUrl: './hint.component.html',
  styleUrls: ['./hint.component.css']
})
export class HintComponent {
  private sessionService = inject(SessionService);

  sessionResource = this.sessionService.sessionResource;
}
