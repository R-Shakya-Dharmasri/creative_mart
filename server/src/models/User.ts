
import mongoose, { Schema, type Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash?: string;
  authProvider: "local" | "google";
  googleId?: string;
  role: "user";
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    passwordHash: {
      type: String,
      select: false,
    },

    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
      required: true,
    },

    googleId: {
      type: String,
      sparse: true,
    },

    role: {
      type: String,
      enum: ["user"],
      default: "user",
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

// Password is required for email/password accounts.
userSchema.pre("validate", function () {
  if (this.authProvider === "local" && !this.passwordHash) {
    this.invalidate(
      "passwordHash",
      "Password hash is required for local accounts"
    );
  }
});

const User = mongoose.model<IUser>("User", userSchema);

export default User;
