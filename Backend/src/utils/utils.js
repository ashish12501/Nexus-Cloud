export function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function getOtpHtml(otp) {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nexus Cloud OTP</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #121216; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #121216; padding: 40px 20px;">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 500px; background-color: #1c1c21; border-radius: 16px; padding: 40px; border: 1px solid #2e2e36;">
            <tr>
              <td align="center" style="padding-bottom: 32px;">
                <div style="width: 48px; height: 48px; background-color: #5c4dff; border-radius: 12px; display: inline-block; text-align: center; line-height: 48px;">
                   <span style="color: #ffffff; font-weight: bold; font-size: 24px; font-family: sans-serif;">N</span>
                </div>
                <h1 style="color: #ffffff; font-size: 24px; font-weight: 600; margin: 16px 0 0 0; letter-spacing: 0.5px;">Nexus</h1>
              </td>
            </tr>
            <tr>
              <td align="center">
                <h2 style="color: #ffffff; font-size: 18px; font-weight: 600; margin: 0 0 12px 0;">Verify your identity</h2>
                <p style="color: #8e8e93; font-size: 15px; line-height: 1.6; margin: 0 0 32px 0;">
                  You are attempting to sign in to your Nexus workspace. Please use the verification code below to complete your authentication.
                </p>
                
                <div style="background-color: #151519; border: 1px solid #2e2e36; border-radius: 8px; padding: 24px; margin-bottom: 32px;">
                  <div style="font-size: 36px; font-weight: 700; color: #ffffff; letter-spacing: 12px; text-align: center;">${otp}</div>
                </div>

                <p style="color: #8e8e93; font-size: 14px; line-height: 1.5; margin: 0 0 24px 0;">
                  This code is valid for <strong>10 minutes</strong>. Please do not share it with anyone.
                </p>
                
                <hr style="border: none; border-top: 1px solid #2e2e36; margin: 32px 0;">
                
                <p style="color: #55555d; font-size: 12px; line-height: 1.6; margin: 0;">
                  If you did not request this code, your account is still secure. You can safely ignore this email or contact our support team if you have concerns.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
}
