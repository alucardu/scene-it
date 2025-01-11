type MovieSessionConfig = {
  release_date_start: string;
  release_date_end: string;
}

import {onCall, onRequest} from "firebase-functions/v2/https";
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

export const getRandomMovie = onCall(
  {
    secrets: ["BEARER_TOKEN"],
    cors: true,
  }, async (request, response) => {
    const config: MovieSessionConfig = request.data;
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

    return {
      movie: randomMovie,
    };
  });

/**
 * Fetches a random movie from The Movie Database (TMDB) API.
 *
 * @param {object} config - Configuration for the request.
 * @param {number} randomPage - The random page number to fetch movies from.
 */
async function selectRandomMovie(
  config: MovieSessionConfig, randomPage: number): Promise<any> {
  const url = `https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=${randomPage}&release_date.gte=${config.release_date_start}&release_date.lte=${config.release_date_end}}&sort_by=vote_count.desc&vote_count.gte=2500`;

  const data = await fetch(url, options)
    .then((res) => res.json())
    .then((json) => {
      return json;
    })
    .catch((err) => logger.info(err, {structuredData: true}));

  return data.results[Math.floor(Math.random() * 20 + 1)];
}

export const getSearchedMovies = onRequest(
  {
    secrets: ["BEARER_TOKEN"],
    cors: true,
  }, async (request, response) => {
    const query: string = request.body;
    const url = `https://api.themoviedb.org/3/search/movie?query=${query}&include_adult=false&language=en-US&page=1'`;

    const data = await fetch(url, options)
      .then((res) => res.json())
      .then((json) => {
        return json;
      })
      .catch((err) => logger.info(err, {structuredData: true}));

    response.send({
      movies: data,
    });
  });

export const getMovieById = onRequest(
  {
    secrets: ["BEARER_TOKEN"],
    cors: true,
  }, async (request, response) => {
    const id: string = request.body;
    const url = `https://api.themoviedb.org/3/movie/${id}?language=en-US`;

    const data = await fetch(url, options)
      .then((res) => res.json())
      .then((json) => {
        return json;
      })
      .catch((err) => logger.info(err, {structuredData: true}));

    response.send({
      movie: data,
    });
  });
