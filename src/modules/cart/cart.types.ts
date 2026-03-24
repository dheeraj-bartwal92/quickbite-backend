import { Schema, Document, Types } from "mongoose";

export interface ISelectedAddon {
  addonGroupId?: Types.ObjectId;
  addonGroupName?: string;
  optionId?: Types.ObjectId;
  optionName?: string;
  price: number;
}

export interface ISelectedVariant {
  variantGroupId?: Types.ObjectId;
  variantGroupName?: string;
  optionId?: Types.ObjectId;
  optionName?: string;
  priceModifier: number;
}

export interface ICartItem {
   _id: string;
   itemKey: string;
   menuItemId: Types.ObjectId;
   name: string;
   imageUrl?: string;
   basePrice: number;
   selectedVariant: ISelectedVariant | null;
   selectedAddons: ISelectedAddon[];

   quantity: number;

   unitPrice: number;
   totalPrice: number;
   instructions?: string;
   isAvailable: boolean;
   priceChanged: boolean;
   newPrice?: number | null;
}

export interface IPricing {
  subtotal: number;
  deliveryFee: number;
  platformFee: number;
  gstAmount: number;
  packagingFee: number;
  discount: number;
  totalAmount: number;
}

export interface ICart extends Document {
    userId: Schema.Types.ObjectId;

    restaurantId: Schema.Types.ObjectId;
    restaurantName: string;
    items: Types.DocumentArray<ICartItem>;
    pricing: IPricing;
    selectedAddressId: Schema.Types.ObjectId;
    status: "active" | "checking_out";
    expiresAt: Date;
    updatedAt: Date;
    createdAt: Date;
}