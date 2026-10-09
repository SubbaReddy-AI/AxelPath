import apiClient from "./apiClient";

/**
 * STEP 1 — Create registration record (no Razorpay order yet).
 * Returns registration_id used for all subsequent steps.
 */
export const initCourseRegistration = (payload) =>
  apiClient.post("/course-registrations/init", payload);

/**
 * STEP 3 — Create Razorpay order after agreement is accepted.
 * @param {string} registrationId
 * @param {number} amountRupees — amount entered by the student (INR, integer rupees)
 * Returns razorpay_order_id + razorpay_key_id.
 */
export const createPaymentOrder = (registrationId, amountRupees) =>
  apiClient.post("/course-registrations/create-order", {
    registration_id: registrationId,
    amount_rupees: amountRupees,
  });

/**
 * STEP 4 — Verify payment after Razorpay Checkout completes.
 */
export const verifyCourseRegistrationPayment = (payload) =>
  apiClient.post("/course-registrations/verify", payload);

// ─── Legacy (kept for reference) ───────────────────────────────────────
export const startCourseRegistration = (payload) =>
  apiClient.post("/course-registrations/start", payload);

export const getRegistrationSummary = (courseId, email) =>
  apiClient.get(
    `/course-registrations/${courseId}/summary?email=${encodeURIComponent(email)}`
  );