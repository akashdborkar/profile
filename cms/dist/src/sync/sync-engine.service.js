"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncLinkedInData = void 0;
const defaultStrapi = __importStar(require("./strapi-client"));
const defaultMedia = __importStar(require("./media-processor"));
function getEnv(key) {
    const val = process.env[key];
    if (!val)
        throw new Error(`Missing required environment variable: ${key}`);
    return val;
}
function toEventDate(isoString) {
    return new Date(isoString).toISOString().slice(0, 10);
}
function toBlocksDescription(text) {
    return [{ type: 'paragraph', children: [{ type: 'text', text }] }];
}
async function defaultRevalidate(model) {
    const url = getEnv('NEXT_REVALIDATION_URL');
    const token = getEnv('REVALIDATION_SECRET_TOKEN');
    const res = await fetch(`${url}/api/revalidate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ model }),
    });
    if (!res.ok) {
        console.error(`[sync-engine] Revalidation for model "${model}" failed: ${res.status}`);
    }
}
async function syncCertification(cert, strapi, media) {
    var _a;
    const existing = (_a = (await strapi.findCertificationByLinkedinCertId(cert.linkedinCertId))) !== null && _a !== void 0 ? _a : (await strapi.findCertificationByCompositeKey(cert.title, cert.issuingBody));
    if (existing)
        return false;
    const badgeImageId = await media.uploadBadgeViaStrapi(cert.badgeUrl);
    await strapi.createCertification({
        title: cert.title,
        issuingBody: cert.issuingBody,
        badgeImage: badgeImageId,
        verificationUrl: cert.verificationUrl,
        ...(cert.expiryDate && { expiryDate: cert.expiryDate }),
        linkedinCertId: cert.linkedinCertId,
    });
    return true;
}
async function syncFeaturedPost(post, strapi, media) {
    const existing = await strapi.findEngagementByLinkedinPostId(post.linkedinPostId);
    const permanentMediaUrls = await media.syncPostMediaToCloudinary(post.mediaUrls);
    if (existing) {
        await strapi.updateEngagementMedia(existing.documentId, permanentMediaUrls);
        return true;
    }
    await strapi.createEngagement({
        title: post.textContent.trim().slice(0, 100),
        description: toBlocksDescription(post.textContent),
        eventDate: toEventDate(post.postedAt),
        isFeatured: false,
        linkedinPostId: post.linkedinPostId,
        postUrl: post.postUrl,
        mediaUrls: permanentMediaUrls,
        mediaType: post.mediaType,
        ...(post.linkPreviewCard && { linkPreviewCard: post.linkPreviewCard }),
    });
    return true;
}
async function syncLinkedInData(incomingData, deps = {}) {
    var _a, _b, _c;
    const strapi = (_a = deps.strapi) !== null && _a !== void 0 ? _a : defaultStrapi;
    const media = (_b = deps.media) !== null && _b !== void 0 ? _b : defaultMedia;
    const revalidate = (_c = deps.revalidate) !== null && _c !== void 0 ? _c : defaultRevalidate;
    let certsSynced = 0;
    let activitiesSynced = 0;
    for (const cert of incomingData.certifications) {
        try {
            if (await syncCertification(cert, strapi, media))
                certsSynced++;
        }
        catch (err) {
            console.error(`[sync-engine] Failed to sync cert "${cert.title}":`, err);
        }
    }
    for (const post of incomingData.featuredPosts) {
        try {
            if (await syncFeaturedPost(post, strapi, media))
                activitiesSynced++;
        }
        catch (err) {
            console.error(`[sync-engine] Failed to sync post "${post.linkedinPostId}":`, err);
        }
    }
    await revalidate('certification');
    await revalidate('engagement-and-activity');
    return { certsSynced, activitiesSynced };
}
exports.syncLinkedInData = syncLinkedInData;
