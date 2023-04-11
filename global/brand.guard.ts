import { randomUUID } from "crypto";

import { CanActivate, Injectable, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Request } from "express";

import { Corp, UserInfo, ENUM_BRAND_ROLE } from "qqlx-core";
import { BrandDTO, getCorpDto } from "qqlx-sdk";

import { UserRemote } from "remote/user";
import { CorpService } from "src/corp/service";

@Injectable()
export class BrandGuard implements CanActivate {
    constructor(
        //
        private readonly reflector: Reflector,
        private readonly UserRemote: UserRemote,
        private readonly CorpService: CorpService
    ) {}

    async canActivate(context: ExecutionContext) {
        const request: Request = context.switchToHttp().getRequest();

        const authorization = request.header("Authorization");
        const userInfo = await this.UserRemote.getUserInfo({ jwtString: authorization });

        const corpId = request.header("qqlx-corp-id");
        const demands: ENUM_BRAND_ROLE[] = this.reflector.get("BrandRole", context.getHandler());
        //@ts-ignore
        const dto: getCorpDto = { corpId, userId: userInfo.userId, demands };
        const corp: Corp = await this.CorpService.getCorp(dto);

        //@ts-ignore
        const BrandDTO: BrandDTO = { chain: randomUUID(), userInfo, corp };
        request.body.BrandDTO = BrandDTO;
        return true;
    }
}

/** 包含访客 和实习生 */
export const ENUM_BRAND_ROLE_ALL = [
    ENUM_BRAND_ROLE.ROOT,
    ENUM_BRAND_ROLE.TRAINEE,
    ENUM_BRAND_ROLE.PURCHASE,
    ENUM_BRAND_ROLE.SALES,
    ENUM_BRAND_ROLE.WM,
    ENUM_BRAND_ROLE.FINANCE,
    ENUM_BRAND_ROLE.ENTERTAIN,
    ENUM_BRAND_ROLE.VISITOR,
];

/** 不包含访客 和实习生 */
export const ENUM_BRAND_ROLE_CORE = [
    ENUM_BRAND_ROLE.ROOT,
    ENUM_BRAND_ROLE.PURCHASE,
    ENUM_BRAND_ROLE.SALES,
    ENUM_BRAND_ROLE.WM,
    ENUM_BRAND_ROLE.FINANCE,
    ENUM_BRAND_ROLE.ENTERTAIN,
];
