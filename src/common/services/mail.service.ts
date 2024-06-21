import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sendGrid from '@sendgrid/mail';
import { AttachmentData } from '../interfaces/attachment-data.interface';

@Injectable()
export class MailService {
  constructor(private readonly configService: ConfigService) {
    sendGrid.setApiKey(this.configService.get<string>('sendgrid.key'));
  }

  async sendDashboardReport(
    emails: string[],
    attachments: AttachmentData[],
    dashboard_name: string,
    timeframe: string,
  ): Promise<boolean> {
    try {
      const promises = emails.map((email) => {
        const mail: sendGrid.MailDataRequired = {
          to: email,
          from: `Origin Smart Controls <${this.configService.get<string>('sendgrid.from')}>`,
          dynamicTemplateData: {
            dashboard_name,
            timeframe,
          },
          attachments,
          templateId: this.configService.get<string>(
            'sendgrid.dashboardReportTemplate',
          ),
        };
        return sendGrid.send(mail);
      });

      await Promise.all(promises);
    } catch {
      return false;
    }
  }

  async sendDeviceAlert(
    emails: string[],
    device: string,
    value: number,
    datetime: string,
  ): Promise<boolean> {
    try {
      const promises = emails.map((email) => {
        const mail: sendGrid.MailDataRequired = {
          to: email,
          from: `Origin Smart Controls <${this.configService.get<string>('sendgrid.from')}>`,
          dynamicTemplateData: {
            device,
            value,
            datetime,
          },
          templateId: this.configService.get<string>(
            'sendgrid.deviceAlertTemplate',
          ),
        };
        return sendGrid.send(mail);
      });

      await Promise.all(promises);
    } catch {
      return false;
    }
  }
}
