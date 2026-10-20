export interface EmailTimelineEvent {
  id: string;
  event: "Queued" | "Dispatched" | "Delivered" | "Opened" | "Clicked" | "Bounced" | "Failed";
  timestamp: string;
  detail: string;
  ip?: string;
  userAgent?: string;
  location?: string;
}

export interface EmailAttachment {
  name: string;
  size: string;
  type: string;
}

export interface EmailLogItem {
  id: string;
  messageId: string;
  timestamp: string;
  recipientName: string;
  recipientEmail: string;
  recipientRole: "Candidate" | "Interviewer" | "Approver" | "Executive" | "Employee";
  senderName: string;
  senderEmail: string;
  replyTo: string;
  subject: string;
  category: 
    | "Job Offer" 
    | "Interview Invite" 
    | "Assessment" 
    | "Application Link" 
    | "NHO Schedule" 
    | "Internal Approval" 
    | "Weekly Digest" 
    | "Status Update" 
    | "Regret Letter";
  status: "Delivered" | "Opened" | "Clicked" | "Bounced" | "Failed" | "Queued";
  positionTitle: string;
  accountName: string;
  siteLocation: string;
  previewSnippet: string;
  bodyHtml: string;
  bodyText: string;
  timeline: EmailTimelineEvent[];
  technicalMeta: {
    smtpServer: string;
    tlsVersion: string;
    authResults: string;
    bounceReason?: string;
    retryCount: number;
    responseTimeMs: number;
  };
  attachments?: EmailAttachment[];
}

