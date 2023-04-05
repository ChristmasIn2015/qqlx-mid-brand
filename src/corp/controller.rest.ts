import { Controller, Get, Post, Body, Patch, Param, SetMetadata, UseGuards } from "@nestjs/common";

import {
    PATH_BRAND_CORP,
    ENUM_BRAND_ROLE,
    postCorpDto,
    postCorpRes,
    getCorpDto,
    getCorpRes,
    patchCorpDto,
    patchCorpRes,
    deleteCorpDto,
    deleteCorpRes,
    Corp,
    BrandRole,
} from "qqlx-core";
import { UserDTO, BrandDTO } from "qqlx-sdk";

import { BrandGuard, ENUM_BRAND_ROLE_ALL, ENUM_BRAND_ROLE_CORE } from "global/brand.guard";
import { UserGuard } from "global/user.guard";
import { MarketRemote } from "remote/market";

import { CorpDao } from "dao/corp";
import { BrandRoleDao } from "dao/role";

@Controller(PATH_BRAND_CORP)
export class CorpController {
    constructor(
        //
        private readonly CorpDao: CorpDao,
        private readonly BrandRoleDao: BrandRoleDao,
        private readonly MarketRemote: MarketRemote
    ) {}

    @Post()
    @UseGuards(UserGuard)
    async postCorp(@Body("dto") dto: postCorpDto, @Body("UserDTO") UserDTO: UserDTO): Promise<postCorpRes> {
        if (!dto.name) throw new Error("请输入店铺名称");

        await this.createCorp(UserDTO.userInfo.userId, dto.name, dto.address, dto.contact);
        return null;
    }

    @Post("/get")
    @UseGuards(UserGuard)
    async getCorp(@Body("dto") dto: getCorpDto, @Body("UserDTO") UserDTO: UserDTO): Promise<getCorpRes> {
        const userId = UserDTO.userInfo.userId;
        const roles: BrandRole[] = await this.BrandRoleDao.query({ userId });

        // 如果该用户没有创建任何店铺，则自动为其创建店铺
        const counts = roles.filter((e) => e.role === ENUM_BRAND_ROLE.ROOT).length;
        if (counts === 0) await this.createCorp(userId);

        // 补充有可能遗漏的root权限
        await this.createRootBrandRole(userId);

        // 查询
        const _roles = await this.BrandRoleDao.query({ userId });
        const corps = (await this.CorpDao.query({ _id: { $in: _roles.map((e) => e.corpId) } })) as (Corp & { isRoot: boolean })[];
        corps.forEach((item) => (item.isRoot = !!_roles.find((e) => e.corpId === item._id && e.role === ENUM_BRAND_ROLE.ROOT)));

        return corps;
    }

    private async createCorp(
        userId: string,
        name: string = "默认公司（自动创建）",
        address: string = "默认公司地址",
        contact: string = "默认联系方式"
    ): Promise<Corp> {
        const schema: Corp = this.CorpDao.getSchema();
        schema.userId = userId;
        schema.name = name;
        schema.address = address;
        schema.contact = contact;
        const entity = await this.CorpDao.create(schema);

        await this.MarketRemote.empowerCorp({ corpId: entity._id });
        return entity;
    }

    private async createRootBrandRole(userId: string) {
        const corps = await this.CorpDao.query({ userId });
        for (const corp of corps) {
            const counts = await this.BrandRoleDao.count({ corpId: corp._id, userId, role: ENUM_BRAND_ROLE.ROOT });
            if (counts > 0) continue;
            const roleSchema = this.BrandRoleDao.getSchema();
            roleSchema.userId = userId;
            roleSchema.corpId = corp._id;
            roleSchema.role = ENUM_BRAND_ROLE.ROOT;
            await this.BrandRoleDao.create(roleSchema);
        }
    }

    @Patch()
    @UseGuards(BrandGuard)
    @SetMetadata("BrandRole", [ENUM_BRAND_ROLE.ROOT])
    async patchCorp(@Body("dto") dto: patchCorpDto, @Body("BrandDTO") BrandDTO: BrandDTO): Promise<patchCorpRes> {
        if (!dto.name) throw new Error(`请输入公司名称`);

        const updater = { name: dto.name, address: dto.address, contact: dto.contact };
        const corp = await this.CorpDao.updateOne(dto._id, updater);
        return corp;
    }

    @Post("/delete")
    @UseGuards(BrandGuard)
    @SetMetadata("BrandRole", [ENUM_BRAND_ROLE.ROOT])
    async deleteCorp(@Body("dto") dto: deleteCorpDto, @Body("BrandDTO") BrandDTO: BrandDTO): Promise<deleteCorpRes> {
        const exist = await this.CorpDao.findOne(dto.entityId);
        if (!exist) throw new Error(`找不到公司`);

        const roles: BrandRole[] = await this.BrandRoleDao.query({ userId: exist.userId, role: ENUM_BRAND_ROLE.ROOT });
        const all: Corp[] = await this.CorpDao.query({ _id: { $in: roles.map((e) => e.corpId) } });
        if (exist.isDisabled === false && all.filter((e) => e.isDisabled === false).length <= 1) {
            throw new Error(`至少需要保留一个公司`);
        }

        await this.CorpDao.updateOne(exist._id, { isDisabled: !exist.isDisabled });
        return null;
    }
}
