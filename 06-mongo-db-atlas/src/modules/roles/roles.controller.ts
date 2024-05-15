import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { RoleDto } from './dto/role-dto';
import { PermissionDto } from '../permissions/dto/permission-dto';

@Controller('api/v1/roles')
@ApiTags('Roles')
export class RolesController {

    constructor(private rolesService: RolesService) { }

    @Post()
    @ApiOperation({
        description: 'Crea un nuevo rol'
    })
    @ApiBody({
        type: RoleDto,
        description: 'Crea un nuevo rol mediate un RoleDto',
        examples: {
            ejemplo1: {
                value: {
                    name: "superadmin"
                }
            },
            ejemplo2: {
                value: {
                    name: "admin",
                    permissions: [
                        {
                            name: "CREATE"
                        },
                        {
                            name: "UPDATE"
                        }
                    ]
                }
            }
        }
    })
    @ApiResponse({
        status: 201,
        description: 'Rol creado correctamente'
    })
    @ApiResponse({
        status: 409,
        description: `El rol existe.<br/>
                        El permiso no existe`
    })
    createRole(@Body() role: RoleDto) {
        return this.rolesService.createRole(role);
    }

    @Get()
    @ApiOperation({
        description: 'Devuelve todos los roles pudiendo filtrar por nombre'
    })
    @ApiQuery({
        name: 'name',
        type: String,
        required: false,
        description: 'Filtra roles según el nombre dado'
    })
    @ApiResponse({
        status: 200,
        description: 'Roles devueltos correctamente'
    })
    getRoles(@Query('name') name: string) {
        return this.rolesService.getRoles(name);
    }

    @Put('/:name')
    @ApiOperation({
        description: 'Actualiza un nuevo rol'
    })
    @ApiParam({
        name: 'name',
        type: String,
        required: true,
        description: 'Nombre del rol a actualizar'
    })
    @ApiBody({
        type: RoleDto,
        description: 'Actualiza un nuevo rol mediate un RoleDto',
        examples: {
            ejemplo1: {
                value: {
                    name: "superadmin"
                }
            },
            ejemplo2: {
                value: {
                    name: "admin",
                    permissions: [
                        {
                            name: "CREATE"
                        }
                    ]
                }
            }
        }
    })
    @ApiResponse({
        status: 200,
        description: 'Rol actualizado correctamente'
    })
    @ApiResponse({
        status: 409,
        description: `El nuevo rol ya existe.
        <br/>
        El permiso no existe.`
    })
    updateRole(@Param('name') name: string, @Body() role: RoleDto) {
        return this.rolesService.updateRole(name, role);
    }

    @Patch('/add-permission/:name')
    @ApiOperation({
        description: 'Añade un permiso al rol'
    })
    @ApiParam({
        name: 'name',
        type: String,
        required: true,
        description: 'Nombre del rol para añadir permisos'
    })
    @ApiBody({
        type: PermissionDto,
        description: 'Añade un permiso al rol mediante un PermissionDto',
        examples: {
            ejemplo1: {
                value: {
                    name: "READ"
                }
            }
        }
    })
    @ApiResponse({
        status: 200,
        description: 'Permiso añadido al rol correctamente'
    })
    @ApiResponse({
        status: 409,
        description: `El rol no existe.<br/>
                        El permiso no existe.<br/>
                        El permiso ya existe en el rol.`
    })
    addPermission(@Param('name') name: string, @Body() permission: PermissionDto) {
        return this.rolesService.addPermission(name, permission);
    }

    @Patch('/remove-permission/:name')
    @ApiOperation({
        description: 'Elimina un permiso al rol'
    })
    @ApiParam({
        name: 'name',
        type: String,
        required: true,
        description: 'Nombre del rol para eliminar permisos'
    })
    @ApiBody({
        type: PermissionDto,
        description: 'Elimina un permiso al rol mediante un PermissionDto',
        examples: {
            ejemplo1: {
                value: {
                    name: "READ"
                }
            }
        }
    })
    @ApiResponse({
        status: 200,
        description: 'Permiso eliminado al rol correctamente'
    })
    @ApiResponse({
        status: 409,
        description: `El rol no existe.<br/>
                        El permiso no existe.<br/>
                        El permiso no existe en el rol.`
    })
    removePermission(@Param('name') name: string, @Body() permission: PermissionDto) {
        return this.rolesService.removePermission(name, permission);
    }

    @Delete('/:name')
    @ApiOperation({
        description: 'Elimina un rol'
    })
    @ApiParam({
        name: 'name',
        type: String,
        required: true,
        description: 'Nombre del rol a eliminar'
    })
    @ApiResponse({
        status: 200,
        description: 'Rol eliminado correctamente'
    })
    @ApiResponse({
        status: 409,
        description: `El rol no existe`
    })
    deleteRole(@Param('name') name: string){
        return this.rolesService.deleteRole(name);
    }

}
