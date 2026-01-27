import { Document } from 'mongoose';
export type GreetingDocument = Greeting & Document;
export declare class Greeting {
    templateId: string;
    recipientName: string;
    occasion: string;
    message: string;
    senderName: string;
    imageUrls?: Array<{
        width: number;
        height: number;
        url: string;
    }>;
    rowNumber?: number;
    createdAt?: Date;
    updatedAt?: Date;
}
export declare const GreetingSchema: import("mongoose").Schema<Greeting, import("mongoose").Model<Greeting, any, any, any, (Document<unknown, any, Greeting, any, import("mongoose").DefaultSchemaOptions> & Greeting & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, Greeting, any, import("mongoose").DefaultSchemaOptions> & Greeting & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}), any, Greeting>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Greeting, Document<unknown, {}, Greeting, {
    id: string;
}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Greeting & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    templateId?: import("mongoose").SchemaDefinitionProperty<string, Greeting, Document<unknown, {}, Greeting, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Greeting & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    recipientName?: import("mongoose").SchemaDefinitionProperty<string, Greeting, Document<unknown, {}, Greeting, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Greeting & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    occasion?: import("mongoose").SchemaDefinitionProperty<string, Greeting, Document<unknown, {}, Greeting, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Greeting & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    message?: import("mongoose").SchemaDefinitionProperty<string, Greeting, Document<unknown, {}, Greeting, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Greeting & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    senderName?: import("mongoose").SchemaDefinitionProperty<string, Greeting, Document<unknown, {}, Greeting, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Greeting & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    imageUrls?: import("mongoose").SchemaDefinitionProperty<{
        width: number;
        height: number;
        url: string;
    }[], Greeting, Document<unknown, {}, Greeting, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Greeting & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    rowNumber?: import("mongoose").SchemaDefinitionProperty<number, Greeting, Document<unknown, {}, Greeting, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Greeting & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    createdAt?: import("mongoose").SchemaDefinitionProperty<Date, Greeting, Document<unknown, {}, Greeting, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Greeting & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
    updatedAt?: import("mongoose").SchemaDefinitionProperty<Date, Greeting, Document<unknown, {}, Greeting, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Greeting & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }>;
}, Greeting>;
