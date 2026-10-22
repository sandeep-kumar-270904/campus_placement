const INotificationProvider = require('./INotificationProvider');

class MockNotificationProvider extends INotificationProvider {
  constructor(channelName = 'mock') {
    super();
    this.channelName = channelName;
    this.sentItems = [];
    this.shouldFail = false;
    this.failureErrorMessage = 'Simulated provider outage';
  }

  async send(payload) {
    if (this.shouldFail) {
      const err = typeof this.shouldFail === 'function' ? this.shouldFail(payload) : this.failureErrorMessage;
      if (err) {
        return { success: false, error: err };
      }
    }

    const messageId = `mock_${this.channelName}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const recorded = {
      ...payload,
      channel: this.channelName,
      messageId,
      dispatchedAt: new Date(),
    };

    this.sentItems.push(recorded);

    return {
      success: true,
      messageId,
    };
  }

  setShouldFail(shouldFail, message = 'Simulated provider outage') {
    this.shouldFail = shouldFail;
    if (message) this.failureErrorMessage = message;
  }

  reset() {
    this.sentItems = [];
    this.shouldFail = false;
  }
}

module.exports = MockNotificationProvider;
