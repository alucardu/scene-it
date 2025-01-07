/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

type Config = {
  release_date_start: string;
  release_date_end: string;
}

import {onRequest} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

const options = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${process.env.BEARER_TOKEN}`,
  },
};

export const getRandomMovie = onRequest(
  {
    secrets: ["BEARER_TOKEN"],
    cors: true,
  }, async (request, response) => {
    const config: Config = JSON.parse(request.body);
    const url = `https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&release_date.gte=${config.release_date_start}&release_date.lte=${config.release_date_end}}&sort_by=vote_count.desc&vote_count.gte=2500`;

    const data = await fetch(url, options)
      .then((res) => res.json())
      .then((json) => {
        return json;
      })
      .catch((err) => logger.info(err, {structuredData: true}));

    const totalPages: string = data.total_pages;
    const randomPage = Math.floor(Math.random() * parseInt(totalPages)) + 1;
    const randomMovie = await selectRandomMovie(config, randomPage);

    response.send({
      movie: randomMovie,
    });
  });

/**
 * Fetches a random movie from The Movie Database (TMDB) API.
 *
 * @param {object} config - Configuration for the request.
 * @param {number} randomPage - The random page number to fetch movies from.
 */
async function selectRandomMovie(
  config: Config, randomPage: number): Promise<any> {
  const url = `https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=${randomPage}&release_date.gte=${config.release_date_start}&release_date.lte=${config.release_date_end}}&sort_by=vote_count.desc&vote_count.gte=2500`;

  const data = await fetch(url, options)
    .then((res) => res.json())
    .then((json) => {
      return json;
    })
    .catch((err) => logger.info(err, {structuredData: true}));

  return data.results[Math.floor(Math.random() * 20 + 1)];
}
