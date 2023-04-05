import { Controller, Get, Post, Body, Patch, Delete, SetMetadata, UseGuards } from "@nestjs/common";

import { trimObject } from "qqlx-cdk";
import {
    PATH_BRAND_CONTACT,
    postContactDto,
    postContactRes,
    getContactDto,
    getContactRes,
    patchContactDto,
    patchContactRes,
    deleteContactDto,
    deleteContactRes,
} from "qqlx-core";
import { BrandDTO } from "qqlx-sdk";

import { BrandGuard, ENUM_BRAND_ROLE_ALL, ENUM_BRAND_ROLE_CORE } from "global/brand.guard";
import { ContactDao } from "dao/contact";

@Controller(PATH_BRAND_CONTACT)
@UseGuards(BrandGuard)
export class ContactController {
    constructor(
        //
        private readonly ContactDao: ContactDao
    ) {}

    @Post()
    @SetMetadata("BrandRole", ENUM_BRAND_ROLE_CORE)
    async postContact(@Body("dto") dto: postContactDto, @Body("BrandDTO") BrandDTO: BrandDTO): Promise<postContactRes> {
        if (dto.excels?.length > 100) throw new Error(`单次上传限制 100 项`);

        for (let schema of dto.excels) {
            if (!schema.name) throw new Error("请输入单位名称");
        }

        let success = 0;
        for (let schema of dto.excels) {
            const creator = this.ContactDao.getSchema();
            creator.corpId = BrandDTO.corp._id;
            creator.name = schema.name;
            creator.address = schema.address;
            creator.remark = schema.remark;
            trimObject(creator);

            const count = await this.ContactDao.count({ corpId: creator.corpId, name: creator.name });
            if (count === 0) {
                await this.ContactDao.create(creator);
                success++;
            }
        }

        if (success !== dto.excels.length) {
            throw new Error(`已成功添加 ${success} 位客户 ，其中 ${dto.excels.length - success} 位客户已存在，请注意检查`);
        }

        return null;
    }

    @Post("/get")
    @SetMetadata("BrandRole", ENUM_BRAND_ROLE_ALL)
    async getContact(@Body("dto") dto: getContactDto, @Body("BrandDTO") BrandDTO: BrandDTO): Promise<getContactRes> {
        trimObject(dto.search);

        const all = await this.ContactDao.count({ corpId: BrandDTO.corp._id });
        if (all === 0) {
            await this.ContactDao.create({
                corpId: BrandDTO.corp._id,
                name: "清泉流响软件信息有限责任公司",
                address: "13263911023/黄文强",
                remark: "qqlx",
            });
        }

        // 搜索
        const base = { corpId: BrandDTO.corp._id, isDisabled: dto.search.isDisabled };
        const keyword = dto.search.name || "";
        const search = {
            $or: [
                { ...base, ...(keyword && { name: new RegExp(keyword) }) },
                { ...base, ...(keyword && { address: new RegExp(keyword) }) },
                { ...base, ...(keyword && { remark: new RegExp(keyword) }) },
            ],
        };

        dto.page.startTime = 0;
        const page = await this.ContactDao.page(search, dto.page);

        return page;
    }

    @Patch()
    @SetMetadata("BrandRole", ENUM_BRAND_ROLE_CORE)
    async patchContact(@Body("dto") dto: patchContactDto, @Body("BrandDTO") BrandDTO: BrandDTO): Promise<patchContactRes> {
        if (!dto.name) throw new Error("请输入客户名称");
        const updater = { name: dto.name, address: dto.address, remark: dto.remark };

        const exists = await this.ContactDao.query({ corpId: BrandDTO.corp._id, name: dto.name });
        if (exists.length >= 1) {
            delete updater.name;
            await this.ContactDao.updateOne(dto._id, updater);
            throw new Error(`检查到相同客户 @${dto.name}，本次未更新客户名称，请注意检查`);
        } else {
            await this.ContactDao.updateOne(dto._id, updater);
        }

        return null;
    }

    @Post("/delete")
    @SetMetadata("BrandRole", ENUM_BRAND_ROLE_CORE)
    async deleteContact(@Body("dto") dto: deleteContactDto, @Body("BrandDTO") BrandDTO: BrandDTO): Promise<deleteContactRes> {
        const exist = await this.ContactDao.findOne(dto.contactId);
        if (!exist) throw new Error(`找不到客户`);

        await this.ContactDao.updateOne(exist._id, { isDisabled: !exist.isDisabled });
        return null;
    }
}
