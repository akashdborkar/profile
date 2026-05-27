"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadBadgeViaStrapi = void 0;
const strapi_client_1 = require("./strapi-client");
async function uploadBadgeViaStrapi(badgeUrl) {
    return (0, strapi_client_1.uploadBadgeToStrapiMedia)(badgeUrl);
}
exports.uploadBadgeViaStrapi = uploadBadgeViaStrapi;
