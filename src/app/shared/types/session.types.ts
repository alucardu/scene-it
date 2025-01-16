import { User } from "./user.types";

export type Session = {
  uid?: string;
  movie_title: string;
  tmdb_id: string;
  pending_invites: Partial<User>[];
  users: Partial<User>[];
  host_id: string;
  host_name: string;
  rounds: Guesses[];
  current_round: SessionGuess[];
  status: "waiting" | "playing" | "completed",
  current_hint: string | null;
  winners: Winners | null;
};

type Winners = {
  user_ids: string[];
}

type Guesses = {
  hint: string;
  guesses: SessionGuess[]
}

export type SessionGuess  = {
  guess_id: string;
  user_id: string;
  movie_title: string;
  username: string;
  session_id: string;
}
