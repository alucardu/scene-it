import { Component, inject, input, ResourceRef } from '@angular/core';
import { MatchService } from '../match.service';
import { Match, YearDifferenceCategory } from '../../shared/types/match.types';

@Component({
  selector: 'app-match',
  templateUrl: './match.component.html',
  styleUrls: ['./match.component.css'],
  imports: [],
})
export class MatchComponent {
  guess = input<string>();

  private matchService = inject(MatchService);
  matchResource!: ResourceRef<Match | undefined>;

  ngOnInit(): void {
    if (this.guess()) this.matchResource = this.matchService.createMatchResource(this.guess()!);
  }

  getYearMatch(release_date: YearDifferenceCategory): string {
    switch (release_date) {
      case YearDifferenceCategory.SameYear:
        return 'same year'
      case YearDifferenceCategory.Within1Year:
        return 'within 1 year'
      case YearDifferenceCategory.Within5Years:
        return 'within 5 years'
      case YearDifferenceCategory.MoreThan5Years:
        return 'more than 5 years'

      default:
        break;
    }
    return release_date;
  }
}
