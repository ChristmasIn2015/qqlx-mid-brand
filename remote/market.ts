import { Injectable } from "@nestjs/common";
import { ClientProxy, ClientProxyFactory, Transport } from "@nestjs/microservices";

import { UserInfo } from "qqlx-core";
import { HOST_MID_MARKET, PORT_MID_MARKET, empowerCorpDto, empowerCorpRes, chargeRpcResponse } from "qqlx-sdk";

@Injectable()
export class MarketRemote {
    private readonly client: ClientProxy;

    constructor() {
        this.client = ClientProxyFactory.create({
            transport: Transport.TCP,
            options: { host: HOST_MID_MARKET, port: PORT_MID_MARKET },
        });
    }

    async empowerCorp(dto: empowerCorpDto) {
        const res: empowerCorpRes = await this.client.send("empowerCorp", dto).toPromise(); // event async
        chargeRpcResponse(res);
    }
}
