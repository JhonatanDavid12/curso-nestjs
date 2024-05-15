import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";

@Schema()
export class User {

    @Prop({ unique: true })
    userCode: number;

    @Prop({ required: true })
    name: string;

    @Prop({ required: true, unique: true, lowercase: true, trim: true })
    email: string;

    @Prop({ required: true })
    birthdate: Date;

    @Prop({ type: Types.ObjectId, ref: 'Role', default: null })
    role: Types.ObjectId;

    @Prop({ default: false })
    deleted: boolean;

}

export const userSchema = SchemaFactory.createForClass(User);