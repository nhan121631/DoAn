import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const token = body?.token;
    const expectedAction = body?.action;

    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    const secret =
      process.env.RECAPTCHA_SECRET_KEY || process.env.RECAPTCHA_SECRET || "";

    if (!secret) {
      console.error("Missing reCAPTCHA secret key on server");
      return NextResponse.json(
        { error: "Server missing reCAPTCHA secret key" },
        { status: 500 }
      );
    }

    // Call Google's siteverify API
    const params = new URLSearchParams();
    params.append("secret", secret);
    params.append("response", token);

    const googleRes = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
      }
    );

    const data = await googleRes.json();

    // Basic validation: success must be true and, if an expected action was provided, it must match
    const success = !!data?.success;
    const score = typeof data?.score === "number" ? data.score : 0;
    const action = data?.action || null;

    if (!success) {
      return NextResponse.json(
        { success: false, score, action, raw: data },
        { status: 200 }
      );
    }

    if (expectedAction && action && expectedAction !== action) {
      return NextResponse.json(
        { success: false, score, action, error: "action_mismatch", raw: data },
        { status: 200 }
      );
    }

    // Return success and score to the client. Server should still enforce threshold.
    return NextResponse.json(
      { success: true, score, action, raw: data },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error verifying reCAPTCHA token:", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
