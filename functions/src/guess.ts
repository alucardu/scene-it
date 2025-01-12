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

import {onDocumentCreated} from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";
import admin from "firebase-admin";

const db = admin.firestore();

export const createGuess = onDocumentCreated(
  "guesses/{guessId}", async (event) => {
    const snapshot = event.data;
    if (!snapshot) return;

    const guess = snapshot.data() as Guess;
    const sessionRef = db.collection("sessions").doc(guess.session_id);
    const sessionSnapshot = await sessionRef.get();
    const amountOfUsers = sessionSnapshot.data()!.users.length;

    if (sessionSnapshot.data()!.current_round.guess_ids.length !== amountOfUsers) {
      await sessionRef.update({
        "current_round.user_ids": admin.firestore.FieldValue.arrayUnion(guess.uid),
        "current_round.guess_ids": admin.firestore.FieldValue.arrayUnion(guess.guess_id),
      });
    }

    const updatedSessionRef = db.collection("sessions").doc(guess.session_id);
    const updatedSessionSnapshot = await updatedSessionRef.get();
    if (updatedSessionSnapshot.data()!.current_round.guess_ids.length === amountOfUsers) {
      const currentRound = updatedSessionSnapshot.data()?.current_round;

      await sessionRef.update({
        rounds: admin.firestore.FieldValue.arrayUnion(currentRound),
        current_round: {
          user_ids: [],
          guess_ids: [],
        },
      });
    }

    logger.info("## DONE ##", {structuredData: true});
  });


