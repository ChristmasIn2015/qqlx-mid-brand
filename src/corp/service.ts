import { Injectable } from "@nestjs/common";
import { verify } from "jsonwebtoken";

import { Corp, ENUM_ERROR_CODE } from "qqlx-core";
import { getCorpDto, getCorpRes } from "qqlx-sdk";

import { CorpDao } from "dao/corp";
import { BrandRoleDao } from "dao/role";

@Injectable()
export class CorpService {
    CONFIG_JSON_FILE_JSON: Record<string, any>;

    constructor(
        //
        private readonly CorpDao: CorpDao,
        private readonly BrandRoleDao: BrandRoleDao
    ) {}

    async getCorp(dto: getCorpDto): Promise<Corp> {
        const corp: Corp = await this.CorpDao.findOne(dto.corpId);
        if (!corp) throw ENUM_ERROR_CODE.NOT_FOUND_BRAND;

        if (dto.userId) {
            const match = { corpId: corp._id, userId: dto.userId };
            const roles = await this.BrandRoleDao.query(match);
            if (roles.length === 0) throw ENUM_ERROR_CODE.ROLE_BRAND_BELOW;

            if (dto.demands) {
                const matched = [];

                for (const demand of dto.demands) {
                    const match = roles.find((e) => e.role === demand);
                    if (match) {
                        matched.push(match);
                        break;
                    }
                }
                if (matched.length === 0) throw ENUM_ERROR_CODE.ROLE_BRAND_BELOW;
            }
        }

        return corp;
    }
}
