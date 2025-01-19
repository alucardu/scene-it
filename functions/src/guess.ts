export type Guess = {
  uid: string,
  session_id: string,
  guess_id: string,
  movie_id: number,
  title: string
  createdAt: string
  username: string;
  users: number;
}

type CurrentRoundGuess = {
  user_id: string;
  guess_id: string;
  movie_title: string;
  session_id: string;
  username: string;
}

type Session = {
  current_round: [];
  rounds: [];
  users: [];
  tmdb_id: number;
}

import {onDocumentCreated} from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";
import admin from "firebase-admin";
import {getActor, getCharactorName, getDirector, getMovieByIdFn} from "./movie";

const db = admin.firestore();

// const hints = [
//   "hint a", "hint b", "hint c", "hint a", "hint b", "hint c", "hint a", "hint b", "hint c", "hint a", "hint b", "hint c", "hint a", "hint b", "hint c", "hint a", "hint b", "hint c",
// ];

export const createGuess = onDocumentCreated(
  {
    document: "guesses/{guessId}",
    secrets: ["BEARER_TOKEN"],
  }, async (event) => {
    const snapshot = event.data;
    if (!snapshot) return;

    const guess = snapshot.data() as Guess;
    const sessionRef = db.collection("sessions").doc(guess.session_id);
    const sessionSnapshot = await sessionRef.get();
    const session = sessionSnapshot.data() as Session;
    const amountOfUsers = session.users.length;

    const query: CurrentRoundGuess = {
      user_id: guess.uid,
      guess_id: guess.guess_id,
      movie_title: guess.title,
      session_id: guess.session_id,
      username: guess.username,
    };

    // round not ended
    if (session.current_round?.length !== amountOfUsers) {
      await sessionRef.update({
        "current_round": admin.firestore.FieldValue.arrayUnion(query),
      });
    }

    // round ended
    const updatedSessionRef = db.collection("sessions").doc(guess.session_id);
    const updatedSessionSnapshot = await updatedSessionRef.get();
    if (updatedSessionSnapshot.data()!.current_round.length === amountOfUsers) {
      const currentRound = updatedSessionSnapshot.data()?.current_round;
      const currentRoundsLength = updatedSessionSnapshot.data()?.rounds.length || 0;
      const currentHint = updatedSessionSnapshot.data()?.current_hint || null;

      await sessionRef.update({
        current_hint: await generateHint(session.tmdb_id, currentRoundsLength),
        rounds: admin.firestore.FieldValue.arrayUnion({
          hint: currentHint,
          guesses: currentRound,
        }),
        current_round: [],
      });
    }

    logger.info("## DONE ##", {structuredData: true});
  });


/**
 * Fetches a movie from The Movie Database (TMDB) API.
 *
 * @param {object} movieId - The tmdb id.
 * @param {object} currentRound - Session rounds.
 * @return {Promise<string>} The generated hint.
 *
 *
 */
async function generateHint(movieId: number, currentRound: number): Promise<string> {
  const movie = await getMovieByIdFn(movieId);
  console.log("### movie: ", movie);
  console.log("### rounds: ", currentRound);

  return getHintByRound(movie, currentRound);
}

/**
 * Generates a hint based on the movie and round number
 *
 * @param {object} movie - Movie object
 * @param {object} currentRound - Session rounds.
 * @return {string} The generated hint.
 *
 */
function getHintByRound(movie: any, currentRound: number): string {
  switch (currentRound) {
  case 0: {
    // Hint 1: Genres
    const genreNames = movie.genres.map((genre: any) => genre.name).join(", ");
    return `This movie belongs to the genres: ${genreNames}.`;
  }

  case 1: {
    // Hint 2: Release date range and runtime
    const releaseYear = new Date(movie.release_date).getFullYear();
    const releaseRange = `${releaseYear - 1} to ${releaseYear + 1}`;
    return `The movie was released between ${releaseRange} and has a runtime of ${movie.runtime} minutes.`;
  }

  case 2: {
    // Hint 3: Production companies
    const producerNames = movie.production_companies
      .map((company: any) => company.name)
      .join(", ");
    return `It was produced by ${producerNames} in the ${movie.production_companies[0]?.origin_country}.`;
  }

  case 3: {
    // Hint 4: Name of a actor
    if (movie.credits.crew) {
      return `${getActor(movie.credits.cast)} is playing in this movie.`;
    } else {
      return "This movie has no actors.";
    }
  }

  case 4: {
    // Hint 5: Name of a character
    if (movie.credits.crew) {
      return `${getCharactorName(movie.credits.cast)} is one of the characters in this movie.`;
    } else {
      return "This movie has no characters.";
    }
  }

  case 5: {
    // Hint 6: Name of director
    if (movie.credits.crew) {
      return `${getDirector(movie.credits.crew)} is directing this movie`;
    } else {
      return "This movie has no director.";
    }
  }

  case 6: {
    // Hint 7: Blurred poster
    if (movie.poster_path) {
      return movie.poster_path;
    } else {
      return "";
    }
  }

  default:
    return "No more hints are available for this round!";
  }
}
