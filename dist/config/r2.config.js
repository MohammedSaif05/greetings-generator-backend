"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getR2Config = void 0;
const getR2Config = () => {
    return {
        accountId: process.env.CLOUDFLARE_R2_ACCOUNT_ID || '',
        accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || '',
        bucketName: process.env.CLOUDFLARE_R2_BUCKET_NAME || '',
        publicUrl: process.env.CLOUDFLARE_R2_PUBLIC_URL,
    };
};
exports.getR2Config = getR2Config;
//# sourceMappingURL=r2.config.js.map