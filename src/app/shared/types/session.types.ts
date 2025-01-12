export type Session = {
  uid?: string;
  movie_title: string;
  tmdb_id: string;
  pending_invites: string[];
  users: string[];
  host_id: string;
  rounds: Round[];
  current_round: Round | null;
};

type Round = {
  guess_ids: string[];
  user_ids: string[];
};
