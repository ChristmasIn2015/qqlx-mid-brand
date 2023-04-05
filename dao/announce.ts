import { Injectable } from "@nestjs/common";
import { Schema, Prop, SchemaFactory, InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import { Announce as QQLXAnnounce } from "qqlx-core";
import { MongooseDao } from "qqlx-sdk";

@Schema()
export class Announce implements QQLXAnnounce {
    @Prop({ default: "", required: true })
    corpId: string;
    @Prop({ default: "" })
    content: string;

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
export const AnnounceSchema = SchemaFactory.createForClass(Announce).set("versionKey", false);

@Injectable()
export class AnnounceDao extends MongooseDao<Announce> {
    constructor(@InjectModel(Announce.name) private model: Model<Announce>) {
        super(model);
    }
}
