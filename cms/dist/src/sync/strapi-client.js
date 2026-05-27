"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadBadgeToStrapiMedia = exports.createCertification = exports.findCertificationByCompositeKey = exports.findCertificationByLinkedinCertId = exports.createEngagement = exports.findEngagementByLinkedinPostId = void 0;
function getEnv(key) {
    const val = process.env[key];
    if (!val)
        throw new Error(`Missing required environment variable: ${key}`);
    return val;
}
function authHeaders() {
    return {
        Authorization: `Bearer ${getEnv('STRAPI_SYNC_API_TOKEN')}`,
        'Content-Type': 'application/json',
    };
}
function baseUrl() {
    return getEnv('STRAPI_API_URL');
}
async function strapiGet(path) {
    const res = await fetch(`${baseUrl()}${path}`, { headers: authHeaders() });
    if (!res.ok)
        throw new Error(`Strapi GET ${path} failed: ${res.status} ${res.statusText}`);
    return res.json();
}
async function strapiPost(path, body) {
    const res = await fetch(`${baseUrl()}${path}`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ data: body }),
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Strapi POST ${path} failed: ${res.status} — ${text}`);
    }
    return res.json();
}
async function findEngagementByLinkedinPostId(postId) {
    var _a;
    const encoded = encodeURIComponent(postId);
    const res = await strapiGet(`/api/engagement-and-activities?filters[linkedinPostId][$eq]=${encoded}&pagination[limit]=1`);
    return (_a = res.data[0]) !== null && _a !== void 0 ? _a : null;
}
exports.findEngagementByLinkedinPostId = findEngagementByLinkedinPostId;
async function createEngagement(data) {
    const res = await strapiPost('/api/engagement-and-activities?status=published', data);
    return res.data;
}
exports.createEngagement = createEngagement;
async function findCertificationByLinkedinCertId(linkedinCertId) {
    var _a;
    const encoded = encodeURIComponent(linkedinCertId);
    const res = await strapiGet(`/api/certifications?filters[linkedinCertId][$eq]=${encoded}&pagination[limit]=1`);
    return (_a = res.data[0]) !== null && _a !== void 0 ? _a : null;
}
exports.findCertificationByLinkedinCertId = findCertificationByLinkedinCertId;
async function findCertificationByCompositeKey(title, issuingBody) {
    var _a;
    const t = encodeURIComponent(title);
    const b = encodeURIComponent(issuingBody);
    const res = await strapiGet(`/api/certifications?filters[title][$eq]=${t}&filters[issuingBody][$eq]=${b}&pagination[limit]=1`);
    return (_a = res.data[0]) !== null && _a !== void 0 ? _a : null;
}
exports.findCertificationByCompositeKey = findCertificationByCompositeKey;
async function createCertification(data) {
    const res = await strapiPost('/api/certifications?status=published', data);
    return res.data;
}
exports.createCertification = createCertification;
async function uploadBadgeToStrapiMedia(imageUrl) {
    var _a, _b, _c;
    const imageRes = await fetch(imageUrl);
    if (!imageRes.ok) {
        throw new Error(`Failed to download badge image from ${imageUrl}: ${imageRes.status}`);
    }
    const buffer = await imageRes.arrayBuffer();
    const filename = (_b = (_a = imageUrl.split('/').pop()) === null || _a === void 0 ? void 0 : _a.split('?')[0]) !== null && _b !== void 0 ? _b : 'badge.png';
    const form = new FormData();
    form.append('files', new Blob([buffer]), filename);
    const uploadRes = await fetch(`${baseUrl()}/api/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getEnv('STRAPI_SYNC_API_TOKEN')}` },
        body: form,
    });
    if (!uploadRes.ok) {
        const text = await uploadRes.text();
        throw new Error(`Strapi /api/upload failed: ${uploadRes.status} — ${text}`);
    }
    const uploaded = (await uploadRes.json());
    if (!((_c = uploaded[0]) === null || _c === void 0 ? void 0 : _c.id))
        throw new Error('Strapi /api/upload returned no media entry');
    return uploaded[0].id;
}
exports.uploadBadgeToStrapiMedia = uploadBadgeToStrapiMedia;
