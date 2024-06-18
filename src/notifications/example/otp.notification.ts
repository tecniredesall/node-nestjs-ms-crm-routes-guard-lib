import { PubMessagingService } from '@app/messaging/pub-messaging.service';
import { Injectable } from '@nestjs/common';
import { Notification } from '../notifications';

@Injectable()
export class OTPNotification extends Notification {
  protected via: Array<string> = ['sms', 'email'];
  private payload: any;
  private email: string;
  private phoneNumber: string;
  private callingCode: string;
  private subject: string;
  private attach: any;
  constructor(private readonly pubMessage: PubMessagingService) {
    super();
  }
  async sendEmail() {
    const view = await this.render('otp.hbs', {
      ...this.payload,
      title: this.subject,
    });
    const data = {
      eventType: 'commodity.email',
      payload: {
        email: this.email,
        subject: this.subject,
        htmlBody: view,
      },
    };
    this.pubMessage.sendExchange('commodity.email', data);
    return Promise.resolve(true);
  }
  sendSMS() {
    const data = {
      eventType: 'commodity.sms',
      payload: {
        callingCode: '+52',
        phoneNumber: '8128885523',
        message: `DigiBarter envia a você seu código OTP: ${this.payload?.code}`,
      },
    };
    this.pubMessage.sendExchange('commodity.email', data);
    return Promise.resolve(true);
  }
  async send({
    via,
    payload,
    email,
    callingCode,
    phoneNumber,
    subject,
    attach,
  }: {
    via?: Array<string>;
    payload?: any;
    email?: string;
    callingCode?: string;
    phoneNumber?: string;
    subject?: string;
    attach?: any;
  }) {
    this.attach = attach;
    this.subject = subject;
    this.callingCode = callingCode;
    this.phoneNumber = callingCode;

    this.email = email;
    this.payload = payload;
    this.via = via || ['sms', 'email'];
    if (this.via.includes('email')) {
      await this.sendEmail();
    }
    if (this.via.includes('sms') && process.env.NODE_ENV == 'prodcution') {
      await this.sendSMS();
    }
  }
}
