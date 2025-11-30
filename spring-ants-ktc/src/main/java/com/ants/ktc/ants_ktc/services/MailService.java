package com.ants.ktc.ants_ktc.services;

import java.util.List;

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
      // Tạo chuỗi hiển thị khoảng cách
      String distanceInfo = "";
      if (room.getDistanceKm() != null) {
        distanceInfo = String.format(
            "<span style='background: #e8f5e8; color: #2e7d2e; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;'>🚗 %.1f km</span>",
            room.getDistanceKm());
      }

      roomsHtml.append(String.format(
          """
              <div style='border: 1px solid #ddd; border-radius: 8px; padding: 16px; margin: 16px 0; background: #fff;'>
                <h3 style='color: #1976d2; margin: 0 0 8px 0;'>🏠 %s</h3>
                <div style='display: flex; flex-wrap: wrap; gap: 12px; margin: 8px 0;'>
                  <span style='background: #e3f2fd; color: #1976d2; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;'>💰 %s VNĐ/tháng</span>
                  <span style='background: #f3e5f5; color: #7b1fa2; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;'>📐 %.1f m²</span>
                  %s
                </div>
                <p style='margin: 8px 0; color: #666; font-size: 14px;'><strong>📍 Địa chỉ:</strong> %s</p>
                <p style='margin: 8px 0; color: #777; font-size: 13px; line-height: 1.4;'>%s</p>
                <div style='margin-top: 12px; padding-top: 8px; border-top: 1px solid #eee;'>
                  <p style='margin: 4px 0; color: #555; font-size: 12px;'><strong>👤 Liên hệ:</strong> %s</p>
                  <p style='margin: 4px 0; color: #555; font-size: 12px;'><strong>📞 Điện thoại:</strong> %s</p>
                  <a href='http://localhost:3000/detail/%s' style='display:inline-block;margin-top:8px;padding:6px 16px;background:#1976d2;color:#fff;border-radius:4px;text-decoration:none;font-size:13px;font-weight:bold;'>Xem chi tiết</a>
                </div>
              </div>
              """,
          room.getTitle(),
          String.format("%,.0f", room.getPriceMonth()),
          room.getArea(),
          distanceInfo, // Thêm thông tin khoảng cách
          room.getAddress(),
          room.getDescription() != null
              ? (room.getDescription().length() > 100 ? room.getDescription().substring(0, 100) + "..."
                  : room.getDescription())
              : "Không có mô tả",
          room.getLandlordName(),
          room.getLandlordPhone() != null ? room.getLandlordPhone() : room.getLandlordEmail(),
          room.getId() // Thêm id vào link chi tiết
      ));
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

  @Async
  public void sendBookingStatusNotification(String to, String userName, String roomTitle, String bookingId,
      String oldStatus, String newStatus) {
    String subject = "🔔 Cập nhật trạng thái đặt phòng: " + roomTitle;

    String html = String.format(
        """
            <div style='font-family: Arial, sans-serif; background: #f6f6f6; padding: 24px;'>
              <div style='max-width: 500px; margin: auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px #eee; padding: 24px;'>
                <h2 style='color: #1976d2; text-align: center; margin-bottom: 24px;'>🔔 Cập nhật trạng thái đặt phòng</h2>
                <p style='font-size: 16px; color: #333; margin-bottom: 16px;'>Xin chào <strong>%s</strong>,</p>
                <div style='background: #f8f9fa; padding: 16px; border-radius: 8px; margin: 16px 0;'>
                  <p style='margin: 8px 0; font-size: 16px;'><strong>🏠 Phòng:</strong> %s</p>
                  <p style='margin: 8px 0; font-size: 16px;'><strong>🆔 Mã đặt phòng:</strong> %s</p>
                  <p style='margin: 8px 0; font-size: 16px;'><strong>📋 Trạng thái:</strong>
                    <span style='color: #666;'>%s</span> ➜
                    <span style='color: #1976d2; font-weight: bold;'>%s</span>
                  </p>
                </div>
                <div style='background: #e3f2fd; padding: 12px; border-radius: 6px; margin: 16px 0;'>
                  <p style='margin: 4px 0; font-size: 14px; color: #1565c0;'>
                    📱 Vui lòng đăng nhập vào tài khoản để xem chi tiết và thực hiện các bước tiếp theo.
                  </p>
                </div>
                <hr style='margin: 24px 0;'>
                <p style='font-size: 14px; color: #888; text-align: center;'>
                  Email này được gửi tự động từ hệ thống quản lý phòng trọ.<br>
                  Nếu có thắc mắc, vui lòng liên hệ với chúng tôi.
                </p>
              </div>
            </div>
            """,
        userName, roomTitle, bookingId, oldStatus, newStatus);

    try {
      MimeMessage mimeMessage = emailSender.createMimeMessage();
      MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
      helper.setTo(to);
      helper.setSubject(subject);
      helper.setText(html, true);
      emailSender.send(mimeMessage);
      System.out.println("[MailService] Booking status notification sent to: " + to);
    } catch (Exception e) {
      System.out.println("[MailService] Failed to send booking status notification: " + e.getMessage());
      e.printStackTrace();
      // fallback: send simple text
      SimpleMailMessage message = new SimpleMailMessage();
      message.setTo(to);
      message.setSubject(subject);
      message.setText("Trạng thái đặt phòng '" + roomTitle + "' đã thay đổi: " + oldStatus + " → " + newStatus);
      emailSender.send(message);
    }
  }

  @Async
  public void sendRoomRejectionNotification(String to, String landlordName, String roomTitle, String rejectionReason) {
    String subject = "❌ Phòng trọ không được duyệt: " + roomTitle;

    String html = String.format(
        """
            <div style='font-family: Arial, sans-serif; background: #f6f6f6; padding: 24px;'>
              <div style='max-width: 550px; margin: auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px #eee; padding: 24px;'>
                <h2 style='color: #d32f2f; text-align: center; margin-bottom: 24px;'>❌ Thông báo từ chối duyệt phòng</h2>
                <p style='font-size: 16px; color: #333; margin-bottom: 16px;'>Xin chào <strong>%s</strong>,</p>
                <p style='font-size: 16px; color: #333; margin-bottom: 20px;'>
                  Chúng tôi rất tiếc phải thông báo rằng phòng trọ của bạn không được phê duyệt để đăng tải.
                </p>

                <div style='background: #ffebee; border: 1px solid #ffcdd2; padding: 16px; border-radius: 8px; margin: 16px 0;'>
                  <h3 style='color: #d32f2f; margin: 0 0 12px 0; font-size: 18px;'>🏠 Thông tin phòng:</h3>
                  <p style='margin: 8px 0; font-size: 16px; color: #333;'><strong>Tên phòng:</strong> %s</p>
                </div>

                <div style='background: #fff3e0; border: 1px solid #ffcc02; padding: 16px; border-radius: 8px; margin: 16px 0;'>
                  <h3 style='color: #f57c00; margin: 0 0 12px 0; font-size: 18px;'>⚠️ Lý do từ chối:</h3>
                  <p style='margin: 8px 0; font-size: 15px; color: #333; line-height: 1.5; background: #fff; padding: 12px; border-radius: 6px; border-left: 4px solid #ff9800;'>%s</p>
                </div>

                <div style='background: #e8f5e8; border: 1px solid #c8e6c9; padding: 16px; border-radius: 8px; margin: 20px 0;'>
                  <h3 style='color: #2e7d2e; margin: 0 0 12px 0; font-size: 18px;'>💡 Hướng dẫn tiếp theo:</h3>
                  <ul style='margin: 8px 0; padding-left: 20px; color: #333; line-height: 1.6;'>
                    <li>Vui lòng chỉnh sửa thông tin phòng theo lý do từ chối</li>
                    <li>Cập nhật hình ảnh, mô tả cho phù hợp</li>
                    <li>Gửi lại yêu cầu duyệt phòng</li>
                    <li>Liên hệ hỗ trợ nếu cần thêm thông tin</li>
                  </ul>
                </div>

                <div style='text-align: center; margin: 24px 0;'>
                  <a href='http://localhost:3000/landlord/rooms'
                     style='display: inline-block; padding: 12px 24px; background: #1976d2; color: #fff;
                            text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;'>
                    📝 Chỉnh sửa phòng trọ
                  </a>
                </div>

                <hr style='margin: 24px 0; border: none; border-top: 1px solid #eee;'>
                <p style='font-size: 14px; color: #888; text-align: center; margin: 0;'>
                  Email này được gửi tự động từ hệ thống quản lý phòng trọ.<br>
                  Nếu có thắc mắc, vui lòng liên hệ bộ phận hỗ trợ.
                </p>
              </div>
            </div>
            """,
        landlordName, roomTitle, rejectionReason);

    try {
      MimeMessage mimeMessage = emailSender.createMimeMessage();
      MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
      helper.setTo(to);
      helper.setSubject(subject);
      helper.setText(html, true);
      emailSender.send(mimeMessage);
      System.out.println("[MailService] Room rejection notification sent to: " + to + " for room: " + roomTitle);
    } catch (Exception e) {
      System.out.println("[MailService] Failed to send room rejection notification: " + e.getMessage());
      e.printStackTrace();
      // fallback: send simple text
      SimpleMailMessage message = new SimpleMailMessage();
      message.setTo(to);
      message.setSubject(subject);
      message.setText("Phòng trọ '" + roomTitle + "' không được duyệt. Lý do: " + rejectionReason +
          ". Vui lòng chỉnh sửa và gửi lại yêu cầu duyệt.");
      emailSender.send(message);
    }
  }

  // ML
  @Async
  public void sendMLRoomSuggestionEmail(String to, String userName, List<RoomSuggestionInfoDto> suggestedRooms) {
    System.out.println("[MailService] 🤖 STARTING ML Room Suggestion Email for: " + to);

    if (suggestedRooms == null || suggestedRooms.isEmpty()) {
      System.out.println("[MailService] ❌ No ML suggested rooms provided, returning early");
      return;
    }

    System.out.println("[MailService] 🧠 Building ML email HTML for " + suggestedRooms.size() + " AI-selected rooms");

    StringBuilder roomsHtml = new StringBuilder();
    int roomIndex = 1;

    for (RoomSuggestionInfoDto room : suggestedRooms) {
      // Tạo chuỗi hiển thị khoảng cách với ML badge
      String distanceInfo = "";
      if (room.getDistanceKm() != null) {
        distanceInfo = String.format(
            "<span style='background: #e8f5e8; color: #2e7d2e; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;'>🚗 %.1f km</span>",
            room.getDistanceKm());
      }

      // ML Badge để nhận biết email từ AI
      String mlBadge = String.format(
          "<span style='background: linear-gradient(45deg, #667eea 0%%, #764ba2 100%%); color: white; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: bold;'>🤖 AI #%d</span>",
          roomIndex);

      roomsHtml.append(String.format(
          """
              <div style='border: 1px solid #ddd; border-radius: 12px; padding: 20px; margin: 20px 0; background: linear-gradient(135deg, #f5f7fa 0%%, #c3cfe2 100%%); box-shadow: 0 4px 15px rgba(0,0,0,0.1);'>
                <div style='display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;'>
                  <h3 style='color: #1976d2; margin: 0; font-size: 18px;'>🏠 %s</h3>
                  %s
                </div>
                <div style='display: flex; flex-wrap: wrap; gap: 12px; margin: 12px 0;'>
                  <span style='background: #e3f2fd; color: #1976d2; padding: 6px 12px; border-radius: 6px; font-size: 13px; font-weight: bold;'>💰 %s VNĐ/tháng</span>
                  <span style='background: #f3e5f5; color: #7b1fa2; padding: 6px 12px; border-radius: 6px; font-size: 13px; font-weight: bold;'>📐 %.1f m²</span>
                  %s
                </div>
                <p style='margin: 12px 0; color: #666; font-size: 14px; line-height: 1.5;'><strong>📍 Địa chỉ:</strong> %s</p>
                <p style='margin: 12px 0; color: #777; font-size: 13px; line-height: 1.6; background: #fff; padding: 12px; border-radius: 8px; border-left: 4px solid #1976d2;'>%s</p>
                <div style='margin-top: 16px; padding-top: 12px; border-top: 1px solid #ddd; background: rgba(255,255,255,0.7); border-radius: 8px; padding: 12px;'>
                  <p style='margin: 6px 0; color: #555; font-size: 12px;'><strong>👤 Liên hệ:</strong> %s</p>
                  <p style='margin: 6px 0; color: #555; font-size: 12px;'><strong>📞 Điện thoại:</strong> %s</p>
                  <div style='text-align: center; margin-top: 12px;'>
                    <a href='http://localhost:3000/detail/%s' style='display:inline-block;padding:10px 20px;background:linear-gradient(45deg, #1976d2, #42a5f5);color:#fff;border-radius:8px;text-decoration:none;font-size:14px;font-weight:bold;box-shadow: 0 2px 8px rgba(25,118,210,0.3);'>🔍 Xem chi tiết</a>
                  </div>
                </div>
              </div>
              """,
          room.getTitle(),
          mlBadge,
          String.format("%,.0f", room.getPriceMonth()),
          room.getArea(),
          distanceInfo,
          room.getAddress(),
          room.getDescription() != null
              ? (room.getDescription().length() > 120 ? room.getDescription().substring(0, 120) + "..."
                  : room.getDescription())
              : "Không có mô tả",
          room.getLandlordName(),
          room.getLandlordPhone() != null ? room.getLandlordPhone() : room.getLandlordEmail(),
          room.getId()));

      roomIndex++;
    }

    String html = String.format(
        """
            <div style='font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif; background: #f6f8fa; padding: 32px;'>
              <div style='max-width: 650px; margin: auto; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.1); overflow: hidden;'>

                <!-- Header -->
                <div style='background: linear-gradient(135deg, #1976d2 0%%, #42a5f5 100%%); padding: 24px; text-align: center;'>
                  <h1 style='color: white; margin: 0; font-size: 24px; font-weight: 600;'>🏠 Gợi Ý Phòng Trọ</h1>
                  <p style='color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px;'>Phòng trọ phù hợp dành riêng cho bạn</p>
                </div>

                <!-- Content -->
                <div style='padding: 32px;'>
                  <p style='font-size: 16px; color: #333; margin-bottom: 12px;'>Xin chào <strong style='color: #1976d2;'>%s</strong>,</p>
                  <p style='font-size: 16px; color: #333; margin-bottom: 28px; line-height: 1.6;'>
                    Chúng tôi đã tìm thấy <strong style='color: #1976d2;'>%d phòng trọ</strong> phù hợp với sở thích và nhu cầu của bạn:
                  </p>

                  %s

                  <!-- Info Section -->
                  <div style='background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 24px 0; border-left: 4px solid #1976d2;'>
                    <h4 style='color: #1976d2; margin: 0 0 12px 0; font-size: 16px;'>📋 Thông tin</h4>
                    <p style='margin: 0; color: #666; font-size: 14px; line-height: 1.5;'>
                      Các phòng trọ này được chọn dựa trên sở thích và lịch sử tìm kiếm của bạn.<br>
                      Danh sách được cập nhật tự động hàng ngày để đảm bảo thông tin mới nhất.
                    </p>
                  </div>

                </div>

                <!-- Footer -->
                <div style='background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef;'>
                  <p style='font-size: 13px; color: #6c757d; margin: 0;'>
                    Email này được gửi tự động từ hệ thống gợi ý phòng trọ.<br>
                    Để thay đổi cài đặt thông báo, vui lòng truy cập tài khoản của bạn.
                  </p>
                </div>

              </div>
            </div>
            """,
        userName, suggestedRooms.size(), roomsHtml.toString());

    try {
      System.out.println("[MailService] 🤖 Creating and sending ML MIME message to: " + to);

      MimeMessage mimeMessage = emailSender.createMimeMessage();
      MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
      helper.setTo(to);
      helper.setSubject("🏠 Gợi Ý Phòng Trọ Phù Hợp Cho Bạn");
      helper.setText(html, true);

      System.out.println("[MailService] 🤖 Sending ML email via emailSender...");

      emailSender.send(mimeMessage);

      System.out.println("[MailService] ✅ ML room suggestion email sent successfully to: " + to);
    } catch (Exception e) {
      System.out.println("[MailService] ❌ Failed to send ML room suggestion email: " + e.getMessage());
      System.out.println("[MailService] ❌ Exception class: " + e.getClass().getSimpleName());
      e.printStackTrace();

      try {
        System.out.println("[MailService] 🔄 Attempting ML fallback simple text email...");

        // fallback: send simple text
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("🏠 Gợi Ý Phòng Trọ Phù Hợp");
        message.setText("Chúng tôi đã tìm thấy " + suggestedRooms.size()
            + " phòng trọ phù hợp với sở thích của bạn. Vui lòng truy cập website để xem chi tiết.");
        emailSender.send(message);

        System.out.println("[MailService] ✅ ML fallback simple email sent successfully to: " + to);
      } catch (Exception fallbackException) {
        System.out.println("[MailService] ❌ Even ML fallback email failed: " + fallbackException.getMessage());
        fallbackException.printStackTrace();
      }
    }

    System.out.println("[MailService] 🏁 FINISHED ML sendRoomSuggestionEmail for: " + to);
  }
}
