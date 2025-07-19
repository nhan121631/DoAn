
export const VNPAY_CONFIG = {
  vnp_TmnCode: "ZU16S0HR",
  vnp_HashSecret: "EB0PUER403GE4HUIA7TC3EXA8FNR72VN",

  // URL cổng thanh toán VNPay (Sandbox)
  vnp_Url: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",

  // URL API để truy vấn giao dịch
  vnp_Api: "https://sandbox.vnpayment.vn/merchant_webapi/api/transaction",

  // URL mà VNPay sẽ redirect sau khi thanh toán (phải khớp với đăng ký)
  vnp_ReturnUrl: "http://localhost:3000/api/vnpay-return",
};
