import { Injectable } from "@nestjs/common";
import { Schema, Prop, SchemaFactory, InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import { BrandRole as QQLXBrandRole, ENUM_BRAND_ROLE } from "qqlx-core";
import { MongooseDao } from "qqlx-sdk";

@Schema()
export class BrandRole implements QQLXBrandRole {
    @Prop({ default: "", required: true })
    userId: string;
    @Prop({ default: "", required: true })
    corpId: string;
    @Prop({
        default: ENUM_BRAND_ROLE.TRAINEE,
        enum: [
            ENUM_BRAND_ROLE.ROOT,
            ENUM_BRAND_ROLE.TRAINEE,
            ENUM_BRAND_ROLE.PURCHASE,
            ENUM_BRAND_ROLE.SALES,
            ENUM_BRAND_ROLE.WM,
            ENUM_BRAND_ROLE.FINANCE,
            ENUM_BRAND_ROLE.ENTERTAIN,
            ENUM_BRAND_ROLE.VISITOR,
        ],
    })
    role: ENUM_BRAND_ROLE;

    @Prop({ required: true })
    _id: string;
    @Prop({ default: 0 })
    timeCreate: number;
    @Prop({ default: 0 })
    timeUpdate: number;
    @Prop({ default: "" })
    timeCreateString: string;
    @Prop({ default: "" })
    timeUpdateString: string;
}
export const BrandRoleSchema = SchemaFactory.createForClass(BrandRole).set("versionKey", false);

@Injectable()
export class BrandRoleDao extends MongooseDao<BrandRole> {
    constructor(@InjectModel(BrandRole.name) private model: Model<BrandRole>) {
        super(model);
    }
}
