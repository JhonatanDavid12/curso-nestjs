import { Body, ConflictException, Inject, Injectable, Param, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PermissionsService } from '../permissions/permissions.service';
import { Role } from './schemas/role.schema';
import { RoleDto } from './dto/role-dto';
import { PermissionDto } from '../permissions/dto/permission-dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class RolesService {

    /**
     * @InjectModel(Role.name) = Inyecta el modelo de Role
     * @Inject(forwardRef(() => UsersService)) = Evita dependencias circulares
     */
    constructor(
        @InjectModel(Role.name) private roleModel: Model<Role>,
        private permissionService: PermissionsService,
        @Inject(forwardRef(() => UsersService))
        private usersService: UsersService
    ) {

    }

    async createRole(role: RoleDto) {

        // Buscamos si existe un rol
        const roleExists = await this.findRoleByName(role.name);

        // Si existe el rol, lanzamos excepción
        if (roleExists) {
            throw new ConflictException('El rol ya existe');
        }

        const permissionsRole: Types.ObjectId[] = [];
        // Si el rol tiene permisos, los comprobamos
        if (role.permissions && role.permissions.length > 0) {

            // Recorremos los permisos para comprobar si son correctos
            for (const permission of role.permissions) {

                // Busco un permiso
                const permissionFound = await this.permissionService.findPermissionbyName(permission.name);

                if (!permissionFound) { // Sino existe, lanzamos excepcion
                    throw new ConflictException(`El permiso ${permission.name} no existe`)
                }

                // Si existe, lo guardamos en el array
                permissionsRole.push(permissionFound._id);

            }

        }

        // Creamos el documento
        const r = new this.roleModel({
            name: role.name,
            permissions: permissionsRole
        });

        // Guardamos el documento
        await r.save();

        // Devolvemos el documento populado con los permisos
        return this.findRoleByName(role.name);

    }

    /**
     * Obtiene los roles, pudiendo filtrar por el nombre
     * @param name 
     * @returns 
     */
    getRoles(name: string) {
        // Creo un filtro vacio
        const filter = {}
        // Si existe el nombre
        if (name) {
            // Relleno el filtro
            filter['name'] = {
                $regex: name.trim(),
                $options: 'i'
            }
        }
        // Filtro los roles y populo
        return this.roleModel.find(filter).populate('permissions');
    }

    /**
     * Busco el rol por nombre
     * @param name 
     * @returns 
     */
    findRoleByName(name: string) {
        return this.roleModel.findOne({
            name
        }).populate('permissions');
    }

    /**
     * Actualiza un rol
     * @param name 
     * @param role 
     * @returns 
     */
    async updateRole(name: string, role: RoleDto) {

        // Buscamos si existe un rol
        const roleExists = await this.findRoleByName(name);

        // Si existe
        if (roleExists) {

            // Buscamos si existe el nuevo rol
            const newRoleExists = await this.findRoleByName(role.name);

            // Si el nuevo rol existe y es diferente al nombre del rol original, quiere decir que el rol ya existe
            if (newRoleExists && newRoleExists.name != name) {
                throw new ConflictException(`El rol ${newRoleExists.name} ya existe`)
            }

            const permissionsRole: Types.ObjectId[] = [];
            if (role.permissions && role.permissions.length > 0) {

                // Recorremos los permisos para comprobar si son correctos
                for (const permission of role.permissions) {

                    // Busco un permiso
                    const permissionFound = await this.permissionService.findPermissionbyName(permission.name);

                    if (!permissionFound) { // Sino existe, lanzamos excepcion
                        throw new ConflictException(`El permiso ${permission.name} no existe`)
                    }

                    // Si existe, lo guardamos en el array
                    permissionsRole.push(permissionFound._id);

                }

            }

            // Actualizamos el rol
            await roleExists.updateOne({
                name: role.name,
                permissions: permissionsRole
            })
            // Devuelvo el rol actualizado
            return this.findRoleByName(role.name);

        } else { // Sino existe, creamos el rol
            return this.createRole(role);
        }

    }

    async addPermission(name: string, permission: PermissionDto) {

        // Buscamos si existe un rol
        const roleExists = await this.findRoleByName(name);

        // Si existe un rol
        if (roleExists) {

            // Buscamos si el permiso existe
            const permissionExists = await this.permissionService.findPermissionbyName(permission.name);

            // Si el permiso existe
            if (permissionExists) {

                // Buscamos si existe ese permiso
                const permissionRoleExists = await this.roleModel.findOne({
                    name: roleExists.name,
                    permissions: {
                        $in: permissionExists._id
                    }
                })
                // Si no existe ese permiso en el rol, lo añado
                if (!permissionRoleExists) {
                    // Actualizo el rol
                    // $push: añade un elemento del array
                    await roleExists.updateOne({
                        $push: {
                            permissions: permissionExists._id
                        }
                    });
                    return this.findRoleByName(name);
                } else { // Si existe dentro del rol, lanzamos excepción
                    throw new ConflictException('El permiso ya existe en el rol');
                }

            } else { // Sino existe, lanzamos excepción
                throw new ConflictException('El permiso no existe');
            }

        } else { // Sino existe, lanzamos excepción
            throw new ConflictException('El rol no existe');
        }

    }

    /**
     * Elimina un permiso
     * @param name 
     * @param permission 
     * @returns 
     */
    async removePermission(name: string, permission: PermissionDto) {

        // Buscamos si el rol existe
        const roleExists = await this.findRoleByName(name);

        // Si existe el rol
        if (roleExists) {

            // Buscamos si existe el permiso
            const permissionExists = await this.permissionService.findPermissionbyName(permission.name);

            // Si existe el permiso
            if (permissionExists) {

                // Buscamos si esta el permiso en el rol, buscamos en que indice esta
                const permissionRoleExists = await this.roleModel.findOne({
                    name: roleExists.name,
                    permissions: {
                        $in: permissionExists._id
                    }
                })

                // Si el permiso existe, lo eliminamos y actualizamos
                if (permissionRoleExists) {
                    // Actualizo el rol
                    // $pull: elimina un elemento del array
                    await roleExists.updateOne({
                        $pull: {
                            permissions: permissionExists._id
                        }
                    });
                    return this.findRoleByName(name);
                } else { // Sino existe, lanzamos excepcion
                    throw new ConflictException('El permiso no existe en el rol');
                }

            } else { // Sino existe, lanzamos excepcion
                throw new ConflictException('El permiso no existe');
            }

        } else { // Sino existe, lanzamos excepcion
            throw new ConflictException('El rol no existe');
        }

    }

    /**
     * Borra un rol
     * @param name 
     * @returns 
     */
    async deleteRole(name: string) {

        // Buscamos si el rol existe
        const roleExists = await this.findRoleByName(name);

        if (roleExists) {

            // Obtenemos el numero de usuario con ese rol
            const numberUsers = await this.usersService.numberUsersWithRole(name);

            // Si el numero de usuario es mayor que 0, lanzamos excepcion
            if (numberUsers > 0) {
                throw new ConflictException(`Existen usuarios con el rol ${name}`);
            }
            
            // Borramos el rol
            return roleExists.deleteOne();
        } else {
            throw new ConflictException('El rol no existe');
        }

    }

}
