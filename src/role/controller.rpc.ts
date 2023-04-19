import { Controller } from "@nestjs/common";
import { EventPattern, MessagePattern } from "@nestjs/microservices";

import { ENUM_BRAND_ROLE, ENUM_ERROR_CODE, UserInfo } from "qqlx-core";
import { getMarketRoleDto, getMarketRoleRes, ToResponse } from "qqlx-sdk";

import { BrandRoleDao } from "dao/role";

@Controller()
export class BrandRoleRpc {
    constructor(
        //
        private readonly BrandRoleDao: BrandRoleDao
    ) {}

    @MessagePattern("getMarketRole") // 需要客户端 send 并返回值
    @ToResponse()
    async getCorp(dto: getMarketRoleDto) {
        const roles = await this.BrandRoleDao.query({ userId: dto.userId });
        const isRoot = roles.find((e) => e.role === ENUM_BRAND_ROLE.ROOT);
        if (isRoot) return null;

        const match = roles.find((e) => e.role === dto.role);
        if (!match) throw ENUM_ERROR_CODE.ROLE_BRAND_BELOW;
        return null;
    }
}
