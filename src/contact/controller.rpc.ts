import { Controller } from "@nestjs/common";
import { EventPattern, MessagePattern } from "@nestjs/microservices";

import { Contact } from "qqlx-core";
import { getContactDto, getContactRes, ToResponse } from "qqlx-sdk";

import { ContactDao } from "dao/contact";

@Controller()
export class ContactRpc {
    constructor(
        //
        private readonly ContactDao: ContactDao
    ) {}

    @MessagePattern("getContact") // 需要客户端 send 并返回值
    @ToResponse()
    async getContact(dto: getContactDto) {
        if (dto.contactIds) {
            const corp = await this.ContactDao.query({ _id: { $in: dto.contactIds } });
            return corp;
        }

        return [];
    }
}
