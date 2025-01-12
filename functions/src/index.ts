import admin from "firebase-admin";
admin.initializeApp();

import * as guess from "./guess";
import * as movie from "./movie";
import * as match from "./match";

export {movie, guess, match};
