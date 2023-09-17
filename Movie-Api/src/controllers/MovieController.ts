import { NextFunction, Request, Response } from "express";
import IMovie from "../interfaces/MovieInterface.js";
import MovieServices from "../services/MovieService.js";
import ApiError from "../utils/ApiError.js";
import MovieModel from "../models/MovieModel.js";
import AuthService from "../services/AuthService.js";
import { IUser } from "../models/userModel.js";

class MovieController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { title, releaseDate, trailerLink, posterUrl, genres } = req.body;

      const newMovie = {
        title,
        releaseDate,
        trailerLink,
        posterUrl,
        genres,
      } as IMovie;

      const savedMovie = await MovieServices.createMovie(newMovie);

      res.status(201).json(savedMovie);
    } catch (error) {
      next(error);
    }
  }

  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const movie = await MovieServices.getMovieById(id);

      if (!movie) {
        throw ApiError.NotFoundError("Movie Not Found");
      }

      res.json(movie);
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const sortBy = (req.query.sortBy as string) || "releaseDate";
    const sortOrder = (req.query.sortOrder as string) || "desc";
    const filtersQuery = (req.query.filters as string) || undefined;

    let filters: any = {};

    if (filtersQuery) {
      try {
        filters = JSON.parse(decodeURIComponent(filtersQuery));
      } catch (error) {
        return next(ApiError.BadRequestError("Invalid filters JSON"));
      }
    }
    // const movies = await MovieServices.getAllMovies(page,limit,sortBy,sortOrder,filter);
  }

  async update(req: Request, res: Response) {
    try {
      const movieId = req.params.id;

      const { title, releaseDate, trailerLink, posterUrl, genres } = req.body;

      const image = req.files?.image;

      let imageUrl = "no-image.jpg";

      let existingMovie: IMovie | null = await MovieModel.findById(movieId);

      if (!existingMovie) {
        res.status(404).json({ message: "Movie not found" });
      }

      if (existingMovie) {
        if (
          existingMovie.posterUrl &&
          existingMovie.posterUrl !== "no-image.jpg"
        ) {
          await MovieServices.delete(existingMovie.posterUrl);
        }

        existingMovie.title = title || existingMovie.title;
        existingMovie.releaseDate = releaseDate || existingMovie.releaseDate;
        existingMovie.trailerLink = trailerLink || existingMovie.trailerLink;
        existingMovie.genres = genres || existingMovie.genres;
        existingMovie.posterUrl = posterUrl || existingMovie.posterUrl;

        if (movieId) {
          existingMovie.movieId = movieId;
        }

        const updatedMovie = await existingMovie.save();
        res.json(updatedMovie);
      }
    } catch (err) {
      console.log(err);
    }
  }
  async delete(req: Request, res: Response) {
    try {
      const movieID = req.params.id;

      if (!AuthService.isAdmin(req.user as IUser)) {
        return res.status(401).json({ error: "Not authorized" });
      }

      const deletedMovie: IMovie | null = await MovieModel.findByIdAndDelete(
        movieID
      );

      if (!deletedMovie) {
        res.status(404).json({ error: "Movie not found" });
      }

      res.json(deletedMovie);
    } catch (err) {
      console.log(err);
      res
        .status(500)
        .send({ errorMessage: "Failed to delete Movie", error: err });
    }
  }
}

export default new MovieController();
