import { Controller, Get, Post, Body, Patch, Delete, SetMetadata, UseGuards } from "@nestjs/common";

import {
    //
    PATH_BRAND_CONFIG,
    ENUM_BRAND_ROLE,
    postConfigCorpDto,
    postConfigCorpRes,
    getConfigCorpDto,
    getConfigCorpRes,
} from "qqlx-core";
import { BrandDTO } from "qqlx-sdk";

import { BrandGuard, ENUM_BRAND_ROLE_ALL } from "global/brand.guard";
import { ConfigDao } from "dao/config";

@Controller(PATH_BRAND_CONFIG)
@UseGuards(BrandGuard)
export class BrandConfigController {
    constructor(
        //
        private readonly ConfigDao: ConfigDao
    ) {}

    @Post()
    @SetMetadata("BrandRole", [ENUM_BRAND_ROLE.ROOT])
    async postConfigCorp(@Body("dto") dto: postConfigCorpDto, @Body("BrandDTO") BrandDTO: BrandDTO): Promise<postConfigCorpRes> {
        const entity = await this.ConfigDao.findOne(BrandDTO.corp._id, "corpId");

        if (entity) {
            await this.ConfigDao.updateOne(entity._id, { titles: String(dto.titles) });
        } else {
            const schema = this.ConfigDao.getSchema();
            schema.corpId = BrandDTO.corp._id;
            schema.titles = String(dto.titles);
            await this.ConfigDao.create(schema);
        }

        return null;
    }

    @Post("/get")
    @SetMetadata("BrandRole", ENUM_BRAND_ROLE_ALL)
    async getConfigCorp(@Body("dto") dto: getConfigCorpDto, @Body("BrandDTO") BrandDTO: BrandDTO): Promise<getConfigCorpRes> {
        const entity = await this.ConfigDao.findOne(BrandDTO.corp._id, "corpId");

        if (entity) {
            return entity;
        } else {
            const schema = this.ConfigDao.getSchema();
            schema.corpId = BrandDTO.corp._id;
            const created = await this.ConfigDao.create(schema);
            return created;
        }
    }
}
