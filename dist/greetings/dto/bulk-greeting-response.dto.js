"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BulkGreetingResponseDto = exports.GreetingResult = exports.GeneratedImage = void 0;
class GeneratedImage {
    width;
    height;
    url;
}
exports.GeneratedImage = GeneratedImage;
class GreetingResult {
    row;
    templateId;
    image;
}
exports.GreetingResult = GreetingResult;
class BulkGreetingResponseDto {
    status;
    total;
    generated;
    results;
}
exports.BulkGreetingResponseDto = BulkGreetingResponseDto;
//# sourceMappingURL=bulk-greeting-response.dto.js.map