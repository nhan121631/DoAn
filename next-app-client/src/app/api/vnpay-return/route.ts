import { NextRequest, NextResponse } from "next/server";
import {
  verifyReturnHash,
  getTransactionStatus,
  // formatCurrency,
} from "@/lib/vnpay-utils";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const query = Object.fromEntries(url.searchParams);

    // Xác thực chữ ký
    const isValidHash = verifyReturnHash(query);

    if (!isValidHash) {
      return NextResponse.json(
        {
          transactionStatus: {
            success: false,
            message: "Chữ ký không hợp lệ. Giao dịch có thể đã bị can thiệp.",
          },
        },
        { status: 400 }
      );
    }

    // Lấy thông tin giao dịch
    const {
      vnp_Amount,
      vnp_BankCode,
      vnp_BankTranNo,
      vnp_CardType,
      vnp_OrderInfo,
      vnp_PayDate,
      vnp_ResponseCode,
      // vnp_TmnCode,
      vnp_TransactionNo,
      vnp_TransactionStatus,
      vnp_TxnRef,
    } = query;

    // Kiểm tra trạng thái giao dịch
    const transactionStatus = getTransactionStatus(vnp_ResponseCode);
    const amount = parseInt(vnp_Amount) / 100; // VNPay trả về số tiền x100

    // Tạo object thông tin thanh toán để lưu
    const paymentInfo = {
      vnp_TxnRef,
      amount,
      vnp_OrderInfo,
      vnp_TransactionNo,
      vnp_BankTranNo,
      vnp_BankCode,
      vnp_CardType,
      vnp_PayDate,
      vnp_ResponseCode,
      vnp_TransactionStatus,
      transactionStatus,
    };

    // TODO: Lưu thông tin thanh toán vào database
    // import { savePaymentToDatabase } from "@/lib/payment-storage";
    // await savePaymentToDatabase(paymentInfo);
    console.log("Payment Info to save:", paymentInfo);

    // Trả về JSON để client render bằng React component
    return NextResponse.json({
      transactionStatus,
      vnp_TxnRef,
      amount,
      vnp_OrderInfo,
      vnp_TransactionNo,
      vnp_BankTranNo,
      vnp_BankCode,
      vnp_CardType,
      vnp_PayDate,
      vnp_ResponseCode,
      vnp_TransactionStatus,
    });
  } catch (error) {
    console.error("VNPay return processing error:", error);
    return NextResponse.json(
      {
        transactionStatus: {
          success: false,
          message:
            "Có lỗi xảy ra khi xử lý kết quả thanh toán. Vui lòng liên hệ bộ phận hỗ trợ.",
        },
      },
      { status: 500 }
    );
  }
}
