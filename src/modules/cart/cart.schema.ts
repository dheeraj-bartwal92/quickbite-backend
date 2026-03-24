import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { ICart, ICartItem, IPricing, ISelectedAddon, ISelectedVariant } from "./cart.types";

const cartItemSchema = new Schema<ICartItem>({
    basePrice: {}
});

const priceSchema = new Schema<IPricing>({
    deliveryFee: {
    type: Number,
    default: 0
    },
    discount: {
    type: Number,
    default: 0
    },
    gstAmount:{
    type: Number,
    default: 0
    },
    packagingFee:{
    type: Number,
    default: 0
    },
    platformFee:{
    type: Number,
    default: 0
    },
    subtotal:{
    type: Number,
    default: 0
    },
    totalAmount:{
    type: Number,
    default: 0
    },
});

const cartSchema = new Schema<ICart>({
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        unique: true,
    },

    restaurantId: {
        type: Schema.Types.ObjectId,
        required: true,
    },

    restaurantName: {
        type: String,
        required: true,
    },

    items: {
        type: [],
        default: [],
        validate: {
            validator:function (items) { return items.length <= 50 },
            message:   'Cart cannot have more than 50 items'
        }
    },

    pricing: {
      type: priceSchema,
      default: null
    },

    expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    index: { expireAfterSeconds: 0 }
  }
}, { timestamps: true })