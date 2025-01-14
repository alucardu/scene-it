export type Session = {
  uid?: string;
  movie_title: string;
  tmdb_id: string;
  pending_invites: string[];
  users: string[];
  host_id: string;
  rounds: Guesses[];
  current_round: SessionGuess[];
  status: "waiting" | "playing" | "completed",
  winners: Winners | null;
  hints: string[],
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
