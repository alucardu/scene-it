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
    const currentRoundUserIds = latestData?.current_round || [];
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

    const keysToCompare = [
      "id",
      "title",
      "release_date",
      "genres",
      "production_companies",
      "original_language",
      "runtime",
      "belongs_to_collection",
      "budget",
    ];
    const matchObject: Record<string, any> = {};

    keysToCompare.forEach((key) => {
      const result = processKey(key, movieSession, movieGuess);
      if (result) {
        matchObject[key] = result;
      }
    });

    if (Object.keys(matchObject).length > 0) {
      await admin.firestore().collection("matches").add({
        session_id: guess.session_id,
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
function processKey(
  key: string,
  movieSession: Record<string, any>,
  movieGuess: Record<string, any>
): string | number | string[] | undefined | boolean {
  const sessionValue = movieSession[key];
  const guessValue = movieGuess[key];

  switch (key) {
  case "id":
    return compareId(sessionValue, guessValue);
  case "title":
    return compareTitle(sessionValue, guessValue);
  case "release_date":
    return compareReleaseDate(sessionValue, guessValue);
  case "genres":
    return compareGenres(sessionValue, guessValue);
  case "production_companies":
    return compareProductionCompanies(sessionValue, guessValue);
  case "original_language":
    return sessionValue === guessValue ? guessValue : undefined;
  case "runtime":
    return compareRuntime(sessionValue, guessValue);
  case "belongs_to_collection":
    return compareCollection(sessionValue);
  case "budget":
    return compareBudget(sessionValue, guessValue);
  default:
    return undefined;
  }
}

/**
 * Compares the IDs of the session movie and the guessed movie.
 * @param {number} sessionValue - The ID of the movie in the session.
 * @param {number} guessValue - The ID of the guessed movie.
 * @return {number | undefined} The matching ID if they are equal, or undefined if they do not match.
 */
function compareId(sessionValue: number, guessValue: number): number | undefined {
  return sessionValue === guessValue ? guessValue : undefined;
}

/**
 * Compares the titles of the session movie and the guessed movie.
 * @param {string} sessionValue - The title of the movie in the session.
 * @param {string} guessValue - The title of the guessed movie.
 * @return {string | undefined} The matching title if they are equal, or undefined if they do not match.
 */
function compareTitle(sessionValue: string, guessValue: string): string | undefined {
  return sessionValue === guessValue ? guessValue : undefined;
}

/**
 * Compares the release dates of the session movie and the guessed movie.
 * Calculates the year difference and categorizes the match accordingly.
 * @param {string} sessionDate - The release date of the movie in the session (in string format).
 * @param {string} guessDate - The release date of the guessed movie (in string format).
 * @return {string | undefined} A category of the year difference
 * ("Same Year", "Within 1 Year", "Within 5 Years", or "More Than 5 Years"), or undefined if dates are invalid.
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

/**
 * Compares the genres of the session movie and the guessed movie.
 * Finds common genres between the two movies.
 * @param {Array<{id: number, name: string}>} sessionGenres - The genres of the movie in the session.
 * @param {Array<{id: number, name: string}>} guessGenres - The genres of the guessed movie.
 * @return {string[] | undefined} An array of matching genre names, or undefined if no matches are found.
 */
function compareGenres(
  sessionGenres: { id: number; name: string }[],
  guessGenres: { id: number; name: string }[]
): string[] | undefined {
  const sessionGenreNames = sessionGenres.map((g) => g.name);
  const guessGenreNames = guessGenres.map((g) => g.name);
  const matchingGenres = sessionGenreNames.filter((genre) => guessGenreNames.includes(genre));
  return matchingGenres.length > 0 ? matchingGenres : undefined;
}

/**
 * Compares the production companies of the session movie and the guessed movie.
 * Finds common production companies between the two movies.
 * @param {Array<{id: number, name: string}>} sessionCompanies - The production companies of the movie in the session.
 * @param {Array<{id: number, name: string}>} guessCompanies - The production companies of the guessed movie.
 * @return {string[] | undefined} An array of matching production company names, or undefined if no matches are found.
 */
function compareProductionCompanies(
  sessionCompanies: { id: number; name: string }[],
  guessCompanies: { id: number; name: string }[]
): string[] | undefined {
  const sessionCompanyNames = sessionCompanies.map((c) => c.name);
  const guessCompanyNames = guessCompanies.map((c) => c.name);
  const matchingCompanies = sessionCompanyNames.filter((company) => guessCompanyNames.includes(company));
  return matchingCompanies.length > 0 ? matchingCompanies : undefined;
}

/**
 * Compares the runtime of the session movie and the guessed movie.
 * Determines if the runtime difference is within a certain range.
 * @param {number} sessionRuntime - The runtime of the movie in the session (in minutes).
 * @param {number} guessRuntime - The runtime of the guessed movie (in minutes).
 * @return {string | undefined} A string describing the match ("Exact Match", "Within 10 minutes"), or undefined if no match is found.
 */
function compareRuntime(sessionRuntime: number, guessRuntime: number): string | undefined {
  const difference = Math.abs(sessionRuntime - guessRuntime);
  if (difference === 0) {
    return "Exact Match";
  } else if (difference <= 10) {
    return "Within 10 minutes";
  } else {
    return undefined;
  }
}

/**
 * Checks if the guessed movie belongs to a collection.
 * @param {Record<string, any> | null} guessCollection - The collection object of the guessed movie.
 * @return {boolean | undefined} If movie is part of collection return true, otherwise undefined.
 */
function compareCollection(guessCollection: Record<string, any> | null): boolean | undefined {
  // Check if the guessed movie belongs to a collection
  if (guessCollection && guessCollection.name) {
    return true; // Return the name of the collection
  }

  return undefined;
}

/**
 * Compares the budgets of the session movie and the guessed movie.
 * Provides feedback on whether the budgets are "Exact Match", "Close", or "Far".
 * @param {number} sessionBudget - The budget of the movie in the session.
 * @param {number} guessBudget - The budget of the guessed movie.
 * @return {string | undefined} Feedback on the budget comparison, or undefined if either budget is invalid.
 */
function compareBudget(
  sessionBudget: number | null,
  guessBudget: number | null
): string | undefined {
  if (!sessionBudget || !guessBudget) return undefined;

  const difference = Math.abs(sessionBudget - guessBudget);

  if (difference === 0) {
    return "Exact Match";
  } else if (difference <= 10_000_000) {
    return "Close";
  } else if (difference <= 50_000_000) {
    return "Somewhat Close";
  } else {
    return "Far";
  }
}
