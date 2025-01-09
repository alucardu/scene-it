import { Component, inject, OnInit } from '@angular/core';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { MatList, MatListItem } from '@angular/material/list';
import { GuessService } from '../guess.service';

@Component({
  selector: 'app-guesses',
  templateUrl: './guesses.component.html',
  styleUrls: ['./guesses.component.css'],
  imports: [MatListItem, MatCard, MatCardContent, MatCardHeader, MatList, MatCardTitle]
})
export class GuessesComponent {
  private guessService = inject(GuessService);
  
  guesses = this.guessService.allGuessesResource;
}