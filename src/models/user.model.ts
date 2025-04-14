import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcrypt";

// Interface for User document
export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  gender: "male" | "female" | "other" | "prefer_not_to_say";
  role: "player" | "captain" | "admin" | "referee";
  phone?: string;
  dateOfBirth?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  // Define methods
  matchPassword(enteredPassword: string): Promise<boolean>;
}

// User schema
const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, "Please add an email"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please add a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Please add a password"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Don't include password in query results by default
    },
    firstName: {
      type: String,
      required: [true, "Please add a first name"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Please add a last name"],
      trim: true,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other", "prefer_not_to_say"],
      required: [true, "Please specify gender"],
    },
    role: {
      type: String,
      enum: ["player", "captain", "admin", "referee"],
      default: "player",
    },
    phone: {
      type: String,
      match: [/^[0-9]{10}$/, "Please add a valid phone number"],
    },
    dateOfBirth: {
      type: Date,
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    isActive: {
      type: Boolean,
      default: true,
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

// Encrypt password using bcrypt before saving
UserSchema.pre("save", async function (next) {
  // Only hash the password if it's modified (or new)
  if (!this.isModified("password")) {
    return next();
  }

  try {
    // Generate salt with 10 rounds
    const salt = await bcrypt.genSalt(10);
    // Hash the password
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (
  enteredPassword: string
): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to return user without sensitive information
UserSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.resetPasswordToken;
  delete userObject.resetPasswordExpires;
  return userObject;
};

export default mongoose.model<IUser>("User", UserSchema);
