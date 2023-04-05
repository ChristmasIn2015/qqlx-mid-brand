import { randomUUID } from "crypto";

import { CanActivate, Injectable, ExecutionContext } from "@nestjs/common";
import { Request } from "express";

import { UserDTO } from "qqlx-sdk";

import { UserRemote } from "remote/user";

@Injectable()
export class UserGuard implements CanActivate {
    constructor(
        //
        private readonly UserRemote: UserRemote
    ) {}

    async canActivate(context: ExecutionContext) {
        const request: Request = context.switchToHttp().getRequest();

        const authorization = request.header("Authorization");
        const userInfo = await this.UserRemote.getUserInfo({ jwtString: authorization });

        const UserDTO: UserDTO = { chain: randomUUID(), userInfo };
        request.body.UserDTO = UserDTO;

        return true;
    }
}
