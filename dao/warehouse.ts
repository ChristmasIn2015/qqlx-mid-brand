import { Injectable } from "@nestjs/common";
import { HydratedDocument, Model } from "mongoose";
import { Prop, Schema, SchemaFactory, InjectModel } from "@nestjs/mongoose";

import { Warehouse as _ } from "qqlx-core";
import { MongooseDao } from "qqlx-sdk";

@Schema()
export class Warehouse implements _ {
    @Prop({ default: "", required: true })
    corpId: string;
    @Prop({ default: "" })
    name: string;
    @Prop({ default: "" })
    address: string;
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
export const WarehouseSchema = SchemaFactory.createForClass(Warehouse).set("versionKey", false);

@Injectable()
export class WarehouseDao extends MongooseDao<Warehouse> {
    constructor(@InjectModel(Warehouse.name) private model: Model<Warehouse>) {
        super(model);
    }
}
