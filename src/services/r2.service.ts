import { Injectable } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getR2Config } from '../config/r2.config';
import { randomUUID } from 'crypto';
import type { Express } from 'express-serve-static-core';
import { Readable } from 'stream';

@Injectable()
export class R2Service {
  private s3Client: S3Client;
  private config: ReturnType<typeof getR2Config>;

  constructor() {
    this.config = getR2Config();
    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${this.config.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: this.config.accessKeyId,
        secretAccessKey: this.config.secretAccessKey,
      },
    });
  }

  /**
   * Normalizes a URL to use the public URL format if publicUrl is configured.
   * Converts storage URLs (https://account.r2.cloudflarestorage.com/...)
   * or signed URLs to public URLs (https://pub-xxxxx.r2.dev/...)
   *
   * @param url - The URL to normalize (can be storage URL, signed URL, or public URL)
   * @returns Public URL if publicUrl is configured, otherwise returns original URL
   */
  normalizeToPublicUrl(url: string): string {
    if (!this.config.publicUrl) {
      // If publicUrl is not configured, return original URL
      return url;
    }

    try {
      const urlObj = new URL(url);

      // If it's already a public URL, return as is
      if (urlObj.hostname === new URL(this.config.publicUrl).hostname) {
        return url;
      }

      // Extract the key from the URL
      let key: string;

      // Handle storage URLs: https://account.r2.cloudflarestorage.com/bucket/key
      if (urlObj.hostname.includes('.r2.cloudflarestorage.com')) {
        let pathname = urlObj.pathname;
        // Remove bucket name from path if present
        if (pathname.startsWith(`/${this.config.bucketName}/`)) {
          pathname = pathname.substring(`/${this.config.bucketName}/`.length);
        } else if (pathname.startsWith('/')) {
          pathname = pathname.substring(1);
        }
        key = pathname;
      } else {
        // For signed URLs or other formats, extract key from pathname
        let pathname = urlObj.pathname;
        if (pathname.startsWith(`/${this.config.bucketName}/`)) {
          pathname = pathname.substring(`/${this.config.bucketName}/`.length);
        } else if (pathname.startsWith('/')) {
          pathname = pathname.substring(1);
        }
        key = pathname;
      }

      if (!key) {
        return url; // Return original if we can't extract key
      }

      // Return public URL format
      return `${this.config.publicUrl}/${key}`;
    } catch {
      // If URL parsing fails, return original
      return url;
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'templates',
  ): Promise<{ assetId: string; imageUrl: string }> {
    // Type guard and validation
    if (!file) {
      throw new Error('Invalid file object');
    }
    const validFile = file as {
      buffer: Buffer;
      originalname: string;
      mimetype: string;
    };

    if (!validFile.buffer || !validFile.originalname || !validFile.mimetype) {
      throw new Error('Invalid file object');
    }

    const assetId = `asset_${randomUUID().replace(/-/g, '')}`;
    const fileExtension = validFile.originalname.split('.').pop() || 'png';
    const fileName = `${folder}/${assetId}.${fileExtension}`;

    const command = new PutObjectCommand({
      Bucket: this.config.bucketName,
      Key: fileName,
      Body: validFile.buffer,
      ContentType: validFile.mimetype,
    });

    await this.s3Client.send(command);

    // Always use public URL format if configured, otherwise use signed URL
    let imageUrl: string;
    if (this.config.publicUrl) {
      imageUrl = `${this.config.publicUrl}/${fileName}`;
    } else {
      // Generate a signed URL (valid for 1 year)
      const signedUrlCommand = new GetObjectCommand({
        Bucket: this.config.bucketName,
        Key: fileName,
      });
      imageUrl = await getSignedUrl(this.s3Client, signedUrlCommand, {
        expiresIn: 31536000, // 1 year
      });
    }

    return {
      assetId,
      imageUrl: this.normalizeToPublicUrl(imageUrl),
    };
  }

  async uploadBuffer(
    buffer: Buffer,
    fileName: string,
    contentType: string = 'image/png',
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.config.bucketName,
      Key: fileName,
      Body: buffer,
      ContentType: contentType,
    });

    await this.s3Client.send(command);

    // Always use public URL format if configured, otherwise use signed URL
    let imageUrl: string;
    if (this.config.publicUrl) {
      imageUrl = `${this.config.publicUrl}/${fileName}`;
    } else {
      // Generate a signed URL (valid for 1 year)
      const signedUrlCommand = new GetObjectCommand({
        Bucket: this.config.bucketName,
        Key: fileName,
      });
      imageUrl = await getSignedUrl(this.s3Client, signedUrlCommand, {
        expiresIn: 31536000, // 1 year
      });
    }

    return this.normalizeToPublicUrl(imageUrl);
  }

  /**
   * Fetches an image from R2 using the SDK (for internal backend processing).
   * This method should be used instead of public URLs for backend operations.
   *
   * @param urlOrKey - Either a full URL (public or signed) or the R2 key directly
   * @returns Buffer containing the image data
   */
  async getImageBuffer(urlOrKey: string): Promise<Buffer> {
    // Extract the key from URL if a full URL is provided
    let key: string;
    if (urlOrKey.startsWith('http://') || urlOrKey.startsWith('https://')) {
      // Extract key from URL
      // Handle both public URLs (https://public-url.com/templates/asset_xxx.png)
      // and signed URLs (https://account.r2.cloudflarestorage.com/bucket/key?...)
      try {
        const url = new URL(urlOrKey);
        // For signed URLs, the pathname includes the bucket, so we need to remove it
        // For public URLs, the pathname is just the key
        let pathname = url.pathname;

        // If pathname starts with bucket name, remove it
        if (pathname.startsWith(`/${this.config.bucketName}/`)) {
          pathname = pathname.substring(`/${this.config.bucketName}/`.length);
        } else if (pathname.startsWith('/')) {
          pathname = pathname.substring(1);
        }

        key = pathname;
      } catch {
        throw new Error(
          `Invalid URL format: ${urlOrKey}. Provide either a valid URL or R2 key directly.`,
        );
      }
    } else {
      // Assume it's already a key
      key = urlOrKey;
    }

    if (!key) {
      throw new Error('Could not extract key from URL or key is empty');
    }

    const command = new GetObjectCommand({
      Bucket: this.config.bucketName,
      Key: key,
    });

    try {
      const response = await this.s3Client.send(command);

      if (!response.Body) {
        throw new Error(`No body returned for key: ${key}`);
      }

      // Convert stream to buffer
      const stream = response.Body as Readable;
      const chunks: Buffer[] = [];

      for await (const chunk of stream) {
        if (Buffer.isBuffer(chunk)) {
          chunks.push(chunk);
        } else if (chunk instanceof Uint8Array) {
          chunks.push(Buffer.from(chunk));
        } else {
          chunks.push(Buffer.from(chunk as ArrayBufferLike));
        }
      }

      return Buffer.concat(chunks);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(
        `Failed to fetch image from R2 (key: ${key}): ${errorMessage}`,
      );
    }
  }

  /**
   * Generates a public or signed URL for an image (for frontend, downloads, sharing).
   * This is the method to use when you need a URL for external access.
   *
   * @param key - The R2 key of the object
   * @param expiresIn - Expiration time in seconds for signed URLs (default: 1 year)
   * @returns Public URL or signed URL
   */
  async getImageUrl(
    key: string,
    expiresIn: number = 31536000,
  ): Promise<string> {
    let imageUrl: string;
    if (this.config.publicUrl) {
      imageUrl = `${this.config.publicUrl}/${key}`;
    } else {
      // Generate a signed URL
      const signedUrlCommand = new GetObjectCommand({
        Bucket: this.config.bucketName,
        Key: key,
      });
      imageUrl = await getSignedUrl(this.s3Client, signedUrlCommand, {
        expiresIn,
      });
    }
    return this.normalizeToPublicUrl(imageUrl);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async assetExists(_assetId: string): Promise<boolean> {
    // This is a simple check - in production you might want to maintain
    // an asset registry in MongoDB or check R2 directly
    // For now, we'll rely on the templates service to check if assetId is referenced
    return Promise.resolve(true);
  }
}
