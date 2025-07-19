/* eslint-disable @typescript-eslint/no-explicit-any */
import crypto from "crypto";
import qs from "qs";
import dayjs from "dayjs";
import { VNPAY_CONFIG } from "./vnpay-config";

// ===== TYPES =====
export interface VNPayParams {
  vnp_Version: string;
  vnp_Command: string;
  vnp_TmnCode: string;
  vnp_Amount: string;
  vnp_CurrCode: string;
  vnp_TxnRef: string;
  vnp_OrderInfo: string;
  vnp_OrderType: string;
  vnp_Locale: string;
  vnp_ReturnUrl: string;
  vnp_IpAddr: string;
  vnp_CreateDate: string;
  vnp_BankCode?: string;
  [key: string]: string | undefined;
}

// ===== HELPER FUNCTIONS =====

/**
 * Sắp xếp object theo key và encode (theo cách VNPay yêu cầu)
 */
function sortObject(obj: Record<string, any>): Record<string, string> {
  const sorted: Record<string, string> = {};
  const keys: string[] = [];

  // Lấy tất cả keys và encode
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      keys.push(encodeURIComponent(key));
    }
  }

  // Sắp xếp keys theo alphabet
  keys.sort();

  // Tạo object đã sắp xếp với values được encode
  for (const key of keys) {
    const decodedKey = decodeURIComponent(key);
    sorted[key] = encodeURIComponent(obj[decodedKey]).replace(/%20/g, "+");
  }

  return sorted;
}

// ===== MAIN FUNCTIONS =====

/**
 * Tạo chữ ký bảo mật cho các request thông thường (thanh toán, return)
 */
export function createSecureHash(
  params: Record<string, string>,
  hashSecret: string
): string {
  // Loại bỏ các tham số không cần thiết cho chữ ký
  const filteredParams = { ...params };
  delete filteredParams.vnp_SecureHash;
  delete filteredParams.vnp_SecureHashType;

  // Sắp xếp và tạo query string
  const sortedParams = sortObject(filteredParams);
  const signData = qs.stringify(sortedParams, { encode: false });

  // Tạo chữ ký HMAC SHA512
  return crypto
    .createHmac("sha512", hashSecret)
    .update(Buffer.from(signData, "utf-8"))
    .digest("hex");
}

/**
 * Tạo URL thanh toán VNPay
 */
export function createPaymentUrl(
  amount: number,
  orderInfo: string,
  ipAddr: string = "127.0.0.1",
  bankCode?: string
): string {
  const { vnp_TmnCode, vnp_HashSecret, vnp_ReturnUrl, vnp_Url } = VNPAY_CONFIG;

  const date = dayjs().format("YYYYMMDDHHmmss");
  const orderId = dayjs().format("DDHHmmss");

  const params: VNPayParams = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode,
    vnp_Amount: String(amount * 100), // VNPay yêu cầu số tiền x100
    vnp_CurrCode: "VND",
    vnp_TxnRef: orderId,
    vnp_OrderInfo: orderInfo,
    vnp_OrderType: "other",
    vnp_Locale: "vn",
    vnp_ReturnUrl,
    vnp_IpAddr: ipAddr,
    vnp_CreateDate: date,
  };

  // Thêm mã ngân hàng nếu có
  if (bankCode) {
    params.vnp_BankCode = bankCode;
  }

  // Tạo chữ ký
  const secureHash = createSecureHash(
    params as Record<string, string>,
    vnp_HashSecret
  );

  // Tạo URL cuối cùng
  const finalParams = { ...params, vnp_SecureHash: secureHash };
  return `${vnp_Url}?${qs.stringify(finalParams, { encode: false })}`;
}

/**
 * Xác thực chữ ký trả về từ VNPay
 */
export function verifyReturnHash(params: Record<string, string>): boolean {
  const { vnp_HashSecret } = VNPAY_CONFIG;
  const secureHash = params.vnp_SecureHash;

  if (!secureHash) return false;

  const calculatedHash = createSecureHash(params, vnp_HashSecret);
  return calculatedHash === secureHash;
}

/**
 * Lấy địa chỉ IP thực của client
 */
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  if (realIP) {
    return realIP;
  }

  return "127.0.0.1";
}

/**
 * Kiểm tra trạng thái giao dịch
 */
export function getTransactionStatus(responseCode: string): {
  success: boolean;
  message: string;
} {
  const statusMap: Record<string, { success: boolean; message: string }> = {
    "00": { success: true, message: "Giao dịch thành công" },
    "07": {
      success: false,
      message:
        "Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).",
    },
    "09": {
      success: false,
      message:
        "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.",
    },
    "10": {
      success: false,
      message:
        "Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần",
    },
    "11": {
      success: false,
      message:
        "Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.",
    },
    "12": {
      success: false,
      message:
        "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa.",
    },
    "13": {
      success: false,
      message:
        "Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP). Xin quý khách vui lòng thực hiện lại giao dịch.",
    },
    "24": {
      success: false,
      message: "Giao dịch không thành công do: Khách hàng hủy giao dịch",
    },
    "51": {
      success: false,
      message:
        "Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.",
    },
    "65": {
      success: false,
      message:
        "Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.",
    },
    "75": { success: false, message: "Ngân hàng thanh toán đang bảo trì." },
    "79": {
      success: false,
      message:
        "Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định. Xin quý khách vui lòng thực hiện lại giao dịch",
    },
    "99": {
      success: false,
      message:
        "Các lỗi khác (lỗi còn lại, không có trong danh sách mã lỗi đã liệt kê)",
    },
  };

  return (
    statusMap[responseCode] || {
      success: false,
      message: "Mã lỗi không xác định",
    }
  );
}

/**
 * Định dạng số tiền VND
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}
