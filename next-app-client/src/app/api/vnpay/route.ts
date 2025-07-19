import { NextResponse } from "next/server";
import { createPaymentUrl, getClientIP } from "@/lib/vnpay-utils";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, orderInfo, bankCode } = body;

    // Validate input
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Số tiền không hợp lệ" },
        { status: 400 }
      );
    }

    // Lấy IP thực của client
    const ipAddr = getClientIP(req);

    // Tạo thông tin đơn hàng mặc định nếu không có
    const finalOrderInfo = orderInfo || `Thanh toan don hang ${Date.now()}`;

    // Tạo URL thanh toán
    const paymentUrl = createPaymentUrl(
      amount,
      finalOrderInfo,
      ipAddr,
      bankCode
    );

    return NextResponse.json({
      url: paymentUrl,
      orderId: paymentUrl.match(/vnp_TxnRef=([^&]*)/)?.[1],
      amount: amount,
      orderInfo: finalOrderInfo,
    });
  } catch (error) {
    console.error("VNPay payment error:", error);
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi tạo thanh toán" },
      { status: 500 }
    );
  }
}
