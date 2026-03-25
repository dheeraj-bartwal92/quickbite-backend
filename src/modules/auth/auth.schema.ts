import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcryptjs";

export const AddressType = {
  HOME: "home",
  WORK: "work",
  OTHER: "other",
} as const;

export type AddressType = (typeof AddressType)[keyof typeof AddressType];

export const UserType = {
  CUSTOMER: "customer",
  ADMIN: "admin",
} as const;

export type UserType = (typeof UserType)[keyof typeof UserType];

export interface IAddress {
  label: AddressType;
  street: string;
  city: string;
  pincode: string;
  coordinates?: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
  isDefault: boolean;
}

interface IUserMethods {
  comparePassword(password: string): Promise<boolean>;
  toSafeObject(): Omit<IUser, "passwordHash">;
}

export interface IUser extends Document {
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  addresses: IAddress[];
  isActive: boolean;
  role: UserType;
  tokenVersion: number;
  createdAt: Date;
  updatedAt: Date;
}

type UserModel = Model<IUser, {}, IUserMethods>;

const addressSchema = new Schema<IAddress>(
  {
    label: {
      type: String,
      enum: Object.values(AddressType),
      default: AddressType.HOME,
    },
    city: {
      type: String,
      required: true,
    },
    pincode: {
      type: String,
      required: true,
    },
    street: {
      type: String,
      required: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    coordinates: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: { type: [Number] },
    },
  },
  { _id: true },
);

addressSchema.index({ coordinates: "2dsphere" });

const userSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true },
    phone: {
      type: String,
      required: true,
    },

    passwordHash: {
      type: String,
      required: true,
      select: false,
    },

    addresses: [addressSchema],
    isActive: {
      type: Boolean,
      default: true,
    },

    role: {
      type: String,
      enum: Object.values(UserType),
      default: UserType.CUSTOMER,
    },

    tokenVersion: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ phone: 1 }, { unique: true });
userSchema.index({ isActive: 1 });

userSchema.pre("save", async function (next) {
  if (!this.isModified("passwordHash") || !this.passwordHash) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  next();
});

userSchema.methods.comparePassword = async function (
  password: string,
): Promise<boolean> {
  if (!this.passwordHash) return false;
  return bcrypt.compare(password, this.passwordHash);
};

userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  const { passwordHash: _passwordHash, ...safeUser } = obj;
  return safeUser;
};

const User: UserModel = mongoose.model<IUser, UserModel>("User", userSchema);

export default User;
