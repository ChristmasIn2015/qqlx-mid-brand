import { Controller, Get, Post, Body, Patch, SetMetadata, UseGuards } from "@nestjs/common";

import { MongodbSort, trimObject } from "qqlx-cdk";
import { PATH_BRAND_AREA, ENUM_BRAND_ROLE, postAreaDto, postAreaRes, getAreaDto, getAreaRes, patchAreaDto, patchAreaRes, Area, AreaJoined } from "qqlx-core";
import { BrandDTO } from "qqlx-sdk";

import { BrandGuard, ENUM_BRAND_ROLE_CORE, ENUM_BRAND_ROLE_ALL } from "global/brand.guard";
import { AreaDao } from "dao/area";

@Controller(PATH_BRAND_AREA)
@UseGuards(BrandGuard)
export class AreaController {
    constructor(
        //
        private readonly AreaDao: AreaDao
    ) {}

    @Post()
    @SetMetadata("BrandRole", ENUM_BRAND_ROLE_CORE)
    async postArea(@Body("dto") dto: postAreaDto, @Body("BrandDTO") BrandDTO: BrandDTO): Promise<postAreaRes> {
        if (!dto.houseId) throw new Error("请选择仓库");
        if (!dto.name) throw new Error("请输入货位名称");

        dto.corpId = BrandDTO.corp?._id;
        await this.AreaDao.create(dto);
        return null;
    }

    @Post("/get")
    @SetMetadata("BrandRole", ENUM_BRAND_ROLE_ALL)
    async getArea(@Body("dto") dto: getAreaDto, @Body("BrandDTO") BrandDTO: BrandDTO): Promise<getAreaRes> {
        const match = { corpId: BrandDTO.corp._id };
        const list: AreaJoined[] = await this.AreaDao.aggregate([
            { $match: match },
            { $lookup: { from: "warehouses", localField: "houseId", foreignField: "_id", as: "joinWarehouse" } },
        ]);
        list.forEach((area) => {
            area.joinWarehouse && (area.joinWarehouse = area.joinWarehouse[0]);
        });

        return list;
    }

    @Patch()
    @SetMetadata("BrandRole", ENUM_BRAND_ROLE_CORE)
    async patchArea(@Body("dto") dto: patchAreaDto, @Body("BrandDTO") BrandDTO: BrandDTO): Promise<patchAreaRes> {
        if (!dto.houseId) throw new Error("请选择仓库");
        if (!dto.name) throw new Error("请输入货位名称");
        trimObject(dto);

        const updater = {
            houseId: dto.houseId,
            name: dto.name,
            desc: dto.desc,
            isDisabled: dto.isDisabled,
        };
        await this.AreaDao.updateOne(dto._id, updater);
        return null;
    }
}
