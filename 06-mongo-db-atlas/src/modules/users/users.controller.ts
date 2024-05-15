import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UserDto } from './dto/user-dto';
import { GreaterZeroPipe } from 'src/pipes/greater-zero/greater-zero.pipe';
import { UserRoleDto } from './dto/user-role-dto';

@Controller('/api/v1/users')
@ApiTags('Users')
export class UsersController {

    constructor(private userService: UsersService) { }

    @Post()
    @ApiOperation({
        description: 'Crea un usuario'
    })
    @ApiBody({
        type: UserDto,
        description: 'Crea un usuario usando un UserDto',
        examples: {
            ejemplo1:{
                value: {
                    name: "User1",
                    email: "test1@gmail.com",
                    birthdate: "1990-02-05",
                    role: {
                        name: "ADMIN"
                    }
                }
            },
            ejemplo2:{
                value: {
                    name: "User2",
                    email: "test2@gmail.com",
                    birthdate: "1995-02-05",
                    role: null
                }
            }
        }
    })
    @ApiResponse({
        status: 201,
        description: 'Usuario creado correctamente'
    })
    @ApiResponse({
        status: 409,
        description: `El email del usuario ya existe<br/>
                        El rol no existe`
    })
    createUser(@Body() user: UserDto) {
        return this.userService.createUser(user);
    }

    @Get()
    @ApiQuery({
        name: 'page',
        type: Number,
        required: false,
        description: 'Pagina actual'
    })
    @ApiQuery({
        name: 'size',
        type: Number,
        required: false,
        description: 'Numero de elementos a mostrar',
    })
    @ApiQuery({
        name: 'sortBy',
        type: String,
        required: false,
        description: 'Propiedad por la que ordenar'
    })
    @ApiQuery({
        name: 'sort',
        type: String,
        required: false,
        description: 'Modo de ordenamiento (ASC o DESC)'
    })
    @ApiOperation({
        description: 'Devuelve todos los usuarios'
    })
    @ApiResponse({
        status: 200,
        description: 'Usuarios devueltos correctamente'
    })
    getUsers(
        @Query('page', GreaterZeroPipe) page: number,
        @Query('size', GreaterZeroPipe) size: number,
        @Query('sortBy') sortBy: string,
        @Query('sort') sort: string
    ) {
        return this.userService.getUsers(page, size, sortBy, sort);
    }

    @Get('/actives')
    @ApiQuery({
        name: 'page',
        type: Number,
        required: false,
        description: 'Pagina actual'
    })
    @ApiQuery({
        name: 'size',
        type: Number,
        required: false,
        description: 'Numero de elementos a mostrar',
    })
    @ApiQuery({
        name: 'sotBy',
        type: String,
        required: false,
        description: 'Propiedad por la que ordenar'
    })
    @ApiQuery({
        name: 'sort',
        type: String,
        required: false,
        description: 'Modo de ordenamiento (ASC o DESC)'
    })
    @ApiOperation({
        description: 'Devuelve todos los usuarios activos'
    })
    @ApiResponse({
        status: 200,
        description: 'Usuarios activos devueltos correctamente'
    })
    getUsersActives(
        @Query('page', GreaterZeroPipe) page: number,
        @Query('size', GreaterZeroPipe) size: number,
        @Query('sortBy') sortBy: string,
        @Query('sort') sort: string
    ) {
        return this.userService.getUsers(page, size, sortBy, sort, false);
    }

    @Get('/deleted')
    @ApiQuery({
        name: 'page',
        type: Number,
        required: false,
        description: 'Pagina actual'
    })
    @ApiQuery({
        name: 'size',
        type: Number,
        required: false,
        description: 'Numero de elementos a mostrar',
    })
    @ApiQuery({
        name: 'sortBy',
        type: String,
        required: false,
        description: 'Propiedad por la que ordenar'
    })
    @ApiQuery({
        name: 'sort',
        type: String,
        required: false,
        description: 'Modo de ordenamiento (ASC o DESC)'
    })
    @ApiOperation({
        description: 'Devuelve todos los usuarios borrados'
    })
    @ApiResponse({
        status: 200,
        description: 'Usuarios borrados devueltos correctamente'
    })
    getUsersDeleted(
        @Query('page', GreaterZeroPipe) page: number,
        @Query('size', GreaterZeroPipe) size: number,
        @Query('sortBy') sortBy: string,
        @Query('sort') sort: string
    ) {
        return this.userService.getUsers(page, size, sortBy, sort, true);
    }

