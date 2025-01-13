export enum YearDifferenceCategory {
  SameYear = "SAME_YEAR",
  Within1Year = "WITHIN_1_YEAR",
  Within5Years = "WITHIN_5_YEARS",
  MoreThan5Years = "MORE_THAN_5_YEARS",
}

import {onDocumentCreated, onDocumentUpdated} from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";
import {Guess} from "./guess";
import {getMovieByIdFn} from "./movie";
import admin from "firebase-admin";

const db = admin.firestore();

export const isSessionCompleted = onDocumentUpdated(
  {
    document: "sessions/{sessionId}",
    secrets: ["BEARER_TOKEN"],
  },
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) return;

    const docRef = admin.firestore().doc(`sessions/${event.params.sessionId}`);

    const latestDoc = await docRef.get();
    if (!latestDoc.exists) return;

    const latestData = latestDoc.data();
    const currentRoundUserIds = latestData?.current_round?.user_ids || [];
    const currentRoundWinnersIds = latestData?.winners?.user_ids || [];

    if (currentRoundWinnersIds.length > 0 && currentRoundUserIds.length === 0) {
      const sessionRef = db.collection("sessions").doc(latestData?.uid);
      await sessionRef.update({
        "status": "completed",
      });
    }
  }
);

export const createMatch = onDocumentCreated(
  {
    document: "guesses/{guessId}",
    secrets: ["BEARER_TOKEN"],
  },
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) return;

    const guess = snapshot.data() as Guess;

    const movieGuess = await getMovieByIdFn(guess.movie_id);

    const sessionRef = db.collection("sessions").doc(guess.session_id);
    const sessionSnapshot = await sessionRef.get();
    const movieSession = await getMovieByIdFn(sessionSnapshot.data()?.tmdb_id);

    checkForWinner(movieGuess.id, movieSession.id, guess);

    const keysToCompare = ["id", "title", "release_date"];
    const matchObject: Record<string, any> = {};

    keysToCompare.forEach((key) => {
      const result = processKey(key, movieSession, movieGuess);
      if (result) {
        matchObject[key] = result;
      }
    });

    if (Object.keys(matchObject).length > 0) {
      await admin.firestore().collection("matches").add({
        session_d: guess.session_id,
        guess_id: guess.guess_id,
        movie_id: guess.movie_id,
        matches: matchObject,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    logger.info("## DONE ##", {structuredData: true});
  }
);

/**
 * Checks if the provided movie guess ID matches the movie session ID and, if so,
 * updates the session to record the winner.
 *
 * @param {string} movieGuessId - The ID of the guessed movie.
 * @param {string} movieSessionId - The ID of the movie session.
 * @param {Guess} guess - The guess object containing session and user details.
 * @return {Promise<void>} A promise that resolves when the operation is complete.
 */
async function checkForWinner(movieGuessId: string, movieSessionId: string, guess: Guess): Promise<void> {
  const winner = movieGuessId === movieSessionId;
  const sessionRef = db.collection("sessions").doc(guess.session_id);

  if (winner) {
    await sessionRef.update({
      "winners.user_ids": admin.firestore.FieldValue.arrayUnion(guess.uid),
    });
  }

  return;
}

/**
 * Processes a specific key from the session and guessed movie objects.
 * Delegates comparison logic based on the key.
 * @param {string} key - The key to compare (e.g., "id", "title", "release_date").
 * @param {Record<string, any>} movieSession - The movie object from the session.
 * @param {Record<string, any>} movieGuess - The movie object from the user's guess.
 * @return {any | undefined} The result of the comparison, or undefined if no match is found.
 */
function processKey(key: string, movieSession: Record<string, any>, movieGuess: Record<string, any>): string | number | undefined {
  const sessionValue = movieSession[key];
  const guessValue = movieGuess[key];

  if (sessionValue && typeof sessionValue === "number" && guessValue && typeof guessValue === "number") {
    switch (key) {
    case "id":
      return compareId(sessionValue, guessValue);
    }
  }

  if (sessionValue && typeof sessionValue === "string" && guessValue && typeof guessValue === "string") {
    switch (key) {
    case "title":
      return compareTitle(sessionValue, guessValue);
    case "release_date":
      return compareReleaseDate(sessionValue, guessValue);
    default:
      return undefined;
    }
  }
  return undefined;
}

/**
 * Compares the IDs of the session movie and the guessed movie.
 * @param {string} sessionValue - The ID of the movie in the session.
 * @param {string} guessValue - The ID of the guessed movie.
 * @return {string[] | undefined} An array containing the matching ID if they are equal, or undefined if they do not match.
 */
function compareId(sessionValue: number, guessValue: number): number | undefined {
  return sessionValue === guessValue ? guessValue : undefined;
}

/**
 * Compares the titles of the session movie and the guessed movie.
 * @param {string} sessionValue - The title of the movie in the session.
 * @param {string} guessValue - The title of the guessed movie.
 * @return {string[] | undefined} An array containing the matching title if they are equal, or undefined if they do not match.
 */
function compareTitle(sessionValue: string, guessValue: string): string | undefined {
  return sessionValue === guessValue ? guessValue : undefined;
}

/**
 * Compares the release dates of the session movie and the guessed movie.
 * Calculates the year difference and categorizes the match accordingly.
 * @param {string} sessionDate - The release date of the movie in the session (in string format).
 * @param {string} guessDate - The release date of the guessed movie (in string format).
 * @return {string[] | undefined} An array containing a category of the year difference
 * ("Same Year", "Within 5 Years", "Within 10 Years", or "More Than 10 Years"), or undefined if dates are invalid.
 */
function compareReleaseDate(sessionDate: string, guessDate: string): string | undefined {
  const sessionYear = new Date(sessionDate).getFullYear();
  const guessYear = new Date(guessDate).getFullYear();

  if (isNaN(sessionYear) || isNaN(guessYear)) return undefined;

  const yearDifference = Math.abs(sessionYear - guessYear);
  if (yearDifference === 0) {
    return YearDifferenceCategory.SameYear;
  } else if (yearDifference <= 1) {
    return YearDifferenceCategory.Within1Year;
  } else if (yearDifference <= 5) {
    return YearDifferenceCategory.Within5Years;
  } else {
    return YearDifferenceCategory.MoreThan5Years;
  }
}
