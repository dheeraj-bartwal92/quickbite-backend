import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { RestaurantTagType, CuisineType, Day, CUISINES, RESTAURANT_TAGS, DAYS } from "../../constants/restaurant.constants";

/* ---------------- GEO ---------------- */

interface IGeo {
  type: "Point";
  coordinates: [number, number]; // [lng, lat]
}

export interface ILocation {
  address: string;
  city: string;
  pincode: string;
  geo: IGeo;
}

/* ---------------- OPENING HOURS ---------------- */

export interface IOpeningSlot {
  open: string;
  close: string;
}

export interface IOpeningDay {
  slots: IOpeningSlot[];
  isClosed: boolean;
}

export type IOpeningHours = Record<Day, IOpeningDay>;

/* ---------------- RATING ---------------- */

export interface IRating {
  average: number;
  count: number;
}

/* ---------------- RESTAURANT ---------------- */

export interface IRestaurant extends Document {
  name: string;
  description: string;
  slug: string;

  cuisines: CuisineType[];
  tags: RestaurantTagType[];

  location: ILocation;
  openingHours: IOpeningHours;

  minOrderAmount: number;
  deliveryTimeMins: number;
  deliveryFee: number;

  isActive: boolean;
  isApproved: boolean;

  ownerId: Types.ObjectId;
  rating: IRating;

  createdAt: Date;
  updatedAt: Date;
}

/* ---------------- SLOT SCHEMA ---------------- */

const openingSlotSchema = new Schema<IOpeningSlot>(
  {
    open: { type: String, required: true },
    close: { type: String, required: true }
  },
  { _id: false }
);

/* ---------------- DAY SCHEMA ---------------- */

const openingDaySchema = new Schema<IOpeningDay>(
  {
    slots: { type: [openingSlotSchema], default: [] },
    isClosed: { type: Boolean, default: false }
  },
  { _id: false }
);

/* ---------------- OPENING HOURS SCHEMA ---------------- */

const openingHoursSchema = new Schema<IOpeningHours>(
  DAYS.reduce((acc, day) => {
    acc[day] = { type: openingDaySchema, default: { slots: [], isClosed: false } };
    return acc;
  }, {} as Record<Day, any>),
  { _id: false }
);

/* ---------------- LOCATION SCHEMA ---------------- */

const locationSchema = new Schema<ILocation>({
  address: { type: String, required: true, trim: true },

  city: { type: String, required: true, trim: true },

  pincode: { type: String, required: true, trim: true },

  geo: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point"
    },

    coordinates: {
      type: [Number],
      required: true
    }
  }
});

/* ---------------- RESTAURANT SCHEMA ---------------- */

const restaurantSchema = new Schema<IRestaurant>(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      required: true,
      trim: true
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true
    },

    cuisines: [
      {
        type: String,
        enum: CUISINES
      }
    ],

    tags: [
      {
        type: String,
        enum: RESTAURANT_TAGS
      }
    ],

    location: {
      type: locationSchema,
      required: true
    },

    openingHours: {
      type: openingHoursSchema,
      required: true
    },

    rating: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
      },
      count: {
        type: Number,
        default: 0
      }
    },
    
    minOrderAmount: {
      type: Number,
      default: 0
    },

    deliveryTimeMins: {
      type: Number,
      default: 0
    },

    deliveryFee: {
      type: Number,
      default: 0
    },

    isActive: {
      type: Boolean,
      default: true
    },

    isApproved: {
      type: Boolean,
      default: false
    },

    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

/* ---------------- INDEXES ---------------- */

restaurantSchema.index({ "location.geo": "2dsphere" });

/* ---------------- MODEL ---------------- */

export const Restaurant: Model<IRestaurant> = mongoose.model<IRestaurant>(
  "Restaurant",
  restaurantSchema
);