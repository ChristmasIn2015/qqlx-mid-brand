import { Controller, Get, Post, Body, Patch, Delete, SetMetadata, UseGuards } from "@nestjs/common";

import {
    PATH_BRAND_ROLE,
    ENUM_BRAND_ROLE,
    postBrandRoleDto,
    postBrandRoleRes,
    getBrandRoleDto,
    getBrandRoleRes,
    deleteBrandRoleDto,
    deleteBrandRoleRes,
    BrandRole,
    BrandRoleJoined,
} from "qqlx-core";
import { BrandDTO } from "qqlx-sdk";

import { BrandGuard, ENUM_BRAND_ROLE_ALL } from "global/brand.guard";
import { UserRemote } from "remote/user";
import { BrandRoleDao } from "dao/role";

@Controller(PATH_BRAND_ROLE)
@UseGuards(BrandGuard)
export class BrandRoleController {
    constructor(
        //
        private readonly UserRemote: UserRemote,
        private readonly BrandRoleDao: BrandRoleDao
    ) {}

    @Post()
    @SetMetadata("BrandRole", [ENUM_BRAND_ROLE.ROOT])
    async postBrandRole(@Body("dto") dto: postBrandRoleDto, @Body("BrandDTO") BrandDTO: BrandDTO): Promise<postBrandRoleRes> {
        const asker = await this.UserRemote.getUserInfo({ userId: dto?.userId });
        if (!asker) throw new Error(`请重新扫码 ${dto?.userId}`);

        const match = {
            userId: dto.userId,
            corpId: BrandDTO.corp._id,
            role: dto.role,
        };
        const count = await this.BrandRoleDao.count(match);
        if (count > 0) throw new Error("请勿重复添加");

        await this.BrandRoleDao.create(match);
        return null;
    }

    @Post("/get")
    @SetMetadata("BrandRole", ENUM_BRAND_ROLE_ALL)
    async getBrandRole(@Body("dto") dto: getBrandRoleDto, @Body("BrandDTO") BrandDTO: BrandDTO): Promise<getBrandRoleRes> {
        const roles = await this.BrandRoleDao.query({ corpId: BrandDTO.corp._id });
        const userInfos = await this.UserRemote.getUserInfoList({ userIds: roles.map((e) => e.userId) });

        return (roles as BrandRoleJoined[]).map((e) => {
            e.joinUserInfo = userInfos.find((ee) => ee.userId === e.userId);
            return e;
        });
    }

    @Post("/delete")
    @SetMetadata("BrandRole", [ENUM_BRAND_ROLE.ROOT])
    async deleteBrandRole(@Body("dto") dto: deleteBrandRoleDto, @Body("BrandDTO") BrandDTO: BrandDTO): Promise<deleteBrandRoleRes> {
        const exit: BrandRole = await this.BrandRoleDao.findOne(dto.entityId);
        if (exit.role === ENUM_BRAND_ROLE.ROOT) throw new Error(`无法删除管理员`);

        if ([ENUM_BRAND_ROLE.TRAINEE, ENUM_BRAND_ROLE.VISITOR].includes(exit.role)) {
            const all = await this.BrandRoleDao.query({ corpId: exit.corpId, userId: exit.userId });
            await this.BrandRoleDao.deleteMany(all.map((e) => e._id));
        } else {
            await this.BrandRoleDao.delete(dto.entityId);
        }
        return null;
    }
}
