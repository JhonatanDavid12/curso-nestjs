import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";

@Schema()
export class Role {

    @Prop({ unique: true, uppercase: true, trim: true })
    name: string;

    @Prop({ type: [Types.ObjectId], ref: 'Permission', default: [] })
    permissions: Types.ObjectId[];

}

export const roleSchema = SchemaFactory.createForClass(Role);