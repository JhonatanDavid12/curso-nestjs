import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PermissionDto } from './dto/permission-dto';
import { UpdatePermissionDto } from './dto/permission-update.dto';

@Controller('/api/v1/permissions')
@ApiTags('Permissions')
export class PermissionsController {

    constructor(private permissionsService: PermissionsService){}

    @Post()
    @ApiOperation({
        description: 'Crea un permiso'
    })
    @ApiBody({
        description: ' Crea un permiso usando un PermissionDto',
        type: PermissionDto,
        examples: {
            ejemplo1: {
                value: {
                    name: 'CREATE'
                }
            },
            ejemplo2: {
                value: {
                    name: 'DELETE'
                }
            }
        }
    })
    @ApiResponse({
        status: 201,
        description: 'Permiso creado correctamente'
    })
    @ApiResponse({
        status: 409,
        description: 'Permiso existe'
    })
    createPermission(@Body() permission: PermissionDto){
        return this.permissionsService.createPermission(permission);
    }

    @Get()
    @ApiOperation({
        description: 'Devuelve los permisos filtrados por un nombre'
    })
    @ApiQuery({
        description: 'Devuelve los permisos filtrados por un nombre. Sino se da un nombre, devuelve todos',
        type: String,
        required: false,
        name: 'name'
    })
    @ApiResponse({
        status: 200,
        description: 'Permisos devueltos correctamente'
    })
    getPermissions(@Query('name') name: string){
        return this.permissionsService.getPermissions(name);
    }

    @Put()
    @ApiOperation({
        description: 'Actualiza un permiso'
    })
    @ApiBody({
        description: ' Actualiza un permiso usando un UpdatePermissionDto',
        type: UpdatePermissionDto,
        examples: {
            ejemplo1: {
                value: {
                    originalName: 'CREATE',
                    newName: 'DELETE'
                }
            }
        }
    })
    @ApiResponse({
        status: 200,
        description: 'Permiso actualizado correctamente'
    })
    @ApiResponse({
        status: 409,
        description: 'Ambos permisos existen'
    })
    updatePermission(@Body() updatePermission: UpdatePermissionDto){
        return this.permissionsService.updatePermission(updatePermission);
    }

    @Delete("/:name")
    @ApiOperation({
        description: 'Borra el permiso dado un nombre'
    })
    @ApiParam({
        description: 'Nombre del permiso a borrar',
        type: String,
        required: true,
        name: 'name'
    })
    @ApiResponse({
        status: 200,
        description: 'Permisos borrado correctamente'
    })
    @ApiResponse({
        status: 409,
        description: 'El permiso no existe'
    })
    deletePermission(@Param('name') name: string){
        return this.permissionsService.deletePermission(name);
    }

}
