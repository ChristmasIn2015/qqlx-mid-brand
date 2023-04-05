import { Controller, Get, Post, Body, Patch, Delete, SetMetadata, UseGuards } from "@nestjs/common";

import { trimObject } from "qqlx-cdk";
import {
    PATH_BRAND_ANNOUNCE,
    ENUM_BRAND_ROLE,
    postAnnounceDto,
    postAnnounceRes,
    getAnnounceDto,
    getAnnounceRes,
    patchAnnounceDto,
    patchAnnounceRes,
    deleteAnnounceDto,
    deleteAnnounceRes,
    User,
    Corp,
} from "qqlx-core";
import { BrandDTO } from "qqlx-sdk";

import { BrandGuard, ENUM_BRAND_ROLE_ALL } from "global/brand.guard";
import { AnnounceDao } from "dao/announce";

@Controller(PATH_BRAND_ANNOUNCE)
@UseGuards(BrandGuard)
export class AnnounceController {
    constructor(
        //
        private readonly AnnounceDao: AnnounceDao
    ) {}

    @Post()
    @SetMetadata("BrandRole", [ENUM_BRAND_ROLE.ROOT])
    async postAnnounce(@Body("dto") dto: postAnnounceDto, @Body("BrandDTO") BrandDTO: BrandDTO): Promise<postAnnounceRes> {
        const schema = this.AnnounceDao.getSchema();
        schema.corpId = BrandDTO.corp._id;
        schema.content = dto.content;
        await this.AnnounceDao.create(schema);

        return null;
    }

    @Post("/get")
    @SetMetadata("BrandRole", ENUM_BRAND_ROLE_ALL)
    async getAnnounce(@Body("dto") dto: getAnnounceDto, @Body("BrandDTO") BrandDTO: BrandDTO): Promise<getAnnounceRes> {
        const announces = await this.AnnounceDao.query({ corpId: BrandDTO.corp._id });

        if (announces.length === 0) {
            const schema = this.AnnounceDao.getSchema();
            schema.corpId = BrandDTO.corp._id;
            const created = await this.AnnounceDao.create(schema);
            return [created];
        }

        return announces;
    }

    @Patch()
    @SetMetadata("BrandRole", [ENUM_BRAND_ROLE.ROOT])
    async patchAnnounce(@Body("dto") dto: patchAnnounceDto, @Body("BrandDTO") BrandDTO: BrandDTO): Promise<patchAnnounceRes> {
        const entity = await this.AnnounceDao.findOne(dto._id);
        if (!entity) throw new Error(`找不到公告`);

        await this.AnnounceDao.updateOne(dto._id, { content: dto.content });
        return null;
    }

    @Post("/delete")
    @SetMetadata("BrandRole", [ENUM_BRAND_ROLE.ROOT])
    async deleteAnnounce(@Body("dto") dto: deleteAnnounceDto, @Body("BrandDTO") BrandDTO: BrandDTO): Promise<deleteAnnounceRes> {
        const entity = await this.AnnounceDao.findOne(dto._id);
        if (!entity) throw new Error(`找不到公告`);

        await this.AnnounceDao.delete(entity._id);
        return null;
    }
}
