export async function POST(req) {
  try {
    const { email, otp } = await req.json();

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn("RESEND_API_KEY is not defined in environment variables. Email verification is simulated.");
      return Response.json({ 
        success: true, 
        simulated: true, 
        otp,
        message: 'Email verification simulated successfully. Configure RESEND_API_KEY in Secret Manager to enable actual delivery.' 
      });
    }

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'invite@peerbridge.ai';

    if (!email) {
      return Response.json({ success: false, error: 'Recipient email address is required.' }, { status: 400 });
    }

    if (!otp) {
      return Response.json({ success: false, error: 'Verification OTP code is required.' }, { status: 400 });
    }

    // Call the Resend API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        from: `Peer Bridge <${fromEmail}>`,
        to: [email],
        subject: `${otp} is your Peer Bridge verification code`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Peer Bridge Email Verification</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f3f2f0; color: #191919;">
            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border: 1px solid #dae0e9; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); overflow: hidden;">
              <!-- Header -->
              <tr>
                <td style="padding: 30px 40px; background-color: #ffffff; border-bottom: 1px solid #e2e8f0; text-align: center;">
                  <img src="https://peerbridge.ai/logo.png" alt="Peer Bridge Logo" style="height: 48px; max-width: 240px; object-fit: contain;" />
                </td>
              </tr>
              <!-- Body -->
              <tr>
                <td style="padding: 40px 40px 30px 40px;">
                  <h1 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 800; color: #0a66c2; line-height: 1.3;">
                    Verify your email address
                  </h1>
                  <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #5c6670;">
                    Thank you for joining the **Peer Bridge** private broker ecosystem. To complete your onboarding and unlock the credentials gateway, please enter the following verification code on the registration screen:
                  </p>
                  
                  <!-- Token Box -->
                  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px; text-align: center; margin-bottom: 30px;">
                    <span style="display: block; font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px;">
                      Your Verification Code
                    </span>
                    <div style="font-family: monospace; font-size: 32px; font-weight: 800; color: #0a66c2; letter-spacing: 0.15em; background: #e0f2fe; padding: 12px 24px; display: inline-block; border-radius: 6px; border: 1px solid #bae6fd;">
                      ${otp}
                    </div>
                  </div>

                  <p style="margin: 0 0 30px 0; font-size: 14px; line-height: 1.6; color: #64748b; font-style: italic;">
                    Security Note: This verification code is valid for 15 minutes and can only be used once. For your security, do not share this code with anyone. Peer Bridge representatives will never ask for this code.
                  </p>
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="padding: 24px 40px; background-color: #f8fafc; border-top: 1px solid #dae0e9; text-align: center; font-size: 12px; color: #64748b; line-height: 1.5;">
                  <p style="margin: 0 0 6px 0;">© 2026 Peer Bridge Networks Inc. All rights reserved.</p>
                  <p style="margin: 0; font-size: 11px; opacity: 0.75;">
                    Alternative investing is high-risk. Securities are offered under SEC Reg CF or Reg D exclusions. Past performance does not guarantee future results.
                  </p>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Resend API response failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return Response.json({ success: true, ...data });

  } catch (error) {
    console.error("Verification API route failure:", error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
