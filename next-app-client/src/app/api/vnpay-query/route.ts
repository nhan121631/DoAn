import { NextResponse } from "next/server";
import crypto from "crypto";
import dayjs from "dayjs";
import { VNPAY_CONFIG } from "@/lib/vnpay-config";
import { verifyReturnHash } from "@/lib/vnpay-utils";

interface VNPayQueryParams {
  vnp_RequestId: string;
  vnp_Version: string;
  vnp_Command: string;
  vnp_TmnCode: string;
  vnp_TxnRef: string;
  vnp_OrderInfo: string;
  vnp_TransactionDate: string;
  vnp_CreateDate: string;
  vnp_IpAddr: string;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId, transactionDate } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: "Mã đơn hàng không được để trống" },
        { status: 400 }
      );
    }

    const { vnp_TmnCode, vnp_HashSecret, vnp_Api } = VNPAY_CONFIG;

    const requestId = dayjs().format("YYYYMMDDHHmmss");
    const createDate = dayjs().format("YYYYMMDDHHmmss");
    const ipAddr = "127.0.0.1";

    const params: VNPayQueryParams = {
      vnp_RequestId: requestId,
      vnp_Version: "2.1.0",
      vnp_Command: "querydr",
      vnp_TmnCode,
      vnp_TxnRef: orderId,
      vnp_OrderInfo: `Truy van giao dich ${orderId}`,
      vnp_TransactionDate: transactionDate || dayjs().format("YYYYMMDDHHmmss"),
      vnp_CreateDate: createDate,
      vnp_IpAddr: ipAddr,
    };

    // Tạo chữ ký theo cách VNPay query (dùng chuỗi nối trực tiếp)
    const data = `${requestId}|${params.vnp_Version}|${params.vnp_Command}|${vnp_TmnCode}|${orderId}|${params.vnp_TransactionDate}|${createDate}|${ipAddr}|${params.vnp_OrderInfo}`;

    const secureHash = crypto
      .createHmac("sha512", vnp_HashSecret)
      .update(Buffer.from(data, "utf-8"))
      .digest("hex");

    const requestData = {
      ...params,
      vnp_SecureHash: secureHash,
    };

    // Gửi request đến VNPay API
    const response = await fetch(vnp_Api, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    // Xác thực chữ ký phản hồi
    const isValidHash = verifyReturnHash(result);

    if (!isValidHash) {
      return NextResponse.json(
        { error: "Chữ ký phản hồi không hợp lệ" },
        { status: 400 }
      );
    }

    // Giải thích mã phản hồi
    const getResponseMessage = (code: string) => {
      const messages: Record<string, string> = {
        "00": "Giao dịch thành công",
        "01": "Giao dịch chưa hoàn tất",
        "02": "Giao dịch bị lỗi",
        "04": "Giao dịch đảo (Khách hàng đã bị trừ tiền tại Ngân hàng nhưng GD chưa thành công ở VNPAY)",
        "05": "VNPAY đang xử lý giao dịch này (GD hoàn tiền)",
        "06": "VNPAY đã gửi yêu cầu hoàn tiền sang Ngân hàng (GD hoàn tiền)",
        "07": "Giao dịch bị nghi ngờ gian lận",
        "09": "GD Hoàn trả bị từ chối",
        "91": "Không tìm thấy giao dịch yêu cầu",
        "94": "Yêu cầu bị trùng lặp",
        "97": "Chữ ký không hợp lệ",
        "99": "Các lỗi khác",
      };
      return messages[code] || `Mã lỗi: ${code}`;
    };

    return NextResponse.json({
      success: true,
      data: {
        ...result,
        vnp_ResponseCodeMessage: getResponseMessage(result.vnp_ResponseCode),
        vnp_TransactionStatusMessage: getResponseMessage(
          result.vnp_TransactionStatus
        ),
      },
    });
  } catch (error) {
    console.error("VNPay query error:", error);
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi truy vấn giao dịch" },
      { status: 500 }
    );
  }
}
