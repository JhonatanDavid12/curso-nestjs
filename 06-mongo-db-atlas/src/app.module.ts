import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import configuration from './configuration/configuration';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { RolesModule } from './modules/roles/roles.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
      envFilePath: `./env/${process.env.NODE_ENV}.env`
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: `mongodb+srv://${configService.get('mongo.user')}:${configService.get('mongo.password')}@${configService.get('mongo.host')}/${configService.get('mongo.database')}?authSource=admin`
      })
      /* useFactory: (configService: ConfigService) => ({
        uri: `mongodb+srv://admin:jhonatan123456789@cluster0.cs8wycg.mongodb.net/users?authSource=admin`
      }) */
    }),
    PermissionsModule,
    RolesModule,
    UsersModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
