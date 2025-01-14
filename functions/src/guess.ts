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
}

import {onDocumentCreated} from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";
import admin from "firebase-admin";

const db = admin.firestore();

const hints = [
  "hint a", "hint b", "hint c",
];

export const createGuess = onDocumentCreated(
  "guesses/{guessId}", async (event) => {
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

    if (session.current_round?.length !== amountOfUsers) {
      await sessionRef.update({
        "current_round": admin.firestore.FieldValue.arrayUnion(query),
      });
    }

    const updatedSessionRef = db.collection("sessions").doc(guess.session_id);
    const updatedSessionSnapshot = await updatedSessionRef.get();
    if (updatedSessionSnapshot.data()!.current_round.length === amountOfUsers) {
      const currentRound = updatedSessionSnapshot.data()?.current_round;
      const currentRoundsLength = updatedSessionSnapshot.data()?.rounds.length || 0;

      await sessionRef.update({
        rounds: admin.firestore.FieldValue.arrayUnion({
          hint: hints[currentRoundsLength],
          guesses: currentRound,
        }),
        current_round: [],
      });
    }

    logger.info("## DONE ##", {structuredData: true});
  });


