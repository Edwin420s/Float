const axios = require('axios');
const logger = require('../utils/logger');

/**
 * Simulates sending an x402 payment to another agent.
 * @param {string} targetUrl - The URL of the receiving agent endpoint.
 * @param {number} amount - Amount in USDC (or smallest unit).
 * @param {string} invoiceId - Optional reference.
 * @param {string} senderWallet - The treasury wallet address.
 * @returns {Promise<Object>} Response from the receiving agent.
 */
exports.sendX402Payment = async (targetUrl, amount, invoiceId, senderWallet) => {
  try {
    // x402 header format: "x402 <amount> <currency> <invoiceId>"
    const paymentHeader = `x402 ${amount} USDC ${invoiceId || ''}`.trim();

    const response = await axios.post(
      targetUrl,
      {
        from: senderWallet,
        amount,
        invoiceId,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Payment': paymentHeader,
        },
      }
    );

    logger.info(`x402 payment sent to ${targetUrl}, response:`, response.data);
    return response.data;
  } catch (error) {
    logger.error('x402 payment failed', error);
    throw new Error(`x402 payment failed: ${error.message}`);
  }
};

/**
 * Verify an incoming x402 payment header.
 * @param {string} header - The X-Payment header value.
 * @returns {Object} Parsed payment info or null if invalid.
 */
exports.parseX402Header = (header) => {
  if (!header || !header.startsWith('x402 ')) return null;
  const parts = header.split(' ');
  if (parts.length < 3) return null;
  const amount = parseFloat(parts[1]);
  const currency = parts[2];
  const invoiceId = parts.slice(3).join(' ') || null;
  return { amount, currency, invoiceId };
};