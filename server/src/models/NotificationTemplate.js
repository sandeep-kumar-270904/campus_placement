const mongoose = require('mongoose');
const tenantPlugin = require('../plugins/tenantPlugin');

const DEFAULT_TEMPLATES = {
  'drive.published': {
    in_app: {
      title: 'New Placement Drive: {{company}}',
      body: '{{company}} has posted {{role}} ({{ctc}} LPA). Deadline: {{deadline}}.',
      deepLink: '/student/dashboard',
    },
    email: {
      subject: 'New Drive: {{company}} for {{role}} ({{ctc}} LPA)',
      bodyHtml:
        '<p>Dear {{studentName}},</p><p><strong>{{company}}</strong> has just announced a new placement drive for <strong>{{role}}</strong> offering <strong>{{ctc}} LPA</strong>.</p><p>Application Deadline: <strong>{{deadline}}</strong></p><p><a href="{{link}}">Apply on PLACEearly</a></p>',
      bodyText:
        'Dear {{studentName}}, {{company}} has announced a drive for {{role}} ({{ctc}} LPA). Apply by {{deadline}}: {{link}}',
    },
    push: {
      title: 'New Drive: {{company}}',
      body: '{{role}} ({{ctc}} LPA) is now open for applications.',
      deepLink: '/student/dashboard',
    },
    whatsapp: {
      templateName: 'drive_announcement',
      body: 'Hi {{studentName}}, {{company}} is hiring for {{role}} ({{ctc}} LPA). Deadline: {{deadline}}. Apply here: {{link}}',
    },
    sms: {
      body: 'PLACEearly: New drive {{company}} ({{role}}, {{ctc}} LPA). Apply by {{deadline}}: {{link}}',
    },
  },
  'drive.deadline_24h': {
    in_app: {
      title: 'Deadline Alert: 24h Left for {{company}}',
      body: 'Applications for {{company}} ({{role}}) close tomorrow at {{time}}.',
      deepLink: '/student/dashboard',
    },
    email: {
      subject: 'Urgent: 24 Hours Left to Apply for {{company}}',
      bodyHtml:
        '<p>Dear {{studentName}},</p><p>The application window for <strong>{{company}}</strong> ({{role}}) will close in 24 hours.</p><p><a href="{{link}}">Submit Application Now</a></p>',
      bodyText:
        'Dear {{studentName}}, 24 hours left to apply for {{company}} ({{role}}). Submit your application: {{link}}',
    },
    push: {
      title: '24h Left: {{company}}',
      body: 'Application deadline closes tomorrow. Don’t miss out!',
      deepLink: '/student/dashboard',
    },
    whatsapp: {
      templateName: 'deadline_reminder',
      body: 'Alert {{studentName}}: 24 hours left to apply for {{company}} ({{role}}). Apply now: {{link}}',
    },
    sms: {
      body: 'PLACEearly: 24h left to apply for {{company}}. Submit: {{link}}',
    },
  },
  'drive.deadline_3h': {
    in_app: {
      title: 'Final Call: 3 Hours Left for {{company}}',
      body: 'Drive closes in 3 hours. Complete your application now.',
      deepLink: '/student/dashboard',
    },
    email: {
      subject: 'Final Call: 3 Hours Left for {{company}}',
      bodyHtml:
        '<p>Dear {{studentName}},</p><p>This is your final reminder. Applications for <strong>{{company}}</strong> close in 3 hours.</p><p><a href="{{link}}">Apply Now</a></p>',
      bodyText:
        'Dear {{studentName}}, applications for {{company}} close in 3 hours. Apply: {{link}}',
    },
    push: {
      title: '3 Hours Remaining: {{company}}',
      body: 'Final call to submit your application for {{company}}.',
      deepLink: '/student/dashboard',
    },
    whatsapp: {
      templateName: 'urgent_deadline',
      body: 'Final call {{studentName}}! 3 hours left for {{company}} drive. Complete application: {{link}}',
    },
    sms: {
      body: 'PLACEearly: Final 3 hours for {{company}}. Apply now: {{link}}',
    },
  },
  'application.status_changed': {
    in_app: {
      title: 'Application Update: {{company}}',
      body: 'Your status has moved to {{status}} for {{company}}.',
      deepLink: '/student/dashboard',
    },
    email: {
      subject: 'Application Status Update: {{company}} - {{status}}',
      bodyHtml:
        '<p>Dear {{studentName}},</p><p>Your application for <strong>{{company}}</strong> ({{role}}) has been updated to: <strong>{{status}}</strong>.</p><p><a href="{{link}}">View Drive Status</a></p>',
      bodyText:
        'Dear {{studentName}}, your application for {{company}} is now: {{status}}. Details: {{link}}',
    },
    push: {
      title: 'Application Update: {{company}}',
      body: 'Status moved to: {{status}}.',
      deepLink: '/student/dashboard',
    },
    whatsapp: {
      templateName: 'application_update',
      body: 'Hi {{studentName}}, your application status for {{company}} is updated to: {{status}}. View details: {{link}}',
    },
    sms: {
      body: 'PLACEearly: {{company}} application updated to {{status}}. Details: {{link}}',
    },
  },
  'interview.scheduled': {
    in_app: {
      title: 'Interview Scheduled: {{company}}',
      body: '{{roundName}} on {{date}} at {{time}}. {{linkOrRoom}}.',
      deepLink: '/student/dashboard',
    },
    email: {
      subject: 'Interview Scheduled: {{company}} - {{roundName}}',
      bodyHtml:
        '<p>Dear {{studentName}},</p><p>Your interview for <strong>{{company}}</strong> ({{roundName}}) has been scheduled.</p><p>Date: <strong>{{date}}</strong> at <strong>{{time}}</strong></p><p>Location/Link: <strong>{{linkOrRoom}}</strong></p><p><a href="{{link}}">View Schedule Details</a></p>',
      bodyText:
        'Dear {{studentName}}, your {{roundName}} interview with {{company}} is scheduled on {{date}} at {{time}}. Link/Location: {{linkOrRoom}}.',
    },
    push: {
      title: 'Interview: {{company}}',
      body: '{{roundName}} on {{date}} at {{time}}.',
      deepLink: '/student/dashboard',
    },
    whatsapp: {
      templateName: 'interview_invitation',
      body: 'Hi {{studentName}}, interview scheduled with {{company}} for {{roundName}} on {{date}} at {{time}}. Link: {{linkOrRoom}}',
    },
    sms: {
      body: 'PLACEearly: Interview with {{company}} on {{date}} at {{time}}. Details: {{link}}',
    },
  },
  'interview.reminder_1d': {
    in_app: {
      title: 'Interview Tomorrow: {{company}}',
      body: 'Your {{roundName}} interview is tomorrow at {{time}}.',
      deepLink: '/student/dashboard',
    },
    email: {
      subject: 'Reminder: Interview with {{company}} Tomorrow at {{time}}',
      bodyHtml:
        '<p>Dear {{studentName}},</p><p>This is a reminder that your interview with <strong>{{company}}</strong> is tomorrow, {{date}} at <strong>{{time}}</strong>.</p><p>Link/Room: <strong>{{linkOrRoom}}</strong></p>',
      bodyText:
        'Dear {{studentName}}, interview with {{company}} is tomorrow at {{time}}. Link/Room: {{linkOrRoom}}.',
    },
    push: {
      title: 'Interview Tomorrow: {{company}}',
      body: 'Scheduled at {{time}}. Be prepared!',
      deepLink: '/student/dashboard',
    },
    whatsapp: {
      templateName: 'interview_reminder_1d',
      body: 'Hi {{studentName}}, reminder: {{company}} interview is tomorrow at {{time}}. Link: {{linkOrRoom}}',
    },
    sms: {
      body: 'PLACEearly: Interview with {{company}} tomorrow at {{time}}.',
    },
  },
  'interview.reminder_1h': {
    in_app: {
      title: 'Interview in 1 Hour: {{company}}',
      body: 'Starts at {{time}}. Room / Link: {{linkOrRoom}}.',
      deepLink: '/student/dashboard',
    },
    email: {
      subject: 'Starting in 1 Hour: Interview with {{company}}',
      bodyHtml:
        '<p>Dear {{studentName}},</p><p>Your interview with <strong>{{company}}</strong> starts in 1 hour at <strong>{{time}}</strong>.</p><p><a href="{{linkOrRoom}}">Join Interview Session</a></p>',
      bodyText:
        'Dear {{studentName}}, interview with {{company}} starts in 1 hour ({{time}}). Join: {{linkOrRoom}}',
    },
    push: {
      title: 'Interview in 1 Hour: {{company}}',
      body: 'Starts at {{time}}. Please be online 10 mins prior.',
      deepLink: '/student/dashboard',
    },
    whatsapp: {
      templateName: 'interview_reminder_1h',
      body: 'Urgent {{studentName}}: Your interview with {{company}} starts in 1 hour at {{time}}. Join: {{linkOrRoom}}',
    },
    sms: {
      body: 'PLACEearly: {{company}} interview in 1 hour ({{time}}). Join: {{linkOrRoom}}',
    },
  },
  'offer.extended': {
    in_app: {
      title: 'Congratulations! Offer from {{company}}',
      body: '{{company}} has extended you a formal offer of {{ctc}} LPA!',
      deepLink: '/student/dashboard',
    },
    email: {
      subject: 'Congratulations! Job Offer from {{company}} ({{ctc}} LPA)',
      bodyHtml:
        '<p>Dear {{studentName}},</p><p>Heartiest congratulations! <strong>{{company}}</strong> has extended you a formal placement offer for the role of <strong>{{role}}</strong> with an annual compensation of <strong>{{ctc}} LPA</strong>.</p><p><a href="{{link}}">Review & Accept Offer</a></p>',
      bodyText:
        'Dear {{studentName}}, congratulations! {{company}} has extended you an offer for {{role}} ({{ctc}} LPA). Review: {{link}}',
    },
    push: {
      title: '🎉 Job Offer: {{company}}',
      body: 'Congratulations! Offer extended for {{ctc}} LPA.',
      deepLink: '/student/dashboard',
    },
    whatsapp: {
      templateName: 'offer_congratulations',
      body: 'Congratulations {{studentName}}! 🎉 {{company}} has extended you a formal offer of {{ctc}} LPA for {{role}}! Review here: {{link}}',
    },
    sms: {
      body: 'PLACEearly: Congratulations! Offer from {{company}} ({{ctc}} LPA). Details: {{link}}',
    },
  },
  'verification.approved': {
    in_app: {
      title: 'Profile Verified & Cryptographically Sealed',
      body: 'Your academic record has been verified with Ed25519 Seal {{verificationCode}}.',
      deepLink: '/student/dashboard',
    },
    email: {
      subject: 'Academic Record Verified & Ed25519 Sealed',
      bodyHtml:
        '<p>Dear {{studentName}},</p><p>Your academic profile has been verified by the Training & Placement Cell. Your cryptographic verification certificate code is <strong>{{verificationCode}}</strong>.</p><p><a href="{{link}}">View Verified Seal</a></p>',
      bodyText:
        'Dear {{studentName}}, your academic record is verified by TPO with certificate {{verificationCode}}.',
    },
    push: {
      title: 'Profile Verified',
      body: 'Your academic record is now sealed & eligible for all campus drives.',
      deepLink: '/student/dashboard',
    },
    whatsapp: {
      templateName: 'verification_approved',
      body: 'Hi {{studentName}}, your academic profile is verified by TPO (Seal: {{verificationCode}}). You are now eligible for campus drives.',
    },
    sms: {
      body: 'PLACEearly: Your academic profile is verified by TPO (Code: {{verificationCode}}).',
    },
  },
  'verification.rejected': {
    in_app: {
      title: 'Verification Action Required',
      body: 'Your profile verification was rejected: {{reason}}. Please update your marksheet.',
      deepLink: '/student/dashboard',
    },
    email: {
      subject: 'Action Required: Academic Profile Verification',
      bodyHtml:
        '<p>Dear {{studentName}},</p><p>Your academic record verification could not be approved for the following reason:</p><blockquote>{{reason}}</blockquote><p>Please update your academic scores and re-upload your official marksheet.</p><p><a href="{{link}}">Update Profile</a></p>',
      bodyText:
        'Dear {{studentName}}, verification was not approved: {{reason}}. Please update marksheet: {{link}}',
    },
    push: {
      title: 'Verification Issue',
      body: 'Profile verification requires attention: {{reason}}',
      deepLink: '/student/dashboard',
    },
    whatsapp: {
      templateName: 'verification_rejected',
      body: 'Hi {{studentName}}, your profile verification was not approved: {{reason}}. Please re-upload marksheet: {{link}}',
    },
    sms: {
      body: 'PLACEearly: Profile verification needs attention: {{reason}}. Update: {{link}}',
    },
  },
  'announcement.sent': {
    in_app: {
      title: 'TPO Announcement: {{title}}',
      body: '{{bodySnippet}}',
      deepLink: '/student/dashboard',
    },
    email: {
      subject: 'TPO Notice: {{title}}',
      bodyHtml:
        '<p>Dear {{studentName}},</p><p>{{body}}</p><p><a href="{{link}}">Open Announcement</a></p>',
      bodyText: 'Dear {{studentName}}, {{body}} Link: {{link}}',
    },
    push: {
      title: 'TPO Announcement',
      body: '{{title}}',
      deepLink: '/student/dashboard',
    },
    whatsapp: {
      templateName: 'campus_announcement',
      body: 'TPO Notice: {{title}}\n\n{{bodySnippet}}\n\nLink: {{link}}',
    },
    sms: {
      body: 'PLACEearly TPO Alert: {{title}}. Details: {{link}}',
    },
  },
  'system.test_send': {
    in_app: {
      title: 'Test Notification Received',
      body: 'This is a test notification verifying your delivery pipeline configuration.',
      deepLink: '/tpo/settings',
    },
    email: {
      subject: 'PLACEearly: Test Notification Delivery',
      bodyHtml:
        '<p>Hello {{studentName}},</p><p>This is a live test notification verifying your email delivery pipeline.</p>',
      bodyText: 'Hello {{studentName}}, test notification delivery verified.',
    },
    push: {
      title: 'Test Notification',
      body: 'Web push delivery channel is operating normally.',
      deepLink: '/tpo/settings',
    },
    whatsapp: {
      templateName: 'test_notification',
      body: 'Hello {{studentName}}, this is a test notification verifying WhatsApp delivery on PLACEearly.',
    },
    sms: {
      body: 'PLACEearly: Test notification delivery verified.',
    },
  },
};

const notificationTemplateSchema = new mongoose.Schema(
  {
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College',
      required: true,
      index: true,
    },
    eventType: {
      type: String,
      required: true,
      index: true,
    },
    channels: {
      in_app: {
        title: { type: String, default: '' },
        body: { type: String, default: '' },
        deepLink: { type: String, default: '' },
      },
      email: {
        subject: { type: String, default: '' },
        bodyHtml: { type: String, default: '' },
        bodyText: { type: String, default: '' },
      },
      push: {
        title: { type: String, default: '' },
        body: { type: String, default: '' },
        deepLink: { type: String, default: '' },
      },
      whatsapp: {
        templateName: { type: String, default: '' },
        body: { type: String, default: '' },
      },
      sms: {
        body: { type: String, default: '' },
      },
    },
  },
  { timestamps: true }
);

notificationTemplateSchema.index({ collegeId: 1, eventType: 1 }, { unique: true });
notificationTemplateSchema.plugin(tenantPlugin, { required: true });

module.exports = mongoose.model('NotificationTemplate', notificationTemplateSchema);
module.exports.DEFAULT_TEMPLATES = DEFAULT_TEMPLATES;
