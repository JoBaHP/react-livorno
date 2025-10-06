const getTextBeeSecret = () => process.env.TEXTBEE_WEBHOOK_SECRET || '';

const extractSignature = (req) => {
  const headers = req.headers || {};
  return (
    headers['x-textbee-signature'] ||
    headers['x-webhook-signature'] ||
    headers['x-signature'] ||
    headers['x-hub-signature'] ||
    (req.body && (req.body.signature || req.body.secret)) ||
    null
  );
};

exports.handleDelivery = (req, res) => {
  try {
    const textBeeSecret = getTextBeeSecret();
    if (textBeeSecret) {
      const incomingSignature = extractSignature(req);
      if (!incomingSignature || incomingSignature !== textBeeSecret) {
        console.warn('Rejected TextBee webhook with invalid signature');
        return res.status(401).json({ message: 'Invalid webhook signature' });
      }
    }

    console.log('TextBee delivery webhook received', {
      event: req.body?.event || req.body?.type || 'unknown',
      id: req.body?.id,
      to: req.body?.to,
      status: req.body?.status,
    });

    return res.status(204).send();
  } catch (err) {
    console.error('Failed to process TextBee webhook', err);
    return res.status(500).json({ message: 'Webhook handling error' });
  }
};
