import mongoose, { Document, Schema } from "mongoose";

// Interface for User document
export interface IUser extends Document {
  email: string;
  firstName: string;
  lastName: string;
  createdAt: Date;
  updatedAt: Date;
}

// User schema
const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create a virtual property for full name
UserSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

export default mongoose.model<IUser>("User", UserSchema);
