import { Document } from 'mongoose';
export type TemplateDocument = Template & Document;
export declare class Template {
    templateId: string;
    orientation: string;
    canvas: {
        width: number;
        height: number;
    };
    backgroundImage: {
        assetId: string;
        url: string;
    };
    textAreas: Array<{
        id: string;
        x: number;
        y: number;
        width: number;
        height: number;
        fontFamily: string;
        fontWeight?: number;
        fontColor: string;
        maxFontSize: number;
        minFontSize: number;
        textAlign: string;
        lineHeight: number;
        underline?: boolean;
        italic?: boolean;
        bold?: boolean;
        rotation?: number;
        outlineWidth?: number;
        outlineColor?: string;
        textShadow?: {
            offsetX: number;
            offsetY: number;
            blur: number;
            color: string;
        };
        background?: {
            enabled: boolean;
            color: string;
            padding: number;
            borderRadius: number;
        };
    }>;
    status: string;
    thumbnailUrl?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
export declare const TemplateSchema: import("mongoose").Schema<Template, import("mongoose").Model<Template, any, any, any, (Document<unknown, any, Template, any, import("mongoose").DefaultSchemaOptions> & Template & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, Template, any, import("mongoose").DefaultSchemaOptions> & Template & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}), any, Template>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Template, Document<unknown, {}, Template, {
    id: string;
}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Template & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    templateId?: import("mongoose").SchemaDefinitionProperty<string, Template, Document<unknown, {}, Template, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Template & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    orientation?: import("mongoose").SchemaDefinitionProperty<string, Template, Document<unknown, {}, Template, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Template & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    canvas?: import("mongoose").SchemaDefinitionProperty<{
        width: number;
        height: number;
    }, Template, Document<unknown, {}, Template, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Template & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    backgroundImage?: import("mongoose").SchemaDefinitionProperty<{
        assetId: string;
        url: string;
    }, Template, Document<unknown, {}, Template, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Template & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    textAreas?: import("mongoose").SchemaDefinitionProperty<{
        id: string;
        x: number;
        y: number;
        width: number;
        height: number;
        fontFamily: string;
        fontWeight?: number;
        fontColor: string;
        maxFontSize: number;
        minFontSize: number;
        textAlign: string;
        lineHeight: number;
        underline?: boolean;
        italic?: boolean;
        bold?: boolean;
        rotation?: number;
        outlineWidth?: number;
        outlineColor?: string;
        textShadow?: {
            offsetX: number;
            offsetY: number;
            blur: number;
            color: string;
        };
        background?: {
            enabled: boolean;
            color: string;
            padding: number;
            borderRadius: number;
        };
    }[], Template, Document<unknown, {}, Template, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Template & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    status?: import("mongoose").SchemaDefinitionProperty<string, Template, Document<unknown, {}, Template, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Template & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    thumbnailUrl?: import("mongoose").SchemaDefinitionProperty<string, Template, Document<unknown, {}, Template, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Template & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    createdAt?: import("mongoose").SchemaDefinitionProperty<Date, Template, Document<unknown, {}, Template, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Template & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    updatedAt?: import("mongoose").SchemaDefinitionProperty<Date, Template, Document<unknown, {}, Template, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Template & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
}, Template>;
