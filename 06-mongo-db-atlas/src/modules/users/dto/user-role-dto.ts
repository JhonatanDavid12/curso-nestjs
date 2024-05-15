import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsPositive, IsString, IsUppercase } from "class-validator";

export class UserRoleDto {

    @ApiProperty({
        name: 'userCode',
        type: Number,
        required: true,
        description: 'Codigo del usuario al que añadir el rol'
    })
    @IsNumber()
    @IsPositive()
    @IsNotEmpty()
    userCode: number;
    
    @ApiProperty({
        name: 'roleName',
        type: String,
        required: true,
        description: 'Nombre del rol a añadir'
    })
    @IsString()
    @IsUppercase()
    @IsNotEmpty()
    roleName: string;

}