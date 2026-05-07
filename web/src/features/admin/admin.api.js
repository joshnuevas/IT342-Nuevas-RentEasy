import { getPendingProducts, updateProductStatus } from "../listings/listings.api";

export function getPendingListings(token) {
  return getPendingProducts(token);
}

export function reviewListing(id, status, token) {
  return updateProductStatus(id, status, token);
}
