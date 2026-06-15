export async function POST(req) {
  try {
    const { emails, code } = await req.json();

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      // If no API key is defined, we log it and return success: true with a "SIMULATED" flag
      // so the user experience doesn't break in dev/local sandboxes.
      console.warn("RESEND_API_KEY is not defined in environment variables. Email sending is simulated.");
      return Response.json({ 
        success: true, 
        simulated: true, 
        message: 'Email invitation simulated successfully. Configure RESEND_API_KEY in Secret Manager to enable actual delivery.' 
      });
    }

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'invite@peerbridge.ai';
    const emailList = Array.isArray(emails) ? emails : [emails];

    if (emailList.length === 0) {
      return Response.json({ success: false, error: 'No recipient email addresses provided.' }, { status: 400 });
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
        to: emailList,
        subject: 'You have been invited to join Peer Bridge',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Peer Bridge Waitlist Invitation</title>
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
                    Welcome to the Private Capital & AI Brokerage Ecosystem
                  </h1>
                  <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #5c6670;">
                    You have been granted exclusive access to join the **Peer Bridge** private network. 
                    Peer Bridge connects Entrepreneurs, Accredited Investors, and Vetted Corporate Affiliates through ADP payroll underwriting bypass and autonomous AI broker negotiations.
                  </p>
                  
                  <!-- Token Box -->
                  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 30px;">
                    <span style="display: block; font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">
                      Your Invitation Code
                    </span>
                    <code style="font-family: monospace; font-size: 20px; font-weight: 800; color: #0a66c2; letter-spacing: 0.05em; background: #e0f2fe; padding: 6px 12px; border-radius: 4px; border: 1px solid #bae6fd;">
                      ${code}
                    </code>
                  </div>

                  <p style="margin: 0 0 30px 0; font-size: 15px; line-height: 1.6; color: #5c6670;">
                    To complete your registration, click the button below and paste your invitation code when prompted during sign-up:
                  </p>

                  <!-- CTA Button -->
                  <div style="text-align: center; margin-bottom: 30px;">
                    <a href="https://peerbridge.ai" style="display: inline-block; background-color: #0a66c2; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 700; padding: 12px 32px; border-radius: 30px; box-shadow: 0 2px 4px rgba(10,102,194,0.25); transition: background-color 0.2s ease;">
                      Access Peer Bridge Gateway →
                    </a>
                  </div>

                  <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #64748b; font-style: italic;">
                    Note: Early membership is complimentary until June 2027. This invitation code is unique and registered to your email.
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
    console.error("Invite API route failure:", error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
