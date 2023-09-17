import { Document } from "mongoose";

export default interface IRating extends Document {
   rating: number;   
}