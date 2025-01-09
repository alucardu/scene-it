import { Component, EventEmitter, inject, model, Output, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { debounceTime } from 'rxjs/internal/operators/debounceTime';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatList, MatListItem } from '@angular/material/list';
import { MatInputModule } from '@angular/material/input';
import { MovieService } from '../movie.service';
import { Movie } from '../../shared/types/movie.types';

@Component({
  selector: 'app-movie-list',
  templateUrl: './movie-list.component.html',
  styleUrls: ['./movie-list.component.css'],
  imports: [ReactiveFormsModule, MatFormField, MatLabel, MatList, MatListItem, MatInputModule]

})
export class MovieListComponent {
  private fb = inject(FormBuilder)
  private movieService = inject(MovieService);
  @Output() selectedMovie = new EventEmitter<Movie>()

  movieList = this.movieService.moviesResrouce;

  public movieTitleForm: FormGroup = this.fb.group({
    movieTitle: ['']
  });

  constructor() {
    this.movieTitleForm.controls.movieTitle.valueChanges
      .pipe(debounceTime(250))
      .subscribe(value => {
        this.movieService.movieTitleQuery.set(value)
      });
  }

  selectMovie(movie: Movie): void {
    this.selectedMovie.emit(movie);
    this.movieTitleForm.controls.movieTitle.reset();
  }
};
