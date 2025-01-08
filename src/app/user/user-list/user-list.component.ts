import { Component, inject } from '@angular/core';
import { UserService } from '../user.service';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { debounceTime } from 'rxjs/internal/operators/debounceTime';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatList, MatListItem } from '@angular/material/list';
import { MatInputModule } from '@angular/material/input';
import { User } from '../../shared/types/user.types';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css'],
  imports: [ReactiveFormsModule, MatFormField, MatLabel, MatList, MatListItem, MatInputModule]
})
export class UserListComponent {
  private fb = inject(FormBuilder)
  private userService = inject(UserService);

  userList = this.userService.userListResource;
  allUsersForSession = this.userService.allUsersInvitedToSession;

  public usernameForm: FormGroup = this.fb.group({
    username: ['']
  });

  constructor() {
    this.usernameForm.controls.username.valueChanges
      .pipe(debounceTime(250))
      .subscribe(value => {
        this.userService.usernameQuery.set(value)
      });
  }

  addUserToSession(user: User): void {
    this.userService.inviteUserToSession(user);
    this.userService.usernameQuery.set('');
    this.usernameForm.controls.username.reset();
  }
};
