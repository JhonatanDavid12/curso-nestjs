import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDate, IsEmail, IsNotEmpty, IsObject, IsOptional, IsString } from "class-validator";
import { RoleDto } from "src/modules/roles/dto/role-dto";

export class UserDto {

    @ApiProperty({
        name: 'name',
        type: String,
        required: true,
        description: 'Nombre del usuario'
    })
    @IsString()
    @IsNotEmpty()
    name!: string;

    @ApiProperty({
        name: 'email',
        type: String,
        required: true,
        description: 'Email del usuario'
    })
    @IsEmail()
    @IsNotEmpty()
    email!: string;

    @ApiProperty({
        name: 'birthdate',
        type: Date,
        required: true,
        description: 'Fecha de cumpleaños del usuario'
    })
    @Type(() => Date)
    @IsDate()
    @IsNotEmpty()
    birthdate!: Date;

    @ApiProperty({
        name: 'role',
        type: RoleDto,
        required: false,
        description: 'Rol del usuario'
    })
    @Type(() => RoleDto)
    @IsOptional()
    @IsObject()
    role?: RoleDto;


}