import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { IRating } from "../restaurant/restaurant.schema";

/* =====================================================
   VARIANT TYPES
===================================================== */

interface IVariant {
  name: string;
  priceModifier: number;
  isDefault: boolean;
  isAvailable: boolean;
}

export interface IVariantGroup {
  name: string;
  isRequired: boolean;
  options: Types.DocumentArray<VariantSubdoc>;
}

type VariantSubdoc = Types.Subdocument & IVariant;
type VariantGroupSubdoc = Types.Subdocument & IVariantGroup;

/* =====================================================
   ADDON TYPES
===================================================== */

export interface IAddon {
  name: string;
  price: number;
  isAvailable: boolean;
}

export interface IAddonGroup {
  name: string;
  isRequired: boolean;
  minSelect: number;
  maxSelect: number;
  options: Types.DocumentArray<AddonSubdoc>;
}

type AddonSubdoc = Types.Subdocument & IAddon;
type AddonGroupSubdoc = Types.Subdocument & IAddonGroup;

/* =====================================================
   AVAILABILITY TYPES
===================================================== */

export interface ITimeSlot {
  startTime: string;
  endTime: string;
}

export interface IDayAvailability {
  day: number; // 0 (Sun) - 6 (Sat)
  isOpen: boolean;
  slots: ITimeSlot[];
}

export interface IAvailabilitySchedule {
  alwaysAvailable: boolean;
  days: IDayAvailability[];
}

type TimeSlotSubdoc = Types.Subdocument & ITimeSlot;
type DayAvailabilitySubdoc = Types.Subdocument & IDayAvailability;
type AvailabilityScheduleSubdoc = Types.Subdocument &
  IAvailabilitySchedule;

/* =====================================================
   MENU ITEM
===================================================== */

export interface IMenuItem extends Document {
  restaurantId: Schema.Types.ObjectId;
  categoryId: Schema.Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  imageUrl: string;
  basePrice: number;
  isVeg: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  sortOrder: number;
  isFeatured: boolean;
  rating: IRating;
  isAvailable: boolean;
  tags: string[];
  calories: number;
  variantGroups: Types.DocumentArray<VariantGroupSubdoc>;
  addonGroups: Types.DocumentArray<AddonGroupSubdoc>;
  availabilitySchedule: AvailabilityScheduleSubdoc;
  createdAt: Date;
  updatedAt: Date;
}

/* =====================================================
   SCHEMAS
===================================================== */

// ── Variant ────────────────────────────────────────────
const variantSchema = new Schema<VariantSubdoc>(
  {
    name: { type: String, required: true },
    priceModifier: { type: Number, default: 0 },
    isDefault: { type: Boolean, default: false },
    isAvailable: { type: Boolean, default: true },
  },
  { _id: true }
);

// ── Variant Group ──────────────────────────────────────
const variantGroupSchema = new Schema<VariantGroupSubdoc>(
  {
    name: { type: String, required: true },
    isRequired: { type: Boolean, default: true },
    options: { type: [variantSchema], default: [] },
  },
  { _id: true }
);

// ── Addon ──────────────────────────────────────────────
const addonSchema = new Schema<AddonSubdoc>(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    isAvailable: { type: Boolean, default: true },
  },
  { _id: true }
);

// ── Addon Group ────────────────────────────────────────
const addonGroupSchema = new Schema<AddonGroupSubdoc>(
  {
    name: { type: String, required: true },

    isRequired: { type: Boolean, default: false },

    minSelect: { type: Number, default: 0 },

    maxSelect: {
      type: Number,
      default: 1,
      validate: {
        validator: function (this: IAddonGroup, value: number) {
          return value >= this.minSelect;
        },
        message: "maxSelect must be >= minSelect",
      },
    },

    options: {
      type: [addonSchema],
      default: [],
    },
  },
  { _id: true }
);

// ── Rating ─────────────────────────────────────────────
const ratingSchema = new Schema(
  {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 },
  },
  { _id: false }
);

// ── Time Slot ──────────────────────────────────────────
const timeSlotSchema = new Schema<TimeSlotSubdoc>(
  {
    startTime: { type: String, required: true },
    endTime: {
      type: String,
      required: true,
      validate: {
        validator: function (this: ITimeSlot) {
          return this.endTime > this.startTime;
        },
        message: "endTime must be greater than startTime",
      },
    },
  },
  { _id: false }
);

// ── Day Availability ───────────────────────────────────
const dayAvailabilitySchema = new Schema<DayAvailabilitySubdoc>(
  {
    day: {
      type: Number,
      required: true,
      min: 0,
      max: 6,
    },

    isOpen: {
      type: Boolean,
      default: true,
    },

    slots: {
      type: [timeSlotSchema],
      default: [],
    },
  },
  { _id: false }
);

// ── Availability Schedule ──────────────────────────────
const availabilityScheduleSchema = new Schema<AvailabilityScheduleSubdoc>(
  {
    alwaysAvailable: {
      type: Boolean,
      default: true,
    },

    days: {
      type: [dayAvailabilitySchema],
      default: [],
    },
  },
  { _id: false }
);

/* =====================================================
   MENU ITEM SCHEMA
===================================================== */

const menuItemSchema = new Schema<IMenuItem>(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },

    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "MenuCategory",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      trim: true,
    },

    description: String,

    imageUrl: {
      type: String,
      required: true,
    },

    basePrice: {
      type: Number,
      required: true,
    },

    isVeg: {
      type: Boolean,
      required: true,
    },

    isVegan: {
      type: Boolean,
      default: false,
    },

    isGlutenFree: {
      type: Boolean,
      default: false,
    },

    sortOrder: {
      type: Number,
      default: 0,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    rating: {
      type: ratingSchema,
      default: () => ({}),
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },

    tags: {
      type: [String],
      default: [],
    },

    calories: Number,

    variantGroups: {
      type: [variantGroupSchema],
      default: [],
    },

    addonGroups: {
      type: [addonGroupSchema],
      default: [],
    },

    availabilitySchedule: {
      type: availabilityScheduleSchema,
      default: () => ({ alwaysAvailable: true }),
    },
  },
  { timestamps: true }
);

/* =====================================================
   INDEXES
===================================================== */

// Unique slug per restaurant
menuItemSchema.index({ slug: 1, restaurantId: 1 }, { unique: true });

// Text search
menuItemSchema.index({ name: "text", tags: "text" });

/* =====================================================
   MODEL
===================================================== */

const MenuItem: Model<IMenuItem> = mongoose.model<IMenuItem>(
  "MenuItem",
  menuItemSchema
);

export default MenuItem;