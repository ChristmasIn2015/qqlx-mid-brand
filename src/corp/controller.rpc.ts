import { Controller } from "@nestjs/common";
import { EventPattern, MessagePattern } from "@nestjs/microservices";

import { UserInfo } from "qqlx-core";
import { getCorpDto, getCorpRes, ToResponse } from "qqlx-sdk";

import { CorpService } from "src/corp/service";

@Controller()
export class CorpRpc {
    constructor(
        //
        private readonly CorpService: CorpService
    ) {}

    @MessagePattern("getCorp") // 需要客户端 send 并返回值
    @ToResponse()
    async getCorp(dto: getCorpDto) {
        const corp = await this.CorpService.getCorp(dto);
        return corp;
    }
}
