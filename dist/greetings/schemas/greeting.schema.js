"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GreetingSchema = exports.Greeting = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let Greeting = class Greeting {
    templateId;
    recipientName;
    occasion;
    message;
    senderName;
    imageUrls;
    rowNumber;
    createdAt;
    updatedAt;
};
exports.Greeting = Greeting;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Greeting.prototype, "templateId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Greeting.prototype, "recipientName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Greeting.prototype, "occasion", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Greeting.prototype, "message", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Greeting.prototype, "senderName", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [
            {
                width: Number,
                height: Number,
                url: String,
            },
        ],
        required: false,
    }),
    __metadata("design:type", Array)
], Greeting.prototype, "imageUrls", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false }),
    __metadata("design:type", Number)
], Greeting.prototype, "rowNumber", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], Greeting.prototype, "createdAt", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], Greeting.prototype, "updatedAt", void 0);
exports.Greeting = Greeting = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Greeting);
exports.GreetingSchema = mongoose_1.SchemaFactory.createForClass(Greeting);
//# sourceMappingURL=greeting.schema.js.map