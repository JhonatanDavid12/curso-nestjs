import { ConflictException, Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { RolesService } from '../roles/roles.service';
import { User } from './schemas/user.schema';
import { UserDto } from './dto/user-dto';
import { UserRoleDto } from './dto/user-role-dto';

@Injectable()
export class UsersService {

    /**
     *  @InjectModel(User.name) = Inyecta el modelo de User
     *  @Inject(forwardRef(() => RolesService)) = Evita dependencias circulares
     */
    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
        @Inject(forwardRef(() => RolesService))
        private roleService: RolesService
    ) { }

    /**
     * Crea un usuario
     * @param user 
     * @returns 
     */
    async createUser(user: UserDto) {

        // Buscamos si existe el usuario
        const userExists = await this.findUserByEmail(user.email);

        // Si existe el usuario, lanzamos una excepción
        if (userExists) {
            throw new ConflictException(`El usuario con email ${user.email} ya existe`);
        }

        let roleId: Types.ObjectId = null;
        // Si el usuario tiene un rol
        if (user.role) {

            // Buscamos si existe el rol
            const roleExists = await this.roleService.findRoleByName(user.role.name);

            // Sino existe, lanzamos excepción
            if (!roleExists) {
                throw new ConflictException(`El rol ${user.role.name} no existe`);
            } else {
                roleId = roleExists._id;
            }

        }

        // Obtenemos el numero de usuarios
        const nUsers = await this.userModel.countDocuments();

        // Creo el documento, sumandole 1 al numero de usuarios para el usercode
        const userCode = nUsers + 1;

        const u = new this.userModel({
            ...user,
            userCode,
            role: roleId
        });

        // Guardamos el usuario
        await u.save();

        return this.findUserByEmail(user.email);

    }

    /**
     * Busca un usuario por su email
     * @param email 
     * @returns 
     */
    findUserByEmail(email: string) {
        return this.userModel.findOne({
            email
        }).populate({
            path: 'role',
            populate: {
                path: 'permissions',
                model: 'Permission'
            }
        });
    }

    /**
     * Obtiene todos los usuarios, segun se especifique su estado
     * @param page 
     * @param size 
     * @param sortBy 
     * @param sort 
     * @param deleted 
     * @returns 
     */
    async getUsers(page: number, size: number, sortBy: string, sort: string, deleted?: boolean) {

        // Formula para el metodo skip
        const skip = (page - 1) * size;

        // Si le damos un valor a deleted, filtramos por ello
        const findOptions = {};
        if (deleted != undefined) {
            findOptions['deleted'] = deleted;
        }

        // Obtiene el total de elementos
        const total = await this.userModel.countDocuments(findOptions);

        // Calculamos el total de paginas
        // Math.ceil lo que hace es devolver el numero entero mas proximo. 3.3 => 4
        const totalPages = Math.ceil(total / size);

        // Pagina siguiente y previa
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1 && page <= totalPages;
        const nextPage = hasNextPage ? page + 1 : null;
        const prevPage = hasPrevPage ? page - 1 : null;

        // Opciones de ordenacion
        const sortOptions = {};

        if (sortBy && sort) {
            switch (sort.toUpperCase()) {
                case "ASC":
                    sortOptions[sortBy] = 1;
                    break;
                case "DESC":
                    sortOptions[sortBy] = -1;
                    break;
            }
        } else if (sortBy) {
            sortOptions[sortBy] = 1;
        }

        // Obtenemos los usuarios
        const users: User[] = await this.userModel
            .find(findOptions)
            .sort(sortOptions)
            .skip(skip)
            .limit(size)
            .populate({
                path: 'role',
                populate: {
                    path: 'permissions',
                    model: 'Permission'
                }
            });

        // Creamos un objeto con toda la información util
        return {
            content: users,
            page,
            size,
            total,
            totalPages,
            hasNextPage,
            hasPrevPage,
            nextPage,
            prevPage
        }

    }

    /**
     * Buscamos un usuario por codigo de usuario
     * @param userCode 
     * @returns 
     */
    findUserByUserCode(userCode: number) {
        return this.userModel.findOne({
            userCode
        }).populate({
            path: 'role',
            populate: {
                path: 'permissions',
                model: 'Permission'
            }
        });
    }

    /**
     * Actualiza un usuario
     * @param userCode 
     * @param user 
     * @returns 
     */
    async updateUser(userCode: number, user: UserDto) {

        // Comprobamos si el usuario existe
        const userExists = await this.findUserByUserCode(userCode);

        if (userExists) {

            // Si el email es diferente, comprobamos si existe el nuevo email
            if (userExists.email != user.email) {
                const emailExists = await this.findUserByEmail(user.email);

                if (emailExists) {
                    throw new ConflictException(`El email ${user.email} existe`);
                }
            }

            let roleId: Types.ObjectId = null;
            // Si tiene rol, obtenemos la referencia del rol
            if (user.role) {

                // Comprobamos si el rol existe
                const roleExists = await this.roleService.findRoleByName(user.role.name);

                if (!roleExists) {
                    throw new ConflictException(`El rol ${user.role.name} no existe`);
                } else {
                    roleId = roleExists._id;
                }

            }

            // Actualizamos el usuario
            await userExists.updateOne({
                ...user,
                role: roleId
            });

            // Devolvemos el usuario actualizado
            return this.findUserByUserCode(userCode);

        } else { // Sino creamos el usuario
            return this.createUser(user);
        }

    }

    /**
     * Añade un rol al usuario
     * @param userRole 
     * @returns 
     */
    async addRole(userRole: UserRoleDto) {

        // Comprobamos si el usuario existe
        const userExists = await this.findUserByUserCode(userRole.userCode);

        if (userExists) {

            // Si el usuario ya tiene un rol, lanzamos excepcion
            if (userExists.role) {
                throw new ConflictException(`El usuario con el userCode ${userRole.userCode} ya tiene rol`);
            } else {

                // Comprobamos que existe el rol
                const roleExists = await this.roleService.findRoleByName(userRole.roleName);

                if (roleExists) {

                    // Actualizamos el rol
                    await userExists.updateOne({
                        role: roleExists._id
                    })

                    // Devolvemos el usuario actualizado
                    return this.findUserByUserCode(userRole.userCode);

                } else { // Sino existe, lanzamos excepcion
                    throw new ConflictException(`El rol ${userRole.roleName} no existe`);
                }

            }

        } else { // Sino existe, lanzamos excepcion
            throw new ConflictException(`El usuario con el userCode ${userRole.userCode} no existe`);
        }
    }

    /**
     * Elimina un rol de un usuario
     * @param userCode 
     * @returns 
     */
    async removeRole(userCode: number) {

        // Comprobamos si el usuario existe
        const userExists = await this.findUserByUserCode(userCode);

        if (userExists) {

            // Si el usuario tiene un rol, se lo quitamos
            if (userExists.role) {

                // Actualizo el usuario
                await userExists.updateOne({
                    role: null
                })

                // Devuelvo el usuario actualizado
                return this.findUserByUserCode(userCode);

            } else { // Sino existe, lanzamos excepcion
                throw new ConflictException(`El usuario con el userCode ${userCode} no tiene rol`);
            }

        } else { // Sino existe, lanzamos excepcion
            throw new ConflictException(`El usuario con el userCode ${userCode} no existe`);
        }
    }

    /**
     * Borramos el usuario
     * @param userCode 
     * @returns 
     */
    async deleteUser(userCode: number) {

        // Comprobamos si existe el usuario
        const userExists = await this.findUserByUserCode(userCode);

        if (userExists) {

            // Si el usuario esta borrado, lanzamos excepcion
            if (userExists.deleted) {
                throw new ConflictException(`El usuario con el userCode ${userCode} ya esta borrado`);
            } else {

                // Actualizamos el usuario, poniendole la propiedad deleted a true
                await userExists.updateOne({
                    deleted: true
                });

                // Devolvemos el usuario actualizado
                return this.findUserByUserCode(userCode);

            }

        } else { // Sino existe, lanzamos excepcion
            throw new ConflictException(`El usuario con el userCode ${userCode} no existe`);
        }

    }

    /**
     * Restaura a un usuario
     * @param userCode 
     * @returns 
     */
    async restoreUser(userCode: number) {

        // Comprobamos que existe el usuario
        const userExists = await this.findUserByUserCode(userCode);

        if (userExists) {

            // Si el usuario no esta borrado, lanzamos excepcion
            if (!userExists.deleted) {
                throw new ConflictException(`El usuario con el userCode ${userCode} no esta borrado`);
            } else {

                // Actualizamos el usuario, poniendole deleted a false
                await userExists.updateOne({
                    deleted: false
                });

                // Devolvemos el usuario actualizado
                return this.findUserByUserCode(userCode);

            }

        } else { // Sino existe, lanzamos excepcion
            throw new ConflictException(`El usuario con el userCode ${userCode} no existe`);
        }

    }

    /**
     * Devuelve el numero de usuarios con un rol
     * @param roleName 
     * @returns 
     */
    async numberUsersWithRole(roleName: string) {

        /**
        * $lookup = Une una coleccion con la otra
        * $match = Condición que debe cumplir
        * $count = Propiedad donde se guarda la cantidad de usuarios
        */
        const usersWithRole = await this.userModel.aggregate([
            {
                $lookup: {
                    from: 'roles', // Colección que queremos relacionar
                    localField: 'role', // Propiedad de usuario para relacionar con roles
                    foreignField: '_id', // Propiedad de role para relacionar con usuarios
                    as: 'roles' // Nueva propiedad que se crea
                }
            },
            {
                $match: {
                    "roles.name": roleName.trim().toUpperCase()
                }
            },
            {
                $count: "count"
            }
        ])

        // Si hay elementos, obtenemos el valor de count
        if (usersWithRole.length > 0) {
            return usersWithRole[0].count;
        } else {
            return 0;
        }

    }

}
