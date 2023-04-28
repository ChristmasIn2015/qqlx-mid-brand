import { Controller } from "@nestjs/common";
import { EventPattern, MessagePattern } from "@nestjs/microservices";

import { AreaJoined, ENUM_BRAND_ROLE, ENUM_ERROR_CODE, UserInfo } from "qqlx-core";
import { getAreaDto, getAreaRes, ToResponse } from "qqlx-sdk";

import { AreaDao } from "dao/area";

@Controller()
export class AreaRpc {
    constructor(
        //
        private readonly AreaDao: AreaDao
    ) {}

    @MessagePattern("getArea") // 需要客户端 send 并返回值
    @ToResponse()
    async getArea(dto: getAreaDto) {
        const match = { corpId: dto.corpId };
        const list: AreaJoined[] = await this.AreaDao.aggregate([
            { $match: match },
            { $lookup: { from: "warehouses", localField: "houseId", foreignField: "_id", as: "joinWarehouse" } },
        ]);
        list.forEach((area) => {
            area.joinWarehouse && (area.joinWarehouse = area.joinWarehouse[0]);
        });
        return list;
    }
}
