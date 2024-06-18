import { SetMetadata } from '@nestjs/common';
export const OTP_KEY = 'otp';
export const OTP = (...otp: any) => SetMetadata(OTP_KEY, otp);
