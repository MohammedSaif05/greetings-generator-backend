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
exports.TemplateSchema = exports.Template = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let Template = class Template {
    templateId;
    orientation;
    canvas;
    backgroundImage;
    textAreas;
    status;
    thumbnailUrl;
    createdAt;
    updatedAt;
};
exports.Template = Template;
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true }),
    __metadata("design:type", String)
], Template.prototype, "templateId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: ['square', 'portrait', 'landscape'] }),
    __metadata("design:type", String)
], Template.prototype, "orientation", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: {
            width: { type: Number, required: true },
            height: { type: Number, required: true },
        },
        required: true,
    }),
    __metadata("design:type", Object)
], Template.prototype, "canvas", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: {
            assetId: { type: String, required: true },
            url: { type: String, required: true },
        },
        required: true,
    }),
    __metadata("design:type", Object)
], Template.prototype, "backgroundImage", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [
            {
                id: String,
                x: Number,
                y: Number,
                width: Number,
                height: Number,
                fontFamily: String,
                fontWeight: Number,
                fontColor: String,
                maxFontSize: Number,
                minFontSize: Number,
                textAlign: String,
                lineHeight: Number,
                underline: Boolean,
                italic: Boolean,
                bold: Boolean,
                rotation: Number,
                outlineWidth: Number,
                outlineColor: String,
                textShadow: {
                    offsetX: Number,
                    offsetY: Number,
                    blur: Number,
                    color: String,
                },
                background: {
                    enabled: Boolean,
                    color: String,
                    padding: Number,
                    borderRadius: Number,
                },
            },
        ],
        required: true,
    }),
    __metadata("design:type", Array)
], Template.prototype, "textAreas", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'ACTIVE', enum: ['ACTIVE', 'INACTIVE', 'ARCHIVED'] }),
    __metadata("design:type", String)
], Template.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false }),
    __metadata("design:type", String)
], Template.prototype, "thumbnailUrl", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], Template.prototype, "createdAt", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], Template.prototype, "updatedAt", void 0);
exports.Template = Template = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Template);
exports.TemplateSchema = mongoose_1.SchemaFactory.createForClass(Template);
//# sourceMappingURL=template.schema.js.map