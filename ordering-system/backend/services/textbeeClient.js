const SEND_URL_OVERRIDE = (process.env.TEXTBEE_SEND_URL || '').trim();

const API_KEY = process.env.TEXTBEE_API_KEY || process.env.TEXTBEE_API_TOKEN || '';
const DEVICE_ID = (process.env.TEXTBEE_DEVICE_ID || '').trim();
const DEFAULT_TIMEOUT_MS = Number.parseInt(
  process.env.TEXTBEE_TIMEOUT_MS || '8000',
  10
);

const resolveBaseUrl = () => {
  const base =
    process.env.TEXTBEE_BASE_URL ||
    process.env.TEXTBEE_API_URL ||
    'https://api.textbee.dev/api/v1';
  return base.endsWith('/') ? base.slice(0, -1) : base;
};

const BASE_URL = resolveBaseUrl();

const resolveSendUrl = () => {
  if (SEND_URL_OVERRIDE) {
    return SEND_URL_OVERRIDE;
  }
  if (!DEVICE_ID) {
    return '';
  }
  return `${BASE_URL}/gateway/devices/${DEVICE_ID}/send-sms`;
};

const SEND_URL = resolveSendUrl();

function normaliseRecipients(raw = '') {
  if (!raw) return [];
  return raw
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

const DEFAULT_RECIPIENTS = normaliseRecipients(
  process.env.TEXTBEE_DEFAULT_RECIPIENTS ||
    process.env.DELIVERY_DISPATCH_SMS_RECIPIENTS ||
    ''
);

function isConfigured() {
  return Boolean(SEND_URL && API_KEY && DEFAULT_RECIPIENTS.length > 0);
}

async function postJson(url, payload, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const controller = globalThis.AbortController
    ? new globalThis.AbortController()
    : null;
  const timeoutId = controller
    ? setTimeout(() => controller.abort(), timeoutMs)
    : null;
  try {
    const headers = {
      'Content-Type': 'application/json',
    };
    if (API_KEY) {
      headers['x-api-key'] = API_KEY;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: controller ? controller.signal : undefined,
    });
    const text = await response.text();
    if (!response.ok) {
      const error = new Error(
        `TextBee request failed with status ${response.status}`
      );
      error.status = response.status;
      error.body = text;
      throw error;
    }
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch (err) {
      return text;
    }
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

async function sendSms({ recipients, message, metadata }) {
  const list = Array.isArray(recipients) ? recipients.filter(Boolean) : [];
  if (list.length === 0) {
    throw new Error('Missing recipients when triggering TextBee');
  }
  if (!message) {
    throw new Error('Missing message content when triggering TextBee');
  }
  if (!SEND_URL) {
    throw new Error('TextBee send URL is not configured');
  }

  const payload = {
    recipients: list,
    message,
  };
  if (metadata && typeof metadata === 'object') {
    payload.metadata = metadata;
  }

  return postJson(SEND_URL, payload);
}

async function broadcastMessage(message, overrideRecipients) {
  const recipients = Array.isArray(overrideRecipients)
    ? overrideRecipients.filter(Boolean)
    : DEFAULT_RECIPIENTS;
  if (!recipients || recipients.length === 0) {
    throw new Error('No recipients provided for TextBee broadcast');
  }

  return sendSms({ recipients, message });
}

module.exports = {
  isConfigured,
  broadcastMessage,
  sendSms,
  DEFAULT_RECIPIENTS,
  SEND_URL,
  BASE_URL,
};
