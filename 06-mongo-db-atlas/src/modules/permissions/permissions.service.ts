import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Permission } from './schemas/permission.schema';
import { Model } from 'mongoose';
import { PermissionDto } from './dto/permission-dto';
import { UpdatePermissionDto } from './dto/permission-update.dto';

@Injectable()
export class PermissionsService {

    /**
     * @InjectModel(Permission.name) = Inyecta el modelo Permission
     */
    constructor(
        @InjectModel(Permission.name) private permissionModel: Model<Permission>
    ) { }

    /**
     * Crea un permiso
     * @param permission 
     * @returns 
     */
    async createPermission(permission: PermissionDto) {

        // Buscamos si existe el permiso
        const permissionExists = await this.findPermissionbyName(permission.name);

        // Si existe, lanzamos excepción
        if (permissionExists) {
            throw new ConflictException("El permiso existe");
        }

        // Creamos una instancia del modelo
        const p = new this.permissionModel(permission);

        return p.save();

    }

    /**
     * Obtiene todos los permisos, pudiendo filtrar por nombre
     * @param name 
     * @returns 
     */
    getPermissions(name: string) {
        // Filtro vacio
        const filter = {}
        // Si existe el nombre, rellenamos el filtro
        if (name) {
            filter['name'] = {
                $regex: name.trim(),
                $options: 'i'
            };
        }
        // Devuelvo los permisos con un filtro
        return this.permissionModel.find(filter);
    }

    /**
    * Actualiza un permiso
    * @param updatePermission 
    * @returns 
    */
    async updatePermission(updatePermission: UpdatePermissionDto) {

        // Buscamos si existe el permiso original
        const permissionExists = await this.findPermissionbyName(updatePermission.originalName);

        // Buscamos si existe el permiso nuevo
        const newPermissionExists = await this.permissionModel.findOne({
            name: updatePermission.newName
        })

        // Si existe el permiso original y no existe el permiso nuevo, quiere decir que se puede actualizar
        if (permissionExists && !newPermissionExists) {

            // Actualizamos el permiso
            await permissionExists.updateOne({
                name: updatePermission.newName
            })
            // Devolvemos el permiso actualizado
            return this.permissionModel.findById(permissionExists._id);

        } else if (!permissionExists) { // Si no existe el permiso original, lo creamos
            // Creo un PermissionDto
            const permission = new PermissionDto();
            permission.name = updatePermission.originalName;
            // Creo el permiso
            return this.createPermission(permission);

        } else {
            throw new ConflictException("No se puede actualizar el permiso");
        }

    }

    /**
     * Borra un permiso
     * @param name 
     * @returns 
     */
    async deletePermission(name: string) {

        // Buscamos un permiso
        const permissionExists = await this.findPermissionbyName(name);

        // Si existe el permiso
        if (permissionExists) {
            // Borramos el permiso
            return permissionExists.deleteOne();
        } else { // Sino existe, lanzamos excepción
            throw new ConflictException('El permiso no existe');
        }

    }

    /**
     * Buscamos el permiso por nombre
     * @param name 
     * @returns 
     */
    findPermissionbyName(name: string) {
        return this.permissionModel.findOne({
            name
        })
    }


}
