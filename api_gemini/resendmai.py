import resend
import os
resend.api_key = os.getenv("API_RESEND")

r = resend.Emails.send({
  "from": "onboarding@resend.dev",
  "to": "nhanpp.21it@vku.udn.vn",
  "subject": "Hello World",
  "html": "<p>Congrats on sending your <strong>first email</strong>!</p>"
})