    @Put('/:usercode')
    @ApiOperation({
        description: 'Actualiza un usuario'
    })
    @ApiParam({
        name: 'usercode',
        type: Number,
        required: true,
        description: 'Codigo del usuario'
    })
    @ApiBody({
        type: UserDto,
        description: '',
        examples: {
            ejemplo1:{
                value: {
                    name: "User2",
                    email: "f@gmail.com",
                    birthdate: "1990-22-05",
                    role: null
                }
            },
            ejemplo2:{
                value: {
                    name: "User3",
                    email: "f2@gmail.com",
                    birthdate: "1995-02-05",
                    role: {
                        name: "ADMIN"
                    }
                }
            }
        }
    })
    @ApiResponse({
        status: 200,
        description: 'Usuario actualizado correctamente'
    })
    @ApiResponse({
        status: 409,
        description: `El email ya existe<br/>
        El rol no existe`
    })
    updateUser(@Param('usercode') userCode: number, @Body() user: UserDto) {
        return this.userService.updateUser(userCode, user);
    }

    @Patch('/add-role')
    @ApiOperation({
        description: 'Añade un rol a un usuario'
    })
    @ApiBody({
        type: UserRoleDto,
        description: 'Añade un rol a un usuario mediante un UserRoleDto',
        examples: {
            ejemplo1: {
                value: {
                    userCode: 1,
                    roleName: "ADMIN"
                }
            }
        }
    })
    @ApiResponse({
        status: 200,
        description: 'Rol añadido correctamente al usuario'
    })
    @ApiResponse({
        status: 409,
        description: `El usuario ya tiene rol<br/>
                        El rol no existe<br/>
                        El usuario no existe<br/>`
    })
    addRole(@Body() userRole: UserRoleDto) {
        return this.userService.addRole(userRole);
    }

    @Patch('/remove-role/:usercode')
    @ApiOperation({
        description: 'Elimina el rol de un usuario'
    })
    @ApiParam({
        name: 'usercode',
        type: Number,
        required: true,
        description: 'Codigo del usuario que vamos a eliminar su rol'
    })
    @ApiResponse({
        status: 200,
        description: 'Rol eliminado del usuario'
    })
    @ApiResponse({
        status: 409,
        description: `El rol no existe<br/>
                        El usuario no existe`
    })
    removeRole(@Param('usercode') userCode: number) {
        return this.userService.removeRole(userCode);
    }

    @Patch('/restore/:usercode')
    @ApiOperation({
        description: 'Restaura un usuario'
    })
    @ApiParam({
        name: 'usercode',
        type: Number,
        required: true,
        description: 'Codigo del usuario que vamos a restaurar'
    })
    @ApiResponse({
        status: 200,
        description: 'Usuario restaurado'
    })
    @ApiResponse({
        status: 409,
        description: `El usuario no esta borrado<br/>
                        El usuario no existe`
    })
    restoreUser(@Param('usercode') userCode: number) {
        return this.userService.restoreUser(userCode);
    }

    @Delete('/:usercode')
    @ApiOperation({
        description: 'Elimina un usuario'
    })
    @ApiParam({
        name: 'usercode',
        type: Number,
        required: true,
        description: 'Codigo del usuario que vamos a eliminar'
    })
    @ApiResponse({
        status: 200,
        description: 'Usuario borrado'
    })
    @ApiResponse({
        status: 409,
        description: `El usuario ya esta borrado<br/>
                        El usuario no existe`
    })
    deleteUser(@Param('usercode') userCode: number) {
        return this.userService.deleteUser(userCode);
    }

}
