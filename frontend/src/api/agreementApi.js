import apiClient from "./apiClient";

export const AGREEMENT_VERSION =
  "AXELPATH-Student-Training-Evaluation-Career-Support-Agreement-v1";

/**
 * Save student agreement acceptance to MySQL.
 * Must be called before a Razorpay order can be created.
 */
export const acceptAgreement = (registrationId) =>
  apiClient.post("/agreements/accept", {
    registration_id: registrationId,
    agreement_version: AGREEMENT_VERSION,
  });

/**
 * Check agreement acceptance status for a registration.
 */
export const getAgreementStatus = (registrationId) =>
  apiClient.get(`/agreements/status/${registrationId}`);
