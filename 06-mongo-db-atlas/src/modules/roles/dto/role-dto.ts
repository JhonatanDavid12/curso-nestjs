import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { PermissionDto } from "src/modules/permissions/dto/permission-dto";

export class RoleDto {

    @ApiProperty({
        name: 'name',
        type: String,
        required: true,
        description: 'Nombre del rol'
    })
    @IsString()
    @IsNotEmpty()
    name!: string;

    @ApiProperty({
        name: 'permissions',
        type: PermissionDto,
        isArray: true,
        required: false,
        description: 'Conjunto de permisos'
    })
    @IsArray()
    @IsOptional()
    @Type(() => PermissionDto)
    permissions?: PermissionDto[] = [];

}