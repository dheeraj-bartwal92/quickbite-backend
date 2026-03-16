import mongoose, { Schema, Document, Model } from "mongoose";

const deviceType = {
    MOBILE: "mobile",
    TABLET: "tablet",
    DESKTOP: "desktop",
} as const;

export type DeviceType = (typeof deviceType)[keyof typeof deviceType];

interface IDeviceInfo {
    deviceType?: DeviceType;
    ip?: string;
    userAgent?: string;
}

export interface ISession extends Document {
    userId: mongoose.Types.ObjectId;
    refreshToken: string;
    deviceInfo?: IDeviceInfo;
    expireAt: Date;
    isRevoked: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const sessionSchema = new Schema<ISession>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    refreshToken: {
        type: String,
        required: true,
        unique: true,
    },

    deviceInfo: {
        deviceType: {
            type: String,
            enum: ["mobile", "tablet", "desktop"],
            default: 'mobile'
        },
        userAgent: String,
        ip: String,
    },

    expireAt: {
        type: Date,
        required: true,
        index: { expireAfterSeconds: 0 }
    },

    isRevoked: {
        type: Boolean,
        default: false,
    }
}, { timestamps: true });


const Session: Model<ISession> = mongoose.model<ISession>("Session",sessionSchema);

export default Session;