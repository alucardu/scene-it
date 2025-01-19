type Movie = {
  release_date: string;
}

type MovieSessionConfig = {
  release_date_start: string;
  release_date_end: string;
  genre: string;
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
    const movieConfig: MovieSessionConfig = request.data;
    const url = buildUrl(movieConfig);

    const data = await fetch(url, options)
      .then((res) => res.json())
      .then((json) => {
        return json;
      })
      .catch((err) => logger.info(err, {structuredData: true}));

    const totalPages: string = data.total_pages;
    const randomPage = Math.floor(Math.random() * parseInt(totalPages)) + 1;
    const randomMovie = await selectRandomMovie(movieConfig, randomPage);

    return {
      movie: randomMovie,
    };
  });

/**
 * Fetches a random movie from The Movie Database (TMDB) API.
 *
 * @param {object} config - Configuration for the request.
 * @param {number} randomPage - The random page number to fetch movies from.
 * @return {Promise<string>} A url used for finding a movie.
 *
 */
function buildUrl(config: MovieSessionConfig, randomPage?: number): string {
  const primaryReleaseDateGte = config.release_date_start ? `&primary_release_date.gte=${config.release_date_start}` : "";
  const primaryReleaseDateLte = config.release_date_end ? `&primary_release_date.lte=${config.release_date_end}` : "";
  const genres = config.genre ? `&with_genres=${config.genre}` : "";
  const randomPageX = randomPage ?? 1;

  const url = `https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=${randomPageX}${primaryReleaseDateGte}${primaryReleaseDateLte}&sort_by=vote_average.desc&vote_count.gte=1500${genres}`;
  return url;
}

/**
 * Fetches a random movie from The Movie Database (TMDB) API.
 *
 * @param {object} config - Configuration for the request.
 * @param {number} randomPage - The random page number to fetch movies from.
 */
async function selectRandomMovie(
  config: MovieSessionConfig, randomPage: number): Promise<any> {
  const url = buildUrl(config, randomPage);

  const data = await fetch(url, options)
    .then((res) => res.json())
    .then((json) => {
      return json;
    })
    .catch((err) => logger.info(err, {structuredData: true}));

  return data.results[Math.floor(Math.random() * data.results.length)];
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

    data.results = data.results
      .filter((movie: any) => movie.vote_count > 500)
      .sort((a: Movie, b: Movie) => {
        return new Date(b.release_date).getTime() - new Date(a.release_date).getTime();
      });

    response.send({
      movies: data,
    });
  });

export const getMovieById = onRequest(
  {
    secrets: ["BEARER_TOKEN"],
    cors: true,
  }, async (request, response) => {
    const data = await getMovieByIdFn(request.body);

    response.send({
      movie: data,
    });
  });

/**
 * Fetches a movie from The Movie Database (TMDB) API.
 *
 * @param {object} id - The tmdb id
 */
export async function getMovieByIdFn(id: string | number): Promise<any> {
  const url = `https://api.themoviedb.org/3/movie/${id}?append_to_response=credits&language=en-US`;

  const data = await fetch(url, options)
    .then((res) => res.json())
    .then((json) => {
      return json;
    })
    .catch((err) => logger.info(err, {structuredData: true}));
  return data;
}

/**
 * Get the director name.
 *
 * @param {object} crew - Array of crew
 * @return {string} Director name
 *
 */
export function getDirector(crew: any[]): string {
  const directorName = crew.find((crew: any) => {
    if (crew.known_for_department === "Directing" && crew.department === "Directing" && crew.job === "Director") return crew;
  });

  return directorName.name;
}

/**
 * Get a actor name.
 *
 * @param {object} cast - Array of crew
 * @return {string} Actor name
 */
export function getActor(cast: any[]): string {
  const actorName = cast.find((cast: any) => {
    if (cast.known_for_department === "Acting") return cast;
  });

  return actorName.name;
}

/**
 * Get a actor name.
 *
 * @param {object} cast - Array of crew
 * @return {string} Actor name
 */
export function getCharactorName(cast: any[]): string {
  const actorName = cast.find((cast: any) => {
    if (cast.known_for_department === "Acting") return cast;
  });

  return actorName.character;
}
