import { Injectable } from "@nestjs/common";
import { Schema, Prop, SchemaFactory, InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import { Contact as QQLXContact } from "qqlx-core";
import { MongooseDao } from "qqlx-sdk";

@Schema()
export class Contact implements QQLXContact {
    @Prop({ default: "", required: true })
    corpId: string;
    @Prop({ default: "" })
    name: string;
    @Prop({ default: "" })
    address: string;
    @Prop({ default: "" })
    remark: string;
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
export const ContactSchema = SchemaFactory.createForClass(Contact).set("versionKey", false);

@Injectable()
export class ContactDao extends MongooseDao<Contact> {
    constructor(@InjectModel(Contact.name) private model: Model<Contact>) {
        super(model);
    }
}
