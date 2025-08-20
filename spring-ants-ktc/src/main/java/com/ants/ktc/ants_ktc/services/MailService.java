package com.ants.ktc.ants_ktc.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.ants.ktc.ants_ktc.dtos.room.RoomSuggestionInfoDto;

import jakarta.mail.internet.MimeMessage;
import java.util.List;

@Service
public class MailService {
  @Autowired
  private JavaMailSender emailSender;

  @Async
  public void sendResetCode(String to, String code) {
    String html = String.format(
        """
            <div style='font-family: Arial, sans-serif; background: #f6f6f6; padding: 32px;'>
              <div style='max-width: 400px; margin: auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px #eee; padding: 24px;'>
                <h2 style='color: #1976d2; text-align: center;'>Reset Password</h2>
                <p style='font-size: 16px; color: #333; text-align: center;'>You have requested to reset your password. The code is valid for <strong>5 minutes</strong>. Your verification code is:</p>
                <div style='font-size: 32px; font-weight: bold, color: #1976d2; text-align: center; margin: 16px 0;'>%s</div>
                <p style='font-size: 14px; color: #888; text-align: center;'>Please enter this code to continue the password reset process.</p>
                <hr style='margin: 24px 0;'>
                <p style='font-size: 12px; color: #aaa; text-align: center;'>If you did not request this, please ignore this email.</p>
              </div>
            </div>
            """,
        code);

    try {
      MimeMessage mimeMessage = emailSender.createMimeMessage();
      MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
      helper.setTo(to);
      helper.setSubject("Password Reset Code");
      helper.setText(html, true);
      emailSender.send(mimeMessage);
    } catch (Exception e) {
      // fallback: send simple text if error
      SimpleMailMessage message = new SimpleMailMessage();
      message.setTo(to);
      message.setSubject("Password Reset Code");
      message.setText("Your code is: " + code);
      emailSender.send(message);
    }
  }

  @SuppressWarnings("null")
  // @Async
  public void sendMail(String to, String subject, String messageBody, MultipartFile file) {
    try {
      System.out.println("[MailService] sendMail called");
      if (file != null) {
        System.out.println("[MailService] File info:");
        System.out.println("  Name: " + file.getOriginalFilename());
        System.out.println("  Size: " + file.getSize());
        System.out.println("  ContentType: " + file.getContentType());
      } else {
        System.out.println("[MailService] No file received (file == null)");
      }
      MimeMessage mimeMessage = emailSender.createMimeMessage();
      MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
      helper.setTo(to);
      helper.setSubject(subject);
      helper.setText(messageBody, true);
      if (file != null) {
        System.out.println("[MailService] Attaching file: " + file.getOriginalFilename());
        helper.addAttachment(file.getOriginalFilename(), new ByteArrayResource(file.getBytes()));
      } else {
        System.out.println("[MailService] No file to attach (file == null).");
      }
      emailSender.send(mimeMessage);
      System.out.println("[MailService] Email sent (with/without attachment)");
    } catch (Exception e) {
      System.out.println("[MailService] Exception: " + e.getMessage());
      e.printStackTrace();
      SimpleMailMessage message = new SimpleMailMessage();
      message.setTo(to);
      message.setSubject(subject);
      message.setText(messageBody);
      emailSender.send(message);
    }
  }

  @Async
  public void sendRoomSuggestionEmail(String to, String userName, List<RoomSuggestionInfoDto> suggestedRooms) {
    if (suggestedRooms == null || suggestedRooms.isEmpty()) {
      return;
    }

    StringBuilder roomsHtml = new StringBuilder();
    for (RoomSuggestionInfoDto room : suggestedRooms) {
      roomsHtml.append(String.format(
          """
              <div style='border: 1px solid #ddd; border-radius: 8px; padding: 16px; margin: 16px 0; background: #fff;'>
                <h3 style='color: #1976d2; margin: 0 0 8px 0;'>🏠 %s</h3>
                <div style='display: flex; flex-wrap: wrap; gap: 12px; margin: 8px 0;'>
                  <span style='background: #e3f2fd; color: #1976d2; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;'>💰 %s VNĐ/tháng</span>
                  <span style='background: #f3e5f5; color: #7b1fa2; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;'>📐 %.1f m²</span>
                </div>
                <p style='margin: 8px 0; color: #666; font-size: 14px;'><strong>📍 Địa chỉ:</strong> %s</p>
                <p style='margin: 8px 0; color: #777; font-size: 13px; line-height: 1.4;'>%s</p>
                <div style='margin-top: 12px; padding-top: 8px; border-top: 1px solid #eee;'>
                  <p style='margin: 4px 0; color: #555; font-size: 12px;'><strong>👤 Liên hệ:</strong> %s</p>
                  <p style='margin: 4px 0; color: #555; font-size: 12px;'><strong>📞 Điện thoại:</strong> %s</p>
                </div>
              </div>
              """,
          room.getTitle(),
          String.format("%,.0f", room.getPriceMonth()),
          room.getArea(),
          room.getAddress(),
          room.getDescription() != null
              ? (room.getDescription().length() > 100 ? room.getDescription().substring(0, 100) + "..."
                  : room.getDescription())
              : "Không có mô tả",
          room.getLandlordName(),
          room.getLandlordPhone() != null ? room.getLandlordPhone() : room.getLandlordEmail()));
    }

    String html = String.format(
        """
            <div style='font-family: Arial, sans-serif; background: #f6f6f6; padding: 32px;'>
              <div style='max-width: 600px; margin: auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px #eee; padding: 24px;'>
                <h2 style='color: #1976d2; text-align: center; margin-bottom: 24px;'>🏠 Gợi ý phòng trọ phù hợp</h2>
                <p style='font-size: 16px; color: #333;'>Xin chào <strong>%s</strong>,</p>
                <p style='font-size: 16px; color: #333; margin-bottom: 24px;'>
                  Chúng tôi tìm thấy <strong>%d phòng trọ</strong> phù hợp với sở thích của bạn:
                </p>
                %s
                <hr style='margin: 24px 0;'>
                <p style='font-size: 14px; color: #888; text-align: center;'>
                  Email này được gửi tự động dựa trên danh sách yêu thích của bạn.<br>
                  Nếu không muốn nhận email này, vui lòng liên hệ với chúng tôi.
                </p>
              </div>
            </div>
            """,
        userName, suggestedRooms.size(), roomsHtml.toString());

    try {
      MimeMessage mimeMessage = emailSender.createMimeMessage();
      MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
      helper.setTo(to);
      helper.setSubject("🏠 Gợi ý phòng trọ phù hợp cho bạn");
      helper.setText(html, true);
      emailSender.send(mimeMessage);
      System.out.println("[MailService] Room suggestion email sent to: " + to);
    } catch (Exception e) {
      System.out.println("[MailService] Failed to send room suggestion email: " + e.getMessage());
      e.printStackTrace();
      // fallback: send simple text
      SimpleMailMessage message = new SimpleMailMessage();
      message.setTo(to);
      message.setSubject("Gợi ý phòng trọ phù hợp");
      message.setText("Chúng tôi tìm thấy " + suggestedRooms.size()
          + " phòng trọ phù hợp với bạn. Vui lòng truy cập website để xem chi tiết.");
      emailSender.send(message);
    }
  }

}
