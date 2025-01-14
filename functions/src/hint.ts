import {onDocumentUpdated} from "firebase-functions/v2/firestore";
import admin from "firebase-admin";

const db = admin.firestore();

const hints = [
  "hint a", "hint b", "hint c",
];

export const isSessionCompleted = onDocumentUpdated(
  {
    document: "sessions/{sessionId}",
    secrets: ["BEARER_TOKEN"],
  },
  async (event) => {
    const snapshot = event.data?.after;
    if (!snapshot) return;

    const docRef = admin.firestore().doc(`sessions/${event.params.sessionId}`);

    const latestDoc = await docRef.get();
    if (!latestDoc.exists) return;

    const latestData = latestDoc.data();
    const currentRoundFinished = latestData?.current_round?.length === 0;
    const roundsLength = latestData?.rounds?.length || 0;
    const hintsLength = latestData?.hints?.length || 0;

    if (
      roundsLength > 0 &&
        currentRoundFinished &&
        hintsLength !== roundsLength) {
      const sessionRef = db.collection("sessions").doc(latestData?.uid);
      const hintsLength = latestData?.hints?.length || 0;

      await sessionRef.update({
        "hints": admin.firestore.FieldValue.arrayUnion(hints[hintsLength]),
      });
    }
  }
);
