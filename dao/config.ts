import { Injectable } from "@nestjs/common";
import { Schema, Prop, SchemaFactory, InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import { Config as QQLXConfig } from "qqlx-core";
import { MongooseDao } from "qqlx-sdk";

@Schema()
export class Config implements QQLXConfig {
    @Prop({ default: "", required: true })
    corpId: string;
    @Prop({ default: "" })
    titles: string;

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
export const ConfigSchema = SchemaFactory.createForClass(Config).set("versionKey", false);

@Injectable()
export class ConfigDao extends MongooseDao<Config> {
    constructor(@InjectModel(Config.name) private model: Model<Config>) {
        super(model);
    }
}
