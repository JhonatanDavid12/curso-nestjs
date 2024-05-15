import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class UpdatePermissionDto {

    @ApiProperty({
        name: 'originalName',
        description: 'Nombre del permiso a actualizar',
        required: true,
        type: String
    })
    @IsString()
    @IsNotEmpty()
    originalName: string;

    @ApiProperty({
        name: 'newName',
        description: 'Nuevo mombre del permiso a actualizar',
        required: true,
        type: String
    })
    @IsString()
    @IsNotEmpty()
    newName: string;

}