export const INITIAL_EMAIL_LOGS: EmailLogItem[] = [
  {
    id: "EML-2026-0914-001",
    messageId: "<sibs-msg-99210-4821@mail.thesiblingssolutions.com>",
    timestamp: "2026-09-14 14:15:22",
    recipientName: "Roman Cabanes Lausa",
    recipientEmail: "crisanitan1@gmail.com",
    recipientRole: "Candidate",
    senderName: "SiBS Talent Acquisition",
    senderEmail: "careers@thesiblingssolutions.com",
    replyTo: "recruitment@thesiblingssolutions.com",
    subject: "SiBS Employment Offer V2 - Roman Cabanes Lausa - Software Developer",
    category: "Job Offer",
    status: "Clicked",
    positionTitle: "Software Management - Full Stack Developer",
    accountName: "CD - Connect",
    siteLocation: "Tagum City Campus",
    previewSnippet: "Congratulations, Roman! Your approved Employment Offer is attached as a PDF with total daily rate of PHP 1,200.00...",
    bodyHtml: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden; background: #ffffff;">
        <div style="background-color: #042C51; padding: 24px; text-align: left;">
          <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 800; letter-spacing: 0.5px;">SiBS TALENT ACQUISITION</h1>
          <p style="color: #94A3B8; margin: 4px 0 0 0; font-size: 12px;">Official Candidate Communication System</p>
        </div>
        <div style="padding: 28px;">
          <h2 style="color: #042C51; font-size: 18px; margin-top: 0;">Congratulations, Roman Cabanes Lausa!</h2>
          <p style="color: #334155; font-size: 14px; line-height: 1.6;">
            We are pleased to extend an official <strong>Employment Offer</strong> for you to join The Siblings Solutions family.
          </p>
          <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
              <tr>
                <td style="color: #64748B; padding: 6px 0;">Designation:</td>
                <td style="color: #042C51; font-weight: 700; text-align: right;">Software Management - Full Stack Developer</td>
              </tr>
              <tr>
                <td style="color: #64748B; padding: 6px 0;">Assigned Account:</td>
                <td style="color: #042C51; font-weight: 700; text-align: right;">CD - Connect</td>
              </tr>
              <tr>
                <td style="color: #64748B; padding: 6px 0;">Reporting Site:</td>
                <td style="color: #042C51; font-weight: 700; text-align: right;">Tagum City Campus</td>
              </tr>
              <tr>
                <td style="color: #64748B; padding: 6px 0;">Basic Daily Rate:</td>
                <td style="color: #042C51; font-weight: 700; text-align: right;">PHP 900.00</td>
              </tr>
              <tr>
                <td style="color: #64748B; padding: 6px 0;">De Minimis Rate:</td>
                <td style="color: #042C51; font-weight: 700; text-align: right;">PHP 300.00</td>
              </tr>
              <tr style="border-top: 1px solid #CBD5E1;">
                <td style="color: #042C51; font-weight: 800; padding: 8px 0 0 0;">Total Daily Rate:</td>
                <td style="color: #FF5C28; font-weight: 900; font-size: 15px; text-align: right; padding: 8px 0 0 0;">PHP 1,200.00</td>
              </tr>
            </table>
          </div>
          <p style="color: #334155; font-size: 13px;">
            Please review the attached formal Offer Letter PDF. You can directly record your formal decision using the secure portal links below:
          </p>
          <div style="text-align: center; margin: 28px 0;">
            <a href="https://portal.thesiblingssolutions.com/offer/accept?token=982a-bc91-2026" style="background-color: #042C51; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 13px; display: inline-block; margin-right: 12px;">Accept Offer</a>
            <a href="https://portal.thesiblingssolutions.com/offer/negotiate?token=982a-bc91-2026" style="background-color: #F1F5F9; color: #475569; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 13px; display: inline-block;">Request Discussion</a>
          </div>
          <p style="color: #94A3B8; font-size: 11px; line-height: 1.5;">
            * This offer confirmation link remains active for 168 hours (7 business days) and will expire on September 21, 2026.
          </p>
        </div>
        <div style="background-color: #F1F5F9; padding: 16px; border-top: 1px solid #E2E8F0; text-align: center; font-size: 11px; color: #64748B;">
          The Siblings Solutions, Inc. • People Operations & Talent Acquisition<br/>
          Inquiries: careers@thesiblingssolutions.com • (084) 216-9901
        </div>
      </div>
    `,
    bodyText: `Congratulations, Roman Cabanes Lausa!\n\nWe are pleased to extend an official Employment Offer for the Software Management - Full Stack Developer role at CD - Connect (Tagum City Campus).\nTotal Daily Rate: PHP 1,200.00.\n\nReview your offer at https://portal.thesiblingssolutions.com/offer/accept?token=982a-bc91-2026`,
    timeline: [
      { id: "ev-1", event: "Queued", timestamp: "2026-09-14 14:15:20", detail: "Enqueued by TA System Offer Automation Engine" },
      { id: "ev-2", event: "Dispatched", timestamp: "2026-09-14 14:15:22", detail: "Sent via Google Workspace Relay SMTP (142.250.157.108)" },
      { id: "ev-3", event: "Delivered", timestamp: "2026-09-14 14:15:24", detail: "Accepted by recipient MX mx.google.com (250 2.0.0 OK)" },
      { id: "ev-4", event: "Opened", timestamp: "2026-09-14 14:18:05", detail: "Opened on Apple Mail (macOS) from IP 112.198.88.42 (Davao, PH)", ip: "112.198.88.42", userAgent: "AppleWebKit/605.1.15", location: "Davao City, Philippines" },
      { id: "ev-5", event: "Clicked", timestamp: "2026-09-14 14:19:30", detail: "Clicked link: Accept Offer CTA Portal", ip: "112.198.88.42", location: "Davao City, Philippines" }
    ],
    technicalMeta: {
      smtpServer: "smtp.gmail.com:587 (TLSv1.3)",
      tlsVersion: "TLS_AES_128_GCM_SHA256 (256-bit)",
      authResults: "spf=pass (google.com) dkim=pass header.i=@thesiblingssolutions.com dmarc=pass",
      retryCount: 0,
      responseTimeMs: 342
    },
    attachments: [
      { name: "SiBS_Offer_Letter_Roman_Lausa_signed.pdf", size: "284 KB", type: "application/pdf" },
      { name: "Benefits_Summary_Handbook_2026.pdf", size: "1.2 MB", type: "application/pdf" }
    ]
  },
  {
    id: "EML-2026-0914-002",
    messageId: "<sibs-msg-99211-1049@mail.thesiblingssolutions.com>",
    timestamp: "2026-09-14 13:40:10",
    recipientName: "Mighty Yena Labus",
    recipientEmail: "mightyyena@gmail.com",
    recipientRole: "Candidate",
    senderName: "Alena Batacan",
    senderEmail: "alena.batacan@thesiblingssolutions.com",
    replyTo: "alena.batacan@thesiblingssolutions.com",
    subject: "Final Interview Schedule Confirmation - Mighty Yena Labus",
    category: "Interview Invite",
    status: "Opened",
    positionTitle: "Customer Service Representative - Healthcare",
    accountName: "AHG Inbound/Outbound",
    siteLocation: "Davao City Site",
    previewSnippet: "Hi Mighty, Your Final Interview with Director Raul Jr. Nadela has been scheduled for tomorrow Tuesday, September 15 at 1:00 PM...",
    bodyHtml: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden; background: #ffffff;">
        <div style="background-color: #042C51; padding: 24px; text-align: left;">
          <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 800;">SiBS INTERVIEW NOTIFICATION</h1>
          <p style="color: #94A3B8; margin: 4px 0 0 0; font-size: 12px;">Candidate Assessment & Scheduling</p>
        </div>
        <div style="padding: 28px;">
          <h2 style="color: #042C51; font-size: 18px; margin-top: 0;">Final Interview Confirmed</h2>
          <p style="color: #334155; font-size: 14px; line-height: 1.6;">
            Dear Mighty Yena,
          </p>
          <p style="color: #334155; font-size: 14px; line-height: 1.6;">
            We are pleased to invite you to your <strong>Final Operations Interview</strong> for the <strong>Customer Service Representative - Healthcare</strong> position.
          </p>
          <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 18px; margin: 20px 0;">
            <p style="margin: 0 0 8px 0; font-size: 13px; color: #64748B;">📅 <strong>Date & Time:</strong> Tuesday, September 15, 2026 at 1:00 PM (GMT+8)</p>
            <p style="margin: 0 0 8px 0; font-size: 13px; color: #64748B;">📍 <strong>Interview Mode:</strong> Face-to-Face On-Site (Davao City Campus, Boardroom B)</p>
            <p style="margin: 0 0 8px 0; font-size: 13px; color: #64748B;">👤 <strong>Interviewer:</strong> Raul Jr. Amora Nadela (Director of Operations)</p>
            <p style="margin: 0; font-size: 13px; color: #64748B;">⏱️ <strong>Estimated Duration:</strong> 35 - 45 Minutes</p>
          </div>
          <p style="color: #334155; font-size: 13px; line-height: 1.6;">
            Please arrive at least 15 minutes prior to your scheduled time with one valid government ID. Smart casual or business attire is required.
          </p>
          <div style="text-align: center; margin: 24px 0;">
            <a href="https://portal.thesiblingssolutions.com/calendar/confirm?intv=INTV-2026-0811" style="background-color: #042C51; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 13px; display: inline-block;">Confirm Attendance</a>
          </div>
        </div>
      </div>
    `,
    bodyText: `Dear Mighty Yena Labus,\n\nYour Final Interview for Customer Service Representative - Healthcare is scheduled for Tuesday, September 15, 2026 at 1:00 PM at Davao City Campus with Raul Jr. Nadela.\n\nPlease confirm at https://portal.thesiblingssolutions.com/calendar/confirm?intv=INTV-2026-0811`,
    timeline: [
      { id: "ev-6", event: "Queued", timestamp: "2026-09-14 13:40:08", detail: "Triggered from Interview Scheduling Modal by Alena Batacan" },
      { id: "ev-7", event: "Dispatched", timestamp: "2026-09-14 13:40:10", detail: "Sent via SendGrid SMTP Relay" },
      { id: "ev-8", event: "Delivered", timestamp: "2026-09-14 13:40:12", detail: "Accepted by Gmail MX (250 OK: queued as d87a-621)" },
      { id: "ev-9", event: "Opened", timestamp: "2026-09-14 13:45:33", detail: "Opened on Chrome Mobile (Android 14) from IP 120.29.74.19", ip: "120.29.74.19", location: "Davao City, Philippines" }
    ],
    technicalMeta: {
      smtpServer: "smtp.sendgrid.net:587",
      tlsVersion: "TLSv1.3 / AES_256_GCM",
      authResults: "spf=pass dkim=pass dmarc=pass",
      retryCount: 0,
      responseTimeMs: 298
    }
  },
  {
    id: "EML-2026-0914-003",
    messageId: "<sibs-msg-99212-3301@mail.thesiblingssolutions.com>",
    timestamp: "2026-09-14 11:20:00",
    recipientName: "Crister Alberca Canitan",
    recipientEmail: "crister.canitan@thesiblingssolutions.com",
    recipientRole: "Approver",
    senderName: "SiBS Approval Bot",
    senderEmail: "notifications@thesiblingssolutions.com",
    replyTo: "no-reply@thesiblingssolutions.com",
    subject: "Action Required: Compensation Offer Review for Carlos Miguel Santos",
    category: "Internal Approval",
    status: "Delivered",
    positionTitle: "Technical Support Specialist - L2",
    accountName: "Atlas Telecom",
    siteLocation: "Tagum City Campus",
    previewSnippet: "Dear VP Crister Canitan, A proposed employment offer for Carlos Miguel Santos (Total Daily Rate: PHP 1,350.00) awaits your digital review...",
    bodyHtml: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden; background: #ffffff;">
        <div style="background-color: #042C51; padding: 20px; text-align: left;">
          <h2 style="color: #ffffff; margin: 0; font-size: 18px;">SiBS WORKFORCE EXECUTIVE APPROVAL</h2>
        </div>
        <div style="padding: 24px;">
          <p style="color: #334155; font-size: 14px;"><strong>Attention:</strong> Crister Alberca Canitan (VP of Call Center Operations)</p>
          <p style="color: #334155; font-size: 14px;">A new employment offer has been endorsed by Talent Acquisition and requires VP-level concurrence:</p>
          <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; padding: 16px; border-radius: 8px; font-size: 13px;">
            <p style="margin: 4px 0;"><strong>Candidate:</strong> Carlos Miguel Santos</p>
            <p style="margin: 4px 0;"><strong>Position:</strong> Technical Support Specialist - L2</p>
            <p style="margin: 4px 0;"><strong>Account:</strong> Atlas Telecom (Cluster B)</p>
            <p style="margin: 4px 0;"><strong>Proposed Total Rate:</strong> PHP 1,350.00 / day</p>
            <p style="margin: 4px 0;"><strong>Target Start Date:</strong> September 28, 2026</p>
          </div>
          <div style="text-align: center; margin: 24px 0;">
            <a href="https://hris.thesiblingssolutions.com/recruitment/offers?id=OFF-2026-0902" style="background-color: #FF5C28; color: #ffffff; padding: 10px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 13px;">Review & Approve in HRIS</a>
          </div>
        </div>
      </div>
    `,
    bodyText: `Action Required: Offer Review for Carlos Miguel Santos (Technical Support Specialist - L2). Log in to SiBS HRIS to approve or reject.`,
    timeline: [
      { id: "ev-10", event: "Queued", timestamp: "2026-09-14 11:19:58", detail: "Generated upon TA Offer Extension" },
      { id: "ev-11", event: "Dispatched", timestamp: "2026-09-14 11:20:00", detail: "Internal Relay to Google Workspace" },
      { id: "ev-12", event: "Delivered", timestamp: "2026-09-14 11:20:02", detail: "Delivered to crister.canitan@thesiblingssolutions.com (Inbox)" }
    ],
    technicalMeta: {
      smtpServer: "smtp.gmail.com:465",
      tlsVersion: "TLSv1.3",
      authResults: "spf=pass dkim=pass dmarc=pass",
      retryCount: 0,
      responseTimeMs: 210
    }
  },
  {
    id: "EML-2026-0914-004",
    messageId: "<sibs-msg-99213-7721@mail.thesiblingssolutions.com>",
    timestamp: "2026-09-14 10:05:44",
    recipientName: "Mark Reyes",
    recipientEmail: "mark.reyes@yahoo.com",
    recipientRole: "Candidate",
    senderName: "SiBS Talent Acquisition",
    senderEmail: "careers@thesiblingssolutions.com",
    replyTo: "recruitment@thesiblingssolutions.com",
    subject: "SiBS Job Application Link - Customer Service Representative",
    category: "Application Link",
    status: "Delivered",
    positionTitle: "Customer Service Representative",
    accountName: "AHG Inbound/Outbound",
    siteLocation: "Davao City Site",
    previewSnippet: "Thank you for visiting the SiBS Job Fair booth at SM City Davao. Complete your 5-minute online intake profile...",
    bodyHtml: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden; background: #ffffff;">
        <div style="background-color: #042C51; padding: 24px;">
          <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 800;">Welcome to The Siblings Solutions!</h1>
        </div>
        <div style="padding: 24px;">
          <p style="color: #334155; font-size: 14px;">Hi Mark,</p>
          <p style="color: #334155; font-size: 14px; line-height: 1.6;">
            Thank you for expressing your interest at our <strong>SM City Davao Job Fair Booth</strong>!
          </p>
          <p style="color: #334155; font-size: 14px; line-height: 1.6;">
            To formalize your application for the <strong>Customer Service Representative</strong> role, please complete your online applicant intake form by clicking the link below:
          </p>
          <div style="text-align: center; margin: 24px 0;">
            <a href="https://careers.thesiblingssolutions.com/apply?lead=LEAD-2026-0003" style="background-color: #042C51; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 13px;">Complete Online Application</a>
          </div>
          <p style="color: #64748B; font-size: 12px;">This form includes your basic information, shift availability, and 45-second audio self-introduction.</p>
        </div>
      </div>
    `,
    bodyText: `Hi Mark Reyes,\nThank you for visiting SiBS at SM City Davao Job Fair. Please complete your application form at https://careers.thesiblingssolutions.com/apply?lead=LEAD-2026-0003`,
    timeline: [
      { id: "ev-13", event: "Queued", timestamp: "2026-09-14 10:05:40", detail: "Logged by Alena Batacan via Applicant Leads Module" },
      { id: "ev-14", event: "Dispatched", timestamp: "2026-09-14 10:05:44", detail: "Dispatched to Yahoo Mail MX" },
      { id: "ev-15", event: "Delivered", timestamp: "2026-09-14 10:05:48", detail: "Accepted by mta5.am0.yahoodns.net (250 OK: queued as y-2910)" }
    ],
    technicalMeta: {
      smtpServer: "smtp.sendgrid.net:587",
      tlsVersion: "TLSv1.3",
      authResults: "spf=pass dkim=pass dmarc=pass",
      retryCount: 0,
      responseTimeMs: 412
    }
  },
  {
    id: "EML-2026-0914-005",
    messageId: "<sibs-msg-99214-5510@mail.thesiblingssolutions.com>",
    timestamp: "2026-09-14 09:12:30",
    recipientName: "Patricia Gomez",
    recipientEmail: "patricia.gomez@invalid-domain-bounce.xyz",
    recipientRole: "Candidate",
    senderName: "SiBS Talent Acquisition",
    senderEmail: "careers@thesiblingssolutions.com",
    replyTo: "recruitment@thesiblingssolutions.com",
    subject: "Action Required: Complete Your SiBS Typing & Language Diagnostic Test",
    category: "Assessment",
    status: "Bounced",
    positionTitle: "Customer Service Representative",
    accountName: "AHG Inbound/Outbound",
    siteLocation: "Davao City Site",
    previewSnippet: "Hi Patricia, Thank you for your application. To proceed, please take your 15-minute diagnostic assessment...",
    bodyHtml: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #E2E8F0; border-radius: 12px;">
        <h2 style="color: #042C51;">SiBS Online Diagnostic Assessment</h2>
        <p>Hi Patricia,</p>
        <p>Please complete your online assessment using the link below:</p>
        <p><a href="https://assessments.thesiblingssolutions.com/test?id=VRS-9921">Begin Online Assessment</a></p>
      </div>
    `,
    bodyText: `Hi Patricia, Please complete your online assessment at https://assessments.thesiblingssolutions.com/test?id=VRS-9921`,
    timeline: [
      { id: "ev-16", event: "Queued", timestamp: "2026-09-14 09:12:28", detail: "Queued from Assessment Batch Processor" },
      { id: "ev-17", event: "Dispatched", timestamp: "2026-09-14 09:12:30", detail: "Sent to remote destination MX" },
      { id: "ev-18", event: "Failed", timestamp: "2026-09-14 09:12:35", detail: "DNS Query failed: Host not found / No MX records exist for invalid-domain-bounce.xyz" },
      { id: "ev-19", event: "Bounced", timestamp: "2026-09-14 09:12:36", detail: "550 5.1.2 Unrouteable address: Domain does not possess active mail servers" }
    ],
    technicalMeta: {
      smtpServer: "smtp.sendgrid.net:587",
      tlsVersion: "N/A",
      authResults: "Failed MX Lookup",
      bounceReason: "550 5.1.2 Host or domain name not found. Name service error for name=invalid-domain-bounce.xyz type=MX: Host not found",
      retryCount: 2,
      responseTimeMs: 5120
    }
  },
  {
    id: "EML-2026-0914-006",
    messageId: "<sibs-msg-99215-8812@mail.thesiblingssolutions.com>",
    timestamp: "2026-09-14 08:30:15",
    recipientName: "Janica Mae Alcantara",
    recipientEmail: "janica.alcantara@gmail.com",
    recipientRole: "Candidate",
    senderName: "SiBS HR Onboarding",
    senderEmail: "onboarding@thesiblingssolutions.com",
    replyTo: "onboarding@thesiblingssolutions.com",
    subject: "SiBS - New Hire Orientation (NHO) Schedule & Pre-Employment Requirements",
    category: "NHO Schedule",
    status: "Clicked",
    positionTitle: "Sales Development Representative",
    accountName: "Global Cloud Tech",
    siteLocation: "Davao City Site",
    previewSnippet: "Congratulations Janica! Welcome to SiBS. Your New Hire Orientation is confirmed for Friday, September 18, 2026...",
    bodyHtml: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden; background: #ffffff;">
        <div style="background-color: #042C51; padding: 24px;">
          <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 800;">WELCOME TO THE SIBLINGS SOLUTIONS!</h1>
          <p style="color: #94A3B8; margin: 4px 0 0 0; font-size: 12px;">New Hire Orientation (NHO) Protocol</p>
        </div>
        <div style="padding: 24px;">
          <h2 style="color: #042C51; font-size: 18px;">Congratulations, Janica Mae!</h2>
          <p style="color: #334155; font-size: 14px; line-height: 1.6;">
            We are excited to welcome you to our upcoming batch of new team members for <strong>Global Cloud Tech</strong>!
          </p>
          <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 18px; margin: 20px 0;">
            <p style="margin: 0 0 8px 0; font-size: 14px; color: #042C51; font-weight: 700;">📅 Mandatory NHO Date:</p>
            <p style="margin: 0 0 12px 0; font-size: 15px; color: #FF5C28; font-weight: 800;">Friday, September 18, 2026 (08:00 AM - 05:00 PM)</p>
            <p style="margin: 0 0 4px 0; font-size: 13px; color: #64748B;">📍 Location: 4th Floor Training Hall, Davao City Campus</p>
            <p style="margin: 0; font-size: 13px; color: #64748B;">📋 Attire: Business Formal / Corporate Attire</p>
          </div>
          <p style="color: #334155; font-size: 13px;">
            Please bring original and photocopies of SSS, PhilHealth, Pag-IBIG (HDMF), and BIR 1902 forms.
          </p>
          <div style="text-align: center; margin: 24px 0;">
            <a href="https://onboarding.thesiblingssolutions.com/portal/nho?id=NHO-2026-0918" style="background-color: #042C51; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 13px;">Confirm NHO Attendance</a>
          </div>
        </div>
      </div>
    `,
    bodyText: `Welcome Janica! Your NHO is set for Friday, September 18, 2026 at Davao City Campus. Confirm your slot at https://onboarding.thesiblingssolutions.com/portal/nho?id=NHO-2026-0918`,
    timeline: [
      { id: "ev-20", event: "Queued", timestamp: "2026-09-14 08:30:12", detail: "Onboarding dispatch engine batch" },
      { id: "ev-21", event: "Dispatched", timestamp: "2026-09-14 08:30:15", detail: "Google Workspace SMTP Relay" },
      { id: "ev-22", event: "Delivered", timestamp: "2026-09-14 08:30:17", detail: "Accepted by Gmail MX (250 OK)" },
      { id: "ev-23", event: "Opened", timestamp: "2026-09-14 08:34:20", detail: "Opened on iPhone (iOS 17.5) via Gmail App", ip: "112.198.92.11" },
      { id: "ev-24", event: "Clicked", timestamp: "2026-09-14 08:36:01", detail: "Clicked link: Confirm NHO Attendance CTA", ip: "112.198.92.11" }
    ],
    technicalMeta: {
      smtpServer: "smtp.gmail.com:587",
      tlsVersion: "TLSv1.3",
      authResults: "spf=pass dkim=pass dmarc=pass",
      retryCount: 0,
      responseTimeMs: 275
    },
    attachments: [
      { name: "Pre_Employment_Checklist_SiBS.pdf", size: "180 KB", type: "application/pdf" },
      { name: "Medical_Clinic_Referral_Slip.pdf", size: "120 KB", type: "application/pdf" }
    ]
  },
  {
    id: "EML-2026-0914-007",
    messageId: "<sibs-msg-99216-1920@mail.thesiblingssolutions.com>",
    timestamp: "2026-09-14 07:00:02",
    recipientName: "Alena Mendoza Batacan",
    recipientEmail: "alena.batacan@thesiblingssolutions.com",
    recipientRole: "Executive",
    senderName: "SiBS Analytics System",
    senderEmail: "analytics@thesiblingssolutions.com",
    replyTo: "no-reply@thesiblingssolutions.com",
    subject: "SiBS Talent Acquisition Weekly Summary & Operations Digest - Week 37",
    category: "Weekly Digest",
    status: "Opened",
    positionTitle: "All Active Campaigns",
    accountName: "Enterprise Overview",
    siteLocation: "All Sites (Tagum & Davao)",
    previewSnippet: "Weekly TA Digest: 48 New Applicants Sourced, 26 Interviews Conducted, 14 Offers Extended, Overall Ramp Fill Rate 94.2%...",
    bodyHtml: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden; background: #ffffff;">
        <div style="background-color: #042C51; padding: 24px;">
          <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 800;">WEEKLY TA OPERATIONS DIGEST</h1>
          <p style="color: #94A3B8; margin: 4px 0 0 0; font-size: 12px;">Executive Management Briefing</p>
        </div>
        <div style="padding: 24px;">
          <h3 style="color: #042C51;">Executive KPI Highlights (Week 37):</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 16px 0;">
            <div style="background: #F8FAFC; border: 1px solid #E2E8F0; padding: 12px; border-radius: 8px;">
              <p style="color: #64748B; font-size: 11px; margin: 0;">Total Applications:</p>
              <p style="color: #042C51; font-size: 20px; font-weight: 900; margin: 4px 0;">48 Candidates</p>
            </div>
            <div style="background: #F8FAFC; border: 1px solid #E2E8F0; padding: 12px; border-radius: 8px;">
              <p style="color: #64748B; font-size: 11px; margin: 0;">Offers Extended:</p>
              <p style="color: #10B981; font-size: 20px; font-weight: 900; margin: 4px 0;">14 Offers</p>
            </div>
          </div>
          <p style="font-size: 13px; color: #334155;">View the complete weekly report breakdown in the SiBS Weekly Reports module.</p>
        </div>
      </div>
    `,
    bodyText: `Weekly TA Digest (Week 37): 48 Applications, 14 Offers Extended, 94.2% Ramp Coverage. View full report in SiBS HRIS.`,
    timeline: [
      { id: "ev-25", event: "Queued", timestamp: "2026-09-14 07:00:00", detail: "Scheduled Weekly Monday Cron Job" },
      { id: "ev-26", event: "Dispatched", timestamp: "2026-09-14 07:00:02", detail: "Direct Internal SMTP dispatch" },
      { id: "ev-27", event: "Delivered", timestamp: "2026-09-14 07:00:03", detail: "Delivered to alena.batacan@thesiblingssolutions.com" },
      { id: "ev-28", event: "Opened", timestamp: "2026-09-14 07:15:40", detail: "Opened via Outlook Web on Chrome (Windows 11)", ip: "175.158.214.88" }
    ],
    technicalMeta: {
      smtpServer: "smtp.gmail.com:465",
      tlsVersion: "TLSv1.3",
      authResults: "spf=pass dkim=pass dmarc=pass",
      retryCount: 0,
      responseTimeMs: 185
    }
  },
  {
    id: "EML-2026-0913-008",
    messageId: "<sibs-msg-99217-4409@mail.thesiblingssolutions.com>",
    timestamp: "2026-09-13 16:45:10",
    recipientName: "Joshua Dela Cruz",
    recipientEmail: "joshua.delacruz@outlook.com",
    recipientRole: "Candidate",
    senderName: "SiBS Talent Acquisition",
    senderEmail: "careers@thesiblingssolutions.com",
    replyTo: "recruitment@thesiblingssolutions.com",
    subject: "SiBS Application Status Update - Customer Service Representative",
    category: "Regret Letter",
    status: "Opened",
    positionTitle: "Customer Service Representative",
    accountName: "AHG Inbound/Outbound",
    siteLocation: "Davao City Site",
    previewSnippet: "Dear Joshua, Thank you for taking the time to speak with our Talent Acquisition team. Although we were impressed by your background...",
    bodyHtml: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden; background: #ffffff;">
        <div style="background-color: #042C51; padding: 24px;">
          <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 800;">THE SIBLINGS SOLUTIONS</h1>
          <p style="color: #94A3B8; margin: 4px 0 0 0; font-size: 12px;">Candidate Feedback & Status Notification</p>
        </div>
        <div style="padding: 24px;">
          <h2 style="color: #042C51; font-size: 17px;">Application Update</h2>
          <p style="color: #334155; font-size: 14px; line-height: 1.6;">Dear Joshua,</p>
          <p style="color: #334155; font-size: 14px; line-height: 1.6;">
            Thank you for your interest in joining The Siblings Solutions and for the time you dedicated during our initial assessment process.
          </p>
          <p style="color: #334155; font-size: 14px; line-height: 1.6;">
            After careful review of all candidates in relation to the current requirements for the <strong>Customer Service Representative (AHG Healthcare)</strong> account, we have decided to move forward with applicants whose profiles more closely align with our immediate client benchmarks.
          </p>
          <p style="color: #334155; font-size: 14px; line-height: 1.6;">
            We have archived your profile in our active <strong>Talent Pool</strong>, and we will reach out should suitable openings emerge that match your strengths.
          </p>
          <p style="color: #64748B; font-size: 13px; margin-top: 24px;">We wish you every success in your career journey.</p>
        </div>
      </div>
    `,
    bodyText: `Dear Joshua Dela Cruz,\nThank you for applying to SiBS. We have decided to proceed with other candidates whose profiles align with immediate benchmarks. Your profile has been archived in our Talent Pool for future opportunities.`,
    timeline: [
      { id: "ev-29", event: "Queued", timestamp: "2026-09-13 16:45:08", detail: "Triggered upon recruiter disposition: Archived in Talent Pool" },
      { id: "ev-30", event: "Dispatched", timestamp: "2026-09-13 16:45:10", detail: "Sent via SendGrid SMTP Relay" },
      { id: "ev-31", event: "Delivered", timestamp: "2026-09-13 16:45:14", detail: "Delivered to Outlook MX (mail.protection.outlook.com 250 2.6.0)" },
      { id: "ev-32", event: "Opened", timestamp: "2026-09-13 17:12:08", detail: "Opened on Edge (Windows 10) from IP 49.145.22.8", ip: "49.145.22.8" }
    ],
    technicalMeta: {
      smtpServer: "smtp.sendgrid.net:587",
      tlsVersion: "TLSv1.3",
      authResults: "spf=pass dkim=pass dmarc=pass",
      retryCount: 0,
      responseTimeMs: 388
    }
  },
  {
    id: "EML-2026-0913-009",
    messageId: "<sibs-msg-99218-9102@mail.thesiblingssolutions.com>",
    timestamp: "2026-09-13 14:10:00",
    recipientName: "Bea Clarisse Tan",
    recipientEmail: "bea.tan@temporary-mailbox-full.ph",
    recipientRole: "Candidate",
    senderName: "SiBS Talent Acquisition",
    senderEmail: "careers@thesiblingssolutions.com",
    replyTo: "recruitment@thesiblingssolutions.com",
    subject: "Final Interview Schedule - Team Leader Operations",
    category: "Interview Invite",
    status: "Failed",
    positionTitle: "Team Leader - Operations",
    accountName: "US Retail Logistics",
    siteLocation: "Davao City Site",
    previewSnippet: "Hi Bea, We are pleased to confirm your panel interview for the Team Leader position on Wednesday...",
    bodyHtml: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #E2E8F0; border-radius: 12px;">
        <h2 style="color: #042C51;">Interview Invitation: Team Leader</h2>
        <p>Dear Bea,</p>
        <p>Your panel interview is set for Wednesday, September 16, 2026 at 2:30 PM.</p>
      </div>
    `,
    bodyText: `Dear Bea Clarisse Tan, Your interview for Team Leader - Operations is set for Wednesday, September 16 at 2:30 PM.`,
    timeline: [
      { id: "ev-33", event: "Queued", timestamp: "2026-09-13 14:09:55", detail: "Manual interview booking by TA Team" },
      { id: "ev-34", event: "Dispatched", timestamp: "2026-09-13 14:10:00", detail: "Dispatched to remote server" },
      { id: "ev-35", event: "Failed", timestamp: "2026-09-13 14:10:06", detail: "552 5.2.2 Mailbox quota exceeded. The user's mailbox is currently full." }
    ],
    technicalMeta: {
      smtpServer: "smtp.sendgrid.net:587",
      tlsVersion: "TLSv1.2",
      authResults: "spf=pass dkim=pass",
      bounceReason: "552 5.2.2 Quota exceeded: Remote server mailbox cannot accept messages due to disk volume storage limit",
      retryCount: 3,
      responseTimeMs: 6200
    }
  },
  {
    id: "EML-2026-0913-010",
    messageId: "<sibs-msg-99219-1229@mail.thesiblingssolutions.com>",
    timestamp: "2026-09-13 11:00:25",
    recipientName: "Raul Jr. Amora Nadela",
    recipientEmail: "raul.nadela@thesiblingssolutions.com",
    recipientRole: "Interviewer",
    senderName: "SiBS Calendar Coordinator",
    senderEmail: "calendar@thesiblingssolutions.com",
    replyTo: "recruitment@thesiblingssolutions.com",
    subject: "Interview Assigned: Candidate Mighty Yena Labus (CSR Healthcare)",
    category: "Interview Invite",
    status: "Delivered",
    positionTitle: "Customer Service Representative",
    accountName: "AHG Inbound/Outbound",
    siteLocation: "Davao City Site",
    previewSnippet: "Hi Director Raul, An operations assessment interview has been placed on your calendar for Mighty Yena Labus tomorrow at 1:00 PM...",
    bodyHtml: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden; background: #ffffff;">
        <div style="background-color: #042C51; padding: 20px;">
          <h2 style="color: #ffffff; margin: 0; font-size: 18px;">Operations Interview Assignment</h2>
        </div>
        <div style="padding: 24px;">
          <p style="color: #334155; font-size: 14px;">Hi Director Raul,</p>
          <p style="color: #334155; font-size: 14px;">You have been assigned to conduct the Final Interview for:</p>
          <div style="background: #F8FAFC; border: 1px solid #E2E8F0; padding: 16px; border-radius: 8px; font-size: 13px;">
            <p style="margin: 4px 0;"><strong>Candidate:</strong> Mighty Yena Labus</p>
            <p style="margin: 4px 0;"><strong>Target Account:</strong> AHG Inbound/Outbound (Healthcare)</p>
            <p style="margin: 4px 0;"><strong>Schedule:</strong> Tuesday, September 15, 2026 @ 1:00 PM</p>
            <p style="margin: 4px 0;"><strong>Rubric Benchmark:</strong> Min Passing Score 80.0%</p>
          </div>
          <div style="margin-top: 20px;">
            <a href="https://hris.thesiblingssolutions.com/recruitment/settings?tab=interview_form" style="background: #042C51; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-size: 13px; font-weight: bold;">Access Live Scoring Form</a>
          </div>
        </div>
      </div>
    `,
    bodyText: `Interview Assigned: Mighty Yena Labus on Sept 15, 2026 @ 1:00 PM. Review applicant resume and rubric in SiBS HRIS.`,
    timeline: [
      { id: "ev-36", event: "Queued", timestamp: "2026-09-13 11:00:22", detail: "Internal calendar sync" },
      { id: "ev-37", event: "Dispatched", timestamp: "2026-09-13 11:00:25", detail: "Sent via internal mail relay" },
      { id: "ev-38", event: "Delivered", timestamp: "2026-09-13 11:00:26", detail: "Delivered to raul.nadela@thesiblingssolutions.com" }
    ],
    technicalMeta: {
      smtpServer: "smtp.gmail.com:587",
      tlsVersion: "TLSv1.3",
      authResults: "spf=pass dkim=pass dmarc=pass",
      retryCount: 0,
      responseTimeMs: 142
    }
  },
  {
    id: "EML-2026-0912-011",
    messageId: "<sibs-msg-99220-6611@mail.thesiblingssolutions.com>",
    timestamp: "2026-09-12 15:30:00",
    recipientName: "Roland James Labus",
    recipientEmail: "roland.labus@thesiblingssolutions.com",
    recipientRole: "Approver",
    senderName: "SiBS Workforce System",
    senderEmail: "wfm@thesiblingssolutions.com",
    replyTo: "no-reply@thesiblingssolutions.com",
    subject: "Job Description Sign-off Required: WFM Scheduler Lead",
    category: "Internal Approval",
    status: "Delivered",
    positionTitle: "WFM Scheduler Lead",
    accountName: "Shared Services Support",
    siteLocation: "Tagum City Campus",
    previewSnippet: "Hello Roland, A modified Job Description with updated compensable factor weightings is ready for your sign-off...",
    bodyHtml: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #E2E8F0; border-radius: 12px;">
        <h2 style="color: #042C51;">Job Description Approval Needed</h2>
        <p>Hi Roland,</p>
        <p>Please review and endorse the revised compensable factors assessment for <strong>WFM Scheduler Lead</strong> in the Job Descriptions module.</p>
      </div>
    `,
    bodyText: `Job Description Approval Needed for WFM Scheduler Lead. Please review in SiBS HRIS.`,
    timeline: [
      { id: "ev-39", event: "Queued", timestamp: "2026-09-12 15:29:58", detail: "JD Revision workflow trigger" },
      { id: "ev-40", event: "Dispatched", timestamp: "2026-09-12 15:30:00", detail: "Google Workspace Relay" },
      { id: "ev-41", event: "Delivered", timestamp: "2026-09-12 15:30:02", detail: "Delivered to roland.labus@thesiblingssolutions.com" }
    ],
    technicalMeta: {
      smtpServer: "smtp.gmail.com:587",
      tlsVersion: "TLSv1.3",
      authResults: "spf=pass dkim=pass dmarc=pass",
      retryCount: 0,
      responseTimeMs: 198
    }
  },
  {
    id: "EML-2026-0912-012",
    messageId: "<sibs-msg-99221-7890@mail.thesiblingssolutions.com>",
    timestamp: "2026-09-12 09:45:10",
    recipientName: "Hannah Nicole Soriano",
    recipientEmail: "hannah.soriano@gmail.com",
    recipientRole: "Candidate",
    senderName: "SiBS Talent Acquisition",
    senderEmail: "careers@thesiblingssolutions.com",
    replyTo: "recruitment@thesiblingssolutions.com",
    subject: "SiBS Application Received - Quality Assurance Specialist",
    category: "Status Update",
    status: "Opened",
    positionTitle: "Quality Assurance Specialist",
    accountName: "Fintech Billing",
    siteLocation: "Tagum City Campus",
    previewSnippet: "Hi Hannah, We have received your application for the Quality Assurance position. Our team is reviewing your profile...",
    bodyHtml: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #042C51; padding: 24px;">
          <h1 style="color: #fff; margin: 0; font-size: 20px;">Application Acknowledged</h1>
        </div>
        <div style="padding: 24px;">
          <p>Hi Hannah,</p>
          <p>Thank you for applying for <strong>Quality Assurance Specialist (Fintech Billing)</strong>. Your application reference code is <strong>APP-2026-0881</strong>.</p>
          <p>Our recruitment team will review your qualifications and reach out within 2-3 business days.</p>
        </div>
      </div>
    `,
    bodyText: `Hi Hannah, Thank you for applying for Quality Assurance Specialist. Your ref code is APP-2026-0881.`,
    timeline: [
      { id: "ev-42", event: "Queued", timestamp: "2026-09-12 09:45:08", detail: "Triggered by candidate form submission" },
      { id: "ev-43", event: "Dispatched", timestamp: "2026-09-12 09:45:10", detail: "Sent via SendGrid" },
      { id: "ev-44", event: "Delivered", timestamp: "2026-09-12 09:45:12", detail: "Delivered to Gmail MX" },
      { id: "ev-45", event: "Opened", timestamp: "2026-09-12 09:48:30", detail: "Opened on Chrome (macOS)", ip: "180.191.10.12" }
    ],
    technicalMeta: {
      smtpServer: "smtp.sendgrid.net:587",
      tlsVersion: "TLSv1.3",
      authResults: "spf=pass dkim=pass dmarc=pass",
      retryCount: 0,
      responseTimeMs: 310
    }
  }
];

export const EMAIL_LOG_STATS = {
  totalSent30Days: 2845,
  deliveredCount: 2822,
  deliveryRatePercent: 99.19,
  openCount: 2174,
  openRatePercent: 76.41,
  clickCount: 1388,
  clickRatePercent: 48.79,
  bouncedCount: 14,
  failedCount: 9,
  bounceRatePercent: 0.81,
  activeRelay: "Google Workspace & SendGrid Multi-Cluster SMTP",
  relayHealth: "Optimal",
  avgLatencyMs: 44
};
