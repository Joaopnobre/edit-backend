import mongoose from "mongoose";

const RoleSchema = new mongoose.Schema({
    name: {
      type: String,
      unique: true,
      required: true,
      uppercase: true,
      trim: true
    }
  })
  
  export interface IRole extends mongoose.Document {
    name: string
  }
  
  const RoleModel = mongoose.model<IRole>("Role", RoleSchema);

  export { RoleModel };