import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICategory extends Document {
  restaurantId: Schema.Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  sortOrder: number;
  parentId?: Schema.Types.ObjectId | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const menuCategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true },

    slug: { type: String },

    description: { type: String },

    imageUrl: { type: String },

    isActive: { type: Boolean, default: true },

    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },

    sortOrder: { type: Number, default: 0 },

    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MenuCategory",
      default: null,
      index: true,
    },
  },
  { timestamps: true }
);

menuCategorySchema.index(
  { name: 1, restaurantId: 1, parentId: 1 },
  { unique: true }
);

// Auto slug
menuCategorySchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, "-");
  }
  next();
});

const MenuCategory: Model<ICategory> = mongoose.model<ICategory>(
  "MenuCategory",
  menuCategorySchema
);

export default MenuCategory;