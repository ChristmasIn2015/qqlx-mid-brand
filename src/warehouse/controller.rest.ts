import { Controller, Get, Post, Body, Patch, SetMetadata, UseGuards } from "@nestjs/common";

import { MongodbSort, trimObject } from "qqlx-cdk";
import {
    PATH_BRAND_WAREHOUSE,
    ENUM_BRAND_ROLE,
    postWarehouseDto,
    postWarehouseRes,
    getWarehouseDto,
    getWarehouseRes,
    patchWarehouseDto,
    patchWarehouseRes,
    Warehouse,
} from "qqlx-core";
import { BrandDTO } from "qqlx-sdk";

import { BrandGuard, ENUM_BRAND_ROLE_ALL } from "global/brand.guard";
import { WarehouseDao } from "dao/warehouse";

@Controller(PATH_BRAND_WAREHOUSE)
@UseGuards(BrandGuard)
export class WarehouseController {
    constructor(
        //
        private readonly WarehouseDao: WarehouseDao
    ) {}

    @Post()
    @SetMetadata("BrandRole", [ENUM_BRAND_ROLE.ROOT])
    async postWarehouse(@Body("dto") dto: postWarehouseDto, @Body("BrandDTO") BrandDTO: BrandDTO): Promise<postWarehouseRes> {
        if (!dto.name) throw new Error("请输入仓库名称");

        const creator = { corpId: BrandDTO.corp._id, name: dto.name, address: dto.address };
        await this.WarehouseDao.create(creator);

        return null;
    }

    @Post("/get")
    @SetMetadata("BrandRole", ENUM_BRAND_ROLE_ALL)
    async getWarehouse(@Body("dto") dto: getWarehouseDto, @Body("BrandDTO") BrandDTO: BrandDTO): Promise<getWarehouseRes> {
        const list = await this.WarehouseDao.query({ corpId: BrandDTO.corp._id }, { sortKey: "timeCreate", sortValue: MongodbSort.ASC });

        // 如果此主体没有任何仓库，则自动为其创建仓库
        if (list.length === 0) {
            const entity = await this.WarehouseDao.create({
                corpId: BrandDTO.corp._id,
                name: "默认仓库（自动创建）",
                address: "默认地址",
            });
            return [entity];
        }

        return list;
    }

    @Patch()
    @SetMetadata("BrandRole", [ENUM_BRAND_ROLE.ROOT])
    async patchWarehouse(@Body("dto") dto: patchWarehouseDto, @Body("BrandDTO") BrandDTO: BrandDTO): Promise<patchWarehouseRes> {
        if (!dto.name) throw new Error("请输入仓库名称");
        trimObject(dto);

        const updater = {
            name: dto.name,
            address: dto.address,
            isDisabled: dto.isDisabled,
        };
        const all: Warehouse[] = await this.WarehouseDao.query({ corpId: BrandDTO.corp._id });
        if (updater.isDisabled === true && all.filter((e) => e.isDisabled === false).length <= 1) {
            throw new Error(`至少需要保留一个仓库`);
        }

        await this.WarehouseDao.updateOne(dto._id, updater);
        return null;
    }
}
