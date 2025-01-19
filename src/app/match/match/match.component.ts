import { Component, inject, input, ResourceRef } from '@angular/core';
import { MatchService } from '../match.service';
import { Match, YearDifferenceCategory } from '../../shared/types/match.types';
import { CommonModule } from '@angular/common';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { MatList, MatListItem } from '@angular/material/list';

@Component({
  selector: 'app-match',
  templateUrl: './match.component.html',
  styleUrls: ['./match.component.css'],
  imports: [MatCard, MatCardHeader, MatCardTitle, MatCardContent, MatList, MatListItem],
})
export class MatchComponent {
  guessId = input<string>();

  private matchService = inject(MatchService);
  matchResource!: ResourceRef<Match | undefined>;

  ngOnInit(): void {
    if (this.guessId()) this.matchResource = this.matchService.createMatchResource(this.guessId()!);
  }

  objectEntries(obj: Record<string, any>): { key: string; value: any }[] {
    return Object.entries(obj).map(([key, value]) => ({ key, value }));
  }

  isObject(value: any): boolean {
    return value && typeof value === 'object' && !Array.isArray(value);
  }
}
