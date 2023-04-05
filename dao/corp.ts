import { Injectable } from "@nestjs/common";
import { Schema, Prop, SchemaFactory, InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import { Corp as QQLXCorp, ENUM_CORP } from "qqlx-core";
import { MongooseDao } from "qqlx-sdk";

@Schema()
export class Corp implements QQLXCorp {
    @Prop({ default: "", required: true })
    userId: string;
    @Prop({
        default: ENUM_CORP.COMPANY,
        enum: [ENUM_CORP.NONE, ENUM_CORP.STUDIO, ENUM_CORP.COMPANY],
    })
    type: ENUM_CORP;
    @Prop({ default: "" })
    name: string;
    @Prop({ default: "" })
    address: string;
    @Prop({ default: "" })
    contact: string;
    @Prop({ default: false })
    isDisabled: boolean;

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
export const CorpSchema = SchemaFactory.createForClass(Corp).set("versionKey", false);

@Injectable()
export class CorpDao extends MongooseDao<Corp> {
    constructor(@InjectModel(Corp.name) private model: Model<Corp>) {
        super(model);
    }
}
