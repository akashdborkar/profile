"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadBadgeViaStrapi = exports.syncPostMediaToCloudinary = void 0;
const cloudinary_1 = require("cloudinary");
const strapi_client_1 = require("./strapi-client");
function initCloudinary() {
    cloudinary_1.v2.config({
        cloud_name: process.env.CLOUDINARY_NAME,
        api_key: process.env.CLOUDINARY_KEY,
        api_secret: process.env.CLOUDINARY_SECRET,
    });
}
async function fetchBufferWithTimeout(url, timeoutMs = 10000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok)
            throw new Error(`HTTP ${res.status} fetching ${url}`);
        return Buffer.from(await res.arrayBuffer());
    }
    finally {
        clearTimeout(timer);
    }
}
function uploadBufferToCloudinary(buffer) {
    return new Promise((resolve, reject) => {
        cloudinary_1.v2.uploader
            .upload_stream({ resource_type: 'auto' }, (error, result) => {
            if (error || !result) {
                return reject(error !== null && error !== void 0 ? error : new Error('No result returned from Cloudinary'));
            }
            resolve(result.secure_url);
        })
            .end(buffer);
    });
}
async function syncPostMediaToCloudinary(mediaUrls) {
    initCloudinary();
    const permanent = [];
    for (const url of mediaUrls) {
        try {
            const buffer = await fetchBufferWithTimeout(url);
            const secureUrl = await uploadBufferToCloudinary(buffer);
            permanent.push(secureUrl);
        }
        catch (err) {
            console.error(`[media-processor] Skipping asset ${url}:`, err);
        }
    }
    return permanent;
}
exports.syncPostMediaToCloudinary = syncPostMediaToCloudinary;
async function uploadBadgeViaStrapi(badgeUrl) {
    return (0, strapi_client_1.uploadBadgeToStrapiMedia)(badgeUrl);
}
exports.uploadBadgeViaStrapi = uploadBadgeViaStrapi;
