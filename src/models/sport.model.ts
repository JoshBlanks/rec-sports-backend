import mongoose, { Document, Schema } from "mongoose";

// Interface for gender requirements
export interface IGenderRequirement {
  minFemale: number;
  minMale: number;
  maxOnField: number;
}

// Interface for sport settings
export interface ISportSettings {
  periods?: number;
  periodDuration?: number;
  scoringSystem?: string;
  additionalRules?: string[];
}

// Interface for Sport document
export interface ISport extends Document {
  name: string;
  description: string;
  minPlayers: number;
  maxPlayers: number;
  minPlayersPerGame: number;
  maxPlayersPerGame: number;
  genderRequirements: IGenderRequirement;
  settings: ISportSettings;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Sport schema
const SportSchema = new Schema<ISport>(
  {
    name: {
      type: String,
      required: [true, "Sport name is required"],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Sport description is required"],
    },
    minPlayers: {
      type: Number,
      required: [true, "Minimum number of players is required"],
      min: [1, "Minimum players must be at least 1"],
    },
    maxPlayers: {
      type: Number,
      required: [true, "Maximum number of players is required"],
      min: [1, "Maximum players must be at least 1"],
    },
    minPlayersPerGame: {
      type: Number,
      required: [true, "Minimum players per game is required"],
      min: [1, "Minimum players per game must be at least 1"],
    },
    maxPlayersPerGame: {
      type: Number,
      required: [true, "Maximum players per game is required"],
      min: [1, "Maximum players per game must be at least 1"],
    },
    genderRequirements: {
      minFemale: {
        type: Number,
        required: [true, "Minimum female players is required"],
        min: [0, "Minimum female players cannot be negative"],
      },
      minMale: {
        type: Number,
        required: [true, "Minimum male players is required"],
        min: [0, "Minimum male players cannot be negative"],
      },
      maxOnField: {
        type: Number,
        required: [true, "Maximum players on field is required"],
        min: [1, "Maximum players on field must be at least 1"],
      },
    },
    settings: {
      periods: {
        type: Number,
        min: [0, "Number of periods cannot be negative"],
      },
      periodDuration: {
        type: Number,
        min: [0, "Period duration cannot be negative"],
      },
      scoringSystem: {
        type: String,
        trim: true,
      },
      additionalRules: {
        type: [String],
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Validate gender requirements
SportSchema.pre("validate", function (next) {
  const sport = this;

  // Check that min female + min male <= max on field
  if (
    sport.genderRequirements.minFemale + sport.genderRequirements.minMale >
    sport.genderRequirements.maxOnField
  ) {
    this.invalidate(
      "genderRequirements",
      "Combined minimum female and male players cannot exceed maximum players on field"
    );
  }

  // Check that max players per game >= max on field
  if (sport.maxPlayersPerGame < sport.genderRequirements.maxOnField) {
    this.invalidate(
      "maxPlayersPerGame",
      "Maximum players per game cannot be less than maximum players on field"
    );
  }

  // Check that min players >= min female + min male
  if (
    sport.minPlayers <
    sport.genderRequirements.minFemale + sport.genderRequirements.minMale
  ) {
    this.invalidate(
      "minPlayers",
      "Minimum total players cannot be less than combined minimum female and male players"
    );
  }

  next();
});

export default mongoose.model<ISport>("Sport", SportSchema);
