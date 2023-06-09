import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { Announce, AnnounceSchema, AnnounceDao } from "dao/announce";
import { Config, ConfigSchema, ConfigDao } from "dao/config";
import { Contact, ContactSchema, ContactDao } from "dao/contact";
import { Corp, CorpSchema, CorpDao } from "dao/corp";
import { BrandRole, BrandRoleSchema, BrandRoleDao } from "dao/role";
import { Warehouse, WarehouseSchema, WarehouseDao } from "dao/warehouse";
import { Area, AreaSchema, AreaDao } from "dao/area";

import { LogRemote } from "remote/log";
import { UserRemote } from "remote/user";
import { MarketRemote } from "remote/market";
import { CorpService } from "src/corp/service";

import { AnnounceController } from "src/announce/controller.rest";
import { BrandConfigController } from "src/config/controller.rest";
import { ContactController } from "src/contact/controller.rest";
import { CorpController } from "src/corp/controller.rest";
import { BrandRoleController } from "src/role/controller.rest";
import { WarehouseController } from "src/warehouse/controller.rest";
import { AreaController } from "src/area/controller.rest";

import { CorpRpc } from "src/corp/controller.rpc";
import { ContactRpc } from "src/contact/controller.rpc";
import { BrandRoleRpc } from "src/role/controller.rpc";
import { AreaRpc } from "src/area/controller.rpc";

@Module({
    imports: [
        MongooseModule.forRoot("mongodb://127.0.0.1:27017/qqlx"),
        MongooseModule.forFeature([
            { name: Announce.name, schema: AnnounceSchema },
            { name: Config.name, schema: ConfigSchema },
            { name: Contact.name, schema: ContactSchema },
            { name: Corp.name, schema: CorpSchema },
            { name: BrandRole.name, schema: BrandRoleSchema },
            { name: Warehouse.name, schema: WarehouseSchema },
            { name: Area.name, schema: AreaSchema },
        ]),
    ],
    controllers: [
        AnnounceController,
        BrandConfigController,
        ContactController,
        CorpController,
        BrandRoleController,
        WarehouseController,
        AreaController,
        //
        CorpRpc,
        ContactRpc,
        BrandRoleRpc,
        AreaRpc,
    ],
    providers: [
        AnnounceDao,
        ConfigDao,
        ContactDao,
        CorpDao,
        BrandRoleDao,
        WarehouseDao,
        AreaDao,
        //
        LogRemote,
        UserRemote,
        MarketRemote,
        //
        CorpService,
    ],
})
export class AppModule {}
