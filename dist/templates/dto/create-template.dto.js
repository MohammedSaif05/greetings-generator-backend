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
exports.CreateTemplateDto = exports.TextAreaDto = exports.TextBackgroundDto = exports.TextShadowDto = exports.BackgroundImageDto = exports.CanvasDto = exports.Orientation = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
var Orientation;
(function (Orientation) {
    Orientation["SQUARE"] = "square";
    Orientation["PORTRAIT"] = "portrait";
    Orientation["LANDSCAPE"] = "landscape";
})(Orientation || (exports.Orientation = Orientation = {}));
class CanvasDto {
    width;
    height;
}
exports.CanvasDto = CanvasDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CanvasDto.prototype, "width", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CanvasDto.prototype, "height", void 0);
class BackgroundImageDto {
    assetId;
    url;
}
exports.BackgroundImageDto = BackgroundImageDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], BackgroundImageDto.prototype, "assetId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], BackgroundImageDto.prototype, "url", void 0);
class TextShadowDto {
    offsetX;
    offsetY;
    blur;
    color;
}
exports.TextShadowDto = TextShadowDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], TextShadowDto.prototype, "offsetX", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], TextShadowDto.prototype, "offsetY", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], TextShadowDto.prototype, "blur", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], TextShadowDto.prototype, "color", void 0);
class TextBackgroundDto {
    enabled;
    color;
    padding;
    borderRadius;
}
exports.TextBackgroundDto = TextBackgroundDto;
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], TextBackgroundDto.prototype, "enabled", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], TextBackgroundDto.prototype, "color", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], TextBackgroundDto.prototype, "padding", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], TextBackgroundDto.prototype, "borderRadius", void 0);
class TextAreaDto {
    id;
    x;
    y;
    width;
    height;
    fontFamily;
    fontWeight;
    fontColor;
    maxFontSize;
    minFontSize;
    textAlign;
    lineHeight;
    underline;
    italic;
    bold;
    rotation;
    outlineWidth;
    outlineColor;
    textShadow;
    background;
}
exports.TextAreaDto = TextAreaDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], TextAreaDto.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], TextAreaDto.prototype, "x", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], TextAreaDto.prototype, "y", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], TextAreaDto.prototype, "width", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], TextAreaDto.prototype, "height", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], TextAreaDto.prototype, "fontFamily", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(100),
    (0, class_validator_1.Max)(900),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], TextAreaDto.prototype, "fontWeight", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsHexColor)(),
    __metadata("design:type", String)
], TextAreaDto.prototype, "fontColor", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], TextAreaDto.prototype, "maxFontSize", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], TextAreaDto.prototype, "minFontSize", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsEnum)(['left', 'center', 'right', 'justify']),
    __metadata("design:type", String)
], TextAreaDto.prototype, "textAlign", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.5),
    (0, class_validator_1.Max)(3),
    __metadata("design:type", Number)
], TextAreaDto.prototype, "lineHeight", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], TextAreaDto.prototype, "underline", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], TextAreaDto.prototype, "italic", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], TextAreaDto.prototype, "bold", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(-360),
    (0, class_validator_1.Max)(360),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], TextAreaDto.prototype, "rotation", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(50),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], TextAreaDto.prototype, "outlineWidth", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsHexColor)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], TextAreaDto.prototype, "outlineColor", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => TextShadowDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", TextShadowDto)
], TextAreaDto.prototype, "textShadow", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => TextBackgroundDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", TextBackgroundDto)
], TextAreaDto.prototype, "background", void 0);
class CreateTemplateDto {
    templateId;
    orientation;
    canvas;
    backgroundImage;
    textAreas;
}
exports.CreateTemplateDto = CreateTemplateDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateTemplateDto.prototype, "templateId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(Orientation),
    __metadata("design:type", String)
], CreateTemplateDto.prototype, "orientation", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => CanvasDto),
    __metadata("design:type", CanvasDto)
], CreateTemplateDto.prototype, "canvas", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => BackgroundImageDto),
    __metadata("design:type", BackgroundImageDto)
], CreateTemplateDto.prototype, "backgroundImage", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => TextAreaDto),
    (0, class_validator_1.ArrayUnique)((textArea) => textArea.id),
    __metadata("design:type", Array)
], CreateTemplateDto.prototype, "textAreas", void 0);
//# sourceMappingURL=create-template.dto.js.map