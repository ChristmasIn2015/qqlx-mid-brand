import { Injectable } from "@nestjs/common";
import { HydratedDocument, Model } from "mongoose";
import { Prop, Schema, SchemaFactory, InjectModel } from "@nestjs/mongoose";

import { Area as _ } from "qqlx-core";
import { MongooseDao } from "qqlx-sdk";

@Schema()
export class Area implements _ {
    @Prop({ default: "", required: true })
    corpId: string;
    @Prop({ default: "", required: true })
    houseId: string;
    @Prop({ default: "" })
    name: string;
    @Prop({ default: "" })
    desc: string;
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
export const AreaSchema = SchemaFactory.createForClass(Area).set("versionKey", false);

@Injectable()
export class AreaDao extends MongooseDao<Area> {
    constructor(@InjectModel(Area.name) private model: Model<Area>) {
        super(model);
    }
}
