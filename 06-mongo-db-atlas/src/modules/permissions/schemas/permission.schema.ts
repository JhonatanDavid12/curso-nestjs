import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema()
export class Permission {

    @Prop({ unique: true, uppercase: true, required: true, trim: true })
    name: string;

}

export const permissionSchema = SchemaFactory.createForClass(Permission);