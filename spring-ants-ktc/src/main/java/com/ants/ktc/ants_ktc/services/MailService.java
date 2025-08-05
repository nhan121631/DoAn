package com.ants.ktc.ants_ktc.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;

@Service
public class MailService {
    @Autowired
    private JavaMailSender emailSender;

    public void sendResetCode(String to, String code) {
        String html = String.format(
                """
                        <div style='font-family: Arial, sans-serif; background: #f6f6f6; padding: 32px;'>
                          <div style='max-width: 400px; margin: auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px #eee; padding: 24px;'>
                            <h2 style='color: #1976d2; text-align: center;'>Đặt lại mật khẩu</h2>
                            <p style='font-size: 16px; color: #333; text-align: center;'>Bạn vừa yêu cầu đặt lại mật khẩu. Mã xác thực của bạn là:</p>
                            <div style='font-size: 32px; font-weight: bold; color: #1976d2; text-align: center; margin: 16px 0;'>%s</div>
                            <p style='font-size: 14px; color: #888; text-align: center;'>Vui lòng nhập mã này để tiếp tục quá trình đặt lại mật khẩu.</p>
                            <hr style='margin: 24px 0;'>
                            <p style='font-size: 12px; color: #aaa; text-align: center;'>Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>
                          </div>
                        </div>
                        """,
                code);

        try {
            MimeMessage mimeMessage = emailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject("Mã đặt lại mật khẩu");
            helper.setText(html, true);
            emailSender.send(mimeMessage);
        } catch (Exception e) {
            // fallback: gửi text đơn giản nếu lỗi
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject("Mã đặt lại mật khẩu");
            message.setText("Mã của bạn là: " + code);
            emailSender.send(message);
        }
    }

}
