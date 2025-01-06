import {
    Component,
    signal,
} from '@angular/core';
import { getAuth, signOut, User } from "firebase/auth";
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet],
    templateUrl: './app.component.html',
})
export class AppComponent {
  private auth = getAuth();
  user = signal<User | null>(null)

  ngOnInit(): void {
    this.auth.onAuthStateChanged((user) => {
      this.user.set(user);
    })
  }

  signOut(): void {
    signOut(this.auth).then(() => {
      // Sign-out successful.
    }).catch((error) => {
      // An error happened.
    });

  }
}
