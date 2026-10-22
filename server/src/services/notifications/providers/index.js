const InAppProvider = require('./InAppProvider');
const EmailProvider = require('./EmailProvider');
const WebPushProvider = require('./WebPushProvider');
const WhatsAppProvider = require('./WhatsAppProvider');
const SmsProvider = require('./SmsProvider');
const MockNotificationProvider = require('./MockNotificationProvider');

const providers = {
  in_app: new InAppProvider(),
  email: new EmailProvider(),
  push: new WebPushProvider(),
  whatsapp: new WhatsAppProvider(),
  sms: new SmsProvider(),
};

function getProvider(channel) {
  return providers[channel] || providers.in_app;
}

function setProvider(channel, providerInstance) {
  providers[channel] = providerInstance;
}

function resetProviders() {
  providers.in_app = new InAppProvider();
  providers.email = new EmailProvider();
  providers.push = new WebPushProvider();
  providers.whatsapp = new WhatsAppProvider();
  providers.sms = new SmsProvider();
}

module.exports = {
  getProvider,
  setProvider,
  registerProvider: setProvider,
  resetProviders,
  InAppProvider,
  EmailProvider,
  WebPushProvider,
  WhatsAppProvider,
  SmsProvider,
  MockNotificationProvider,
};
