import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import * as parser from 'ua-parser-js';

export const UserAgent = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const userAgent = request.headers['user-agent'];
    const parsed = parser(userAgent);
    const browser = parsed.browser.name || 'Unknown browser';
    const os = parsed.os.name || 'Unknown OS';
    const version = parsed.os.version || 'Unknown version';
    return `${browser} - ${os} ${version}`;
  },
);
