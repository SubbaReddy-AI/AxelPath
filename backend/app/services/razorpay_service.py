"""
Razorpay service layer.

All credentials are loaded exclusively from environment variables via
pydantic-settings (Settings class).  No credentials appear in this file.

To go live, set these three Render environment variables:
  RAZORPAY_KEY_ID          — rzp_live_...
  RAZORPAY_KEY_SECRET      — the corresponding secret
  RAZORPAY_WEBHOOK_SECRET  — the secret set in the Razorpay Dashboard webhook

Nothing else in the Python codebase needs to change.
"""

import hashlib
import hmac
import logging
from typing import Any

import httpx

from app.config import settings

logger = logging.getLogger(__name__)

RAZORPAY_BASE_URL = "https://api.razorpay.com/v1"

# ──────────────────────────────────────────────────────────────────────────────
# Internal helpers
# ──────────────────────────────────────────────────────────────────────────────

def _credentials() -> tuple[str, str]:
    """
    Return (key_id, key_secret) from environment variables.

    Raises RuntimeError (→ HTTP 503) when either credential is empty so that
    the calling route returns a clear error instead of silently failing.
    Credentials are never logged.
    """
    key_id = settings.RAZORPAY_KEY_ID
    key_secret = settings.RAZORPAY_KEY_SECRET.get_secret_value()
    if not key_id or not key_secret:
        raise RuntimeError(
            "Razorpay credentials are not configured. "
            "Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in the environment."
        )
    return key_id, key_secret


# ──────────────────────────────────────────────────────────────────────────────
# Public API
# ──────────────────────────────────────────────────────────────────────────────

def create_order(
    amount_rupees: int,
    receipt: str,
    notes: dict[str, str],
) -> dict[str, Any]:
    """
    Create a Razorpay order and return the full order object.

    Amount is always expressed in RUPEES by the caller and converted to
    paise (× 100) here.  The caller must never pass an untrusted amount —
    the fixed ₹8,550 constant in the route layer ensures this.

    Raises RuntimeError when credentials are missing.
    Raises httpx.HTTPStatusError on a non-2xx Razorpay response.
    """
    if amount_rupees <= 0:
        raise ValueError(f"amount_rupees must be positive, got {amount_rupees!r}")

    key_id, key_secret = _credentials()

    payload = {
        "amount": amount_rupees * 100,   # paise
        "currency": "INR",
        "receipt": receipt,
        "notes": notes,
        "payment_capture": 1,             # auto-capture on payment success
    }

    logger.info(
        "Razorpay: creating order | receipt=%s amount_rupees=%s",
        receipt,
        amount_rupees,
    )

    response = httpx.post(
        f"{RAZORPAY_BASE_URL}/orders",
        auth=(key_id, key_secret),
        json=payload,
        timeout=20,
    )
    if not response.is_success:
        logger.error(
            "Razorpay: order creation failed | status=%s body=%s",
            response.status_code,
            response.text,
        )
    response.raise_for_status()
    order = response.json()

    logger.info("Razorpay: order created | order_id=%s", order.get("id"))
    return order


def fetch_payment(payment_id: str) -> dict[str, Any]:
    """
    Fetch the full payment object from the Razorpay API.

    Used to cross-check amount, status, and order linkage after the
    HMAC-SHA256 signature has already been verified by verify_signature().

    Raises httpx.HTTPStatusError on a non-2xx response.
    """
    key_id, key_secret = _credentials()

    response = httpx.get(
        f"{RAZORPAY_BASE_URL}/payments/{payment_id}",
        auth=(key_id, key_secret),
        timeout=20,
    )
    response.raise_for_status()
    return response.json()


def verify_signature(
    order_id: str,
    payment_id: str,
    signature: str,
) -> bool:
    """
    Verify the Razorpay payment signature (HMAC-SHA256).

    Razorpay signs the string  "<order_id>|<payment_id>"  using
    RAZORPAY_KEY_SECRET as the key.  We use hmac.compare_digest to
    prevent timing-attack leakage.

    Returns True only when the signature is valid.
    """
    _, key_secret = _credentials()

    message = f"{order_id}|{payment_id}".encode()
    expected = hmac.new(
        key_secret.encode(),
        message,
        digestmod=hashlib.sha256,
    ).hexdigest()

    match = hmac.compare_digest(expected, signature)
    if not match:
        logger.warning(
            "Razorpay: signature mismatch | order_id=%s payment_id=%s",
            order_id,
            payment_id,
        )
    return match


def verify_webhook_signature(raw_body: bytes, signature: str) -> bool:
    """
    Verify the Razorpay webhook signature (HMAC-SHA256).

    Uses RAZORPAY_WEBHOOK_SECRET (separate from RAZORPAY_KEY_SECRET).
    Returns True only when the signature is valid.
    Returns False (does NOT raise) when the webhook secret is unconfigured
    so that the route layer can decide whether to ignore or reject.
    """
    webhook_secret = settings.RAZORPAY_WEBHOOK_SECRET.get_secret_value()
    if not webhook_secret:
        logger.warning(
            "Razorpay: RAZORPAY_WEBHOOK_SECRET not configured — "
            "webhook signature cannot be verified."
        )
        return False

    expected = hmac.new(
        webhook_secret.encode(),
        raw_body,
        digestmod=hashlib.sha256,
    ).hexdigest()

    return hmac.compare_digest(expected, signature)


def payment_reference_values(payment: dict[str, Any]) -> set[str]:
    """
    Extract all reference/UTR strings Razorpay may expose for a payment.

    Different payment methods surface references in different fields:
      - UPI:        acquirer_data.rrn  (RRN = 12-digit reference)
      - Net Banking: acquirer_data.bank_transaction_id
      - Cards:      acquirer_data.arn  (Acquirer Reference Number)
      - UPI VPA:    acquirer_data.utr  (some gateways)

    The caller normalises the student-supplied UTR to UPPER before
    comparing, so we normalise all values here too.
    """
    values: set[str] = set()
    acquirer = payment.get("acquirer_data") or {}

    if isinstance(acquirer, dict):
        for key in (
            "rrn",
            "utr",
            "bank_transaction_id",
            "transaction_id",
            "arn",
            "authentication_reference_number",
        ):
            value = acquirer.get(key)
            if value:
                values.add(str(value).strip().upper())

    return values
