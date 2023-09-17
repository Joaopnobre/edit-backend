import { Document } from "mongoose";

export default interface IMovie extends Document {
    movieId: number;
    title: string;
    releaseDate: string;
    trailerLink: string;
    posterUrl: string;
    genres: [string];
}