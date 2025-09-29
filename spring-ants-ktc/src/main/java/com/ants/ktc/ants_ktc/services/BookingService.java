package com.ants.ktc.ants_ktc.services;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.ants.ktc.ants_ktc.dtos.LandlordTask.LandlordTaskCreateDto;
import com.ants.ktc.ants_ktc.dtos.address.AddressResponseDto;
import com.ants.ktc.ants_ktc.dtos.address.DistrictResponseDto;
import com.ants.ktc.ants_ktc.dtos.address.ProvinceResponseDto;
import com.ants.ktc.ants_ktc.dtos.address.WardResponseDto;
import com.ants.ktc.ants_ktc.dtos.booking.BookingRoomByLandlordResponseDto;
import com.ants.ktc.ants_ktc.dtos.booking.BookingRoomByUserResponseDto;
import com.ants.ktc.ants_ktc.dtos.booking.BookingRoomRequestDto;
import com.ants.ktc.ants_ktc.dtos.booking.BookingStatusResponseDto;
import com.ants.ktc.ants_ktc.dtos.booking.LandlordPaymentInfoDto;
import com.ants.ktc.ants_ktc.dtos.booking.PaginationLandlordResponseDto;
import com.ants.ktc.ants_ktc.dtos.booking.PaginationUserBookingRoomResponseDto;
import com.ants.ktc.ants_ktc.dtos.contract.ContractRequestDto;
import com.ants.ktc.ants_ktc.dtos.room.RoomBookingByLandlordResponseDto;
import com.ants.ktc.ants_ktc.dtos.room.RoomBookingByUserResponseDto;
import com.ants.ktc.ants_ktc.dtos.user.UserBookingResponseDto;
import com.ants.ktc.ants_ktc.entities.Booking;
import com.ants.ktc.ants_ktc.entities.Room;
import com.ants.ktc.ants_ktc.entities.User;
import com.ants.ktc.ants_ktc.entities.UserProfile;
import com.ants.ktc.ants_ktc.repositories.BookingJpaRepository;
import com.ants.ktc.ants_ktc.repositories.LandlordTaskJpaRepository;
import com.ants.ktc.ants_ktc.repositories.RoomJpaRepository;
import com.ants.ktc.ants_ktc.repositories.UserJpaRepository;
import com.ants.ktc.ants_ktc.repositories.projection.BookingLandlordProjection;
import com.ants.ktc.ants_ktc.repositories.projection.BookingUserProjection;

@Service
public class BookingService {

        @Autowired
        private BookingJpaRepository bookingJpaRepository;

        @Autowired
        private RoomJpaRepository roomJpaRepository;

        @Autowired
        private UserJpaRepository userJpaRepository;

        @Autowired
        private MailService mailService;

        @Autowired
        private ContractService contractService;

        @Autowired
        private LandlordTaskService landlordTaskService;

        @Autowired
        private LandlordTaskJpaRepository landlordTaskRepository;

        @Autowired
        private CloudinaryService cloudinaryService;

        @Transactional
        public BookingRoomByUserResponseDto createBooking(UUID userId, BookingRoomRequestDto request) {
                User user = userJpaRepository.findById(userId)
                                .orElseThrow(() -> new IllegalArgumentException("User not found"));
                Room room = roomJpaRepository.findById(request.getRoomId())
                                .orElseThrow(() -> new IllegalArgumentException("Room not found"));

                if (room.getAvailable() == 1) {
                        throw new IllegalArgumentException("Room is not available for booking");
                }

                if (room.getMaxPeople() != null && request.getTenantCount() > room.getMaxPeople()) {
                        throw new IllegalArgumentException("Tenant count exceeds room's maximum capacity");
                }

                // Kiểm tra user đã đặt phòng này chưa
                boolean exists = bookingJpaRepository.existsByUserIdAndRoomIdAndIsRemoved(userId, room.getId(), 0);
                if (exists) {
                        throw new IllegalArgumentException("User has already booked this room");
                }

                // kiểm tra ngày thuê không nhỏ hơn ngày hiện tại (cho phép đặt từ hôm nay)
                Date currentDate = new Date();
                long currentTimeMillis = currentDate.getTime();
                long rentalTimeMillis = request.getRentalDate().getTime();

                // Cho phép đặt nếu ngày thuê cách ngày hiện tại không quá 24 giờ về trước
                long diffInHours = (currentTimeMillis - rentalTimeMillis) / (1000 * 60 * 60);
                if (diffInHours > 24) {
                        throw new IllegalArgumentException("Rental date cannot be more than 1 day in the past");
                }

                // Tạo booking mới
                Booking booking = new Booking();
                booking.setUser(user);
                booking.setRoom(room);
                booking.setRentalDate(request.getRentalDate());
                booking.setRentalExpires(request.getRentalExpires());
                booking.setTenantCount(request.getTenantCount());
                booking.setStatus(0);

                // room.setAvailable(1);
                // roomJpaRepository.save(room);

                Booking savedBooking = bookingJpaRepository.save(booking);
                LandlordTaskCreateDto dto = LandlordTaskCreateDto.builder()
                                .title("Booking room for " + room.getTitle())
                                .description("New booking request for room: " + room.getTitle() + " by user: "
                                                + user.getProfile().getFullName())
                                .startDate(LocalDateTime.now())
                                .dueDate(LocalDateTime.now().plusDays(7)) // Set due date 7 days later
                                .status("PENDING")
                                .type("BOOKING")
                                .relatedEntityId(savedBooking.getId())
                                .priority("HIGH")
                                .landlordId(room.getUser().getId().toString())
                                .roomId(room.getId().toString())
                                .build();
                landlordTaskService.createTask(dto);
                return convertToResponseDto(savedBooking);
        }

        public List<BookingRoomByUserResponseDto> getUserBookings(UUID userId) {
                List<Booking> bookings = bookingJpaRepository.findByUserIdWithDetails(userId);
                return bookings.stream()
                                .map(this::convertToResponseDto)
                                .collect(Collectors.toList());
        }

        public PaginationUserBookingRoomResponseDto getPaginatedUserBookings(UUID userId, int page, int size) {
                Pageable pageable = PageRequest.of(page, size);
                Page<BookingUserProjection> bookingPage = bookingJpaRepository.findByUserIdProjection(userId, pageable);
                List<BookingRoomByUserResponseDto> bookingDtos = bookingPage.getContent().stream()
                                .map(this::convertFromProjectionToResponseDto)
                                .collect(Collectors.toList());

                return PaginationUserBookingRoomResponseDto.builder()
                                .bookings(bookingDtos)
                                .pageNumber(page)
                                .pageSize(size)
                                .totalRecords(bookingPage.getTotalElements())
                                .totalPages(bookingPage.getTotalPages())
                                .hasNext(bookingPage.hasNext())
                                .hasPrevious(bookingPage.hasPrevious())
                                .build();
        }

        // lấy tất cả booking của landlord
        public PaginationLandlordResponseDto getPaginatedLandlordBookings(UUID landlordId, int page, int size) {
                Pageable pageable = PageRequest.of(page, size);
                Page<BookingLandlordProjection> bookingPage = bookingJpaRepository
                                .findByLandlordIdProjection(landlordId, pageable);
                List<BookingRoomByLandlordResponseDto> bookingDtos = bookingPage.getContent().stream()
                                .map(this::convertFromProjectionToLandlordResponseDto)
                                .collect(Collectors.toList());

                return PaginationLandlordResponseDto.builder()
                                .bookings(bookingDtos)
                                .pageNumber(page)
                                .pageSize(size)
                                .totalRecords(bookingPage.getTotalElements())
                                .totalPages(bookingPage.getTotalPages())
                                .hasNext(bookingPage.hasNext())
                                .hasPrevious(bookingPage.hasPrevious())
                                .build();
        }

        public LandlordPaymentInfoDto getLandlordPaymentInfo(UUID bookingId) {
                Booking booking = bookingJpaRepository.findById(bookingId)
                                .orElseThrow(() -> new RuntimeException("Booking not found"));

                User landlord = booking.getRoom().getUser();
                UserProfile profile = landlord.getProfile();
                Room room = booking.getRoom();

                if (profile == null) {
                        throw new RuntimeException("Landlord profile not found");
                }

                return LandlordPaymentInfoDto.builder()
                                .landlordId(landlord.getId())
                                .landlordName(profile.getFullName())
                                .accountHolderName(profile.getAccoutHolderName())
                                .bankNumber(profile.getBankNumber())
                                .bankName(profile.getBankName())
                                .binCode(profile.getBinCode())
                                .depositAmount(room.getPrice_deposit())
                                .phoneNumber(profile.getPhoneNumber())
                                .email(profile.getEmail())
                                .build();
        }

        @Transactional
        public BookingStatusResponseDto updateBookingStatus(UUID bookingId, int newStatus, UUID actorId,
                        String actorRole) {
                Booking booking = bookingJpaRepository.findByIdForStatusUpdate(bookingId);
                if (booking == null) {
                        throw new RuntimeException("Booking not found");
                }
                int currentStatus = booking.getStatus();
                String message = "";

                Date currentDate = new Date();
                if (booking.getRentalExpires() != null && currentDate.after(booking.getRentalExpires())) {
                        Room room = booking.getRoom();
                        if (room.getAvailable() == 1) {
                                room.setAvailable(0);
                                roomJpaRepository.save(room);
                        }
                }
                // Landlord
                if ("landlords".equalsIgnoreCase(actorRole)) {
                        if (!booking.getRoom().getUser().getId().equals(actorId)) {
                                throw new IllegalArgumentException("You can only update bookings for your own rooms");
                        }

                        // Landlord từ 0 -> 1 (accept) hoặc 0 -> 2 (reject)
                        if (currentStatus == 0 && newStatus == 1) {
                                booking.setStatus(newStatus);

                                Room room = booking.getRoom();
                                // Previously set available = 0 here; change to 1 when landlord accepts
                                // room.setAvailable(0);
                                room.setAvailable(1);
                                roomJpaRepository.save(room);

                                // Reject other pending bookings (status = 0) for this room
                                try {
                                        int updated = bookingJpaRepository
                                                        .updateStatusByRoomIdAndOldStatusExcludeBookingId(
                                                                        room.getId(), 0, 2, booking.getId());

                                        System.out.println("Updated and rejected " + updated
                                                        + " other pending bookings for room " + room.getId());
                                } catch (Exception e) {
                                        // Log and continue - we don't want to stop the accept flow if this fails
                                        System.err.println("Failed to reject other pending bookings for room "
                                                        + room.getId() + ": " + e.getMessage());
                                }

                                message = "Booking accepted successfully";
                        } else if (currentStatus == 0 && newStatus == 2) {
                                booking.setStatus(newStatus);
                                landlordTaskRepository.updateTaskStatus(booking.getId(), "COMPLETED");

                                // Room room = booking.getRoom();
                                // room.setAvailable(0);
                                // roomJpaRepository.save(room);
                                message = "Booking rejected successfully";
                        }
                        // Landlord từ 3 -> 4 (confirm deposit)
                        else if (currentStatus == 3 && newStatus == 4) {
                                booking.setStatus(newStatus);
                                landlordTaskRepository.updateTaskStatus(booking.getId(), "COMPLETED");
                                // Set phòng là không available khi đã confirm deposit
                                // Room room = booking.getRoom();
                                // room.setAvailable(1);
                                // roomJpaRepository.save(room);

                                ContractRequestDto contractRequest = ContractRequestDto.builder()
                                                .roomId(booking.getRoom().getId())
                                                .tenantId(booking.getUser().getId())
                                                .landlordId(booking.getRoom().getUser().getId())
                                                .startDate(booking.getRentalDate())
                                                .endDate(booking.getRentalExpires())
                                                .depositAmount(booking.getRoom().getPrice_deposit())
                                                .monthlyRent(booking.getRoom().getPrice_month())
                                                .status(0) // active
                                                .build();

                                contractService.createContract(contractRequest);

                                message = "Deposit confirmed successfully. Room is now rented";
                        } else {
                                throw new IllegalArgumentException(
                                                "Permission denied: Landlord can only set status from 0 to 1/2 or from 3 to 4");
                        }
                }
                // User
                else if ("users".equalsIgnoreCase(actorRole)) {
                        if (!booking.getUser().getId().equals(actorId)) {
                                throw new IllegalArgumentException("You can only update your own bookings");
                        }

                        // User từ 1 -> 3 (confirm deposit)
                        if (currentStatus == 1 && newStatus == 3) {
                                booking.setStatus(newStatus);
                                message = "Deposit confirmed. Waiting for landlord confirmation";
                        } else {
                                throw new IllegalArgumentException(
                                                "Permission denied: User can only set status from 1 to 3 (confirm deposit)");
                        }
                } else {
                        throw new IllegalArgumentException("Invalid actor role");
                }

                bookingJpaRepository.save(booking);

                // Gửi email thông báo cho bên còn lại (không gửi cho người thực hiện action)
                try {
                        notifyUsersAboutStatusChange(booking, currentStatus, newStatus, actorRole);
                } catch (Exception e) {
                        System.err.println("Failed to send notification emails: " + e.getMessage());
                }

                return BookingStatusResponseDto.builder()
                                .bookingId(bookingId)
                                .oldStatus(currentStatus)
                                .newStatus(newStatus)
                                .message(message)
                                .success(true)
                                .build();
        }

        // upload anh bill chuyen khoan
        @Transactional
        public String uploadBillTransferImage(UUID bookingId, MultipartFile file) {
                try {
                        // Verify booking exists
                        Booking booking = bookingJpaRepository.findById(bookingId)
                                        .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

                        // Upload image to Cloudinary
                        Map<String, String> uploadResult = cloudinaryService.uploadFile(file);
                        String imageUrl = uploadResult.get("url");

                        // Update booking with bill transfer image URL (using imageProof field)
                        booking.setImageProof(imageUrl);
                        bookingJpaRepository.save(booking);

                        return imageUrl;
                } catch (Exception e) {
                        throw new RuntimeException("Failed to upload bill transfer image: " + e.getMessage());
                }
        }

        // xoa booking set isRemoved = 1
        @Transactional
        public void deleteBooking(UUID bookingId, UUID userId) {
                // Try a simple findById first to avoid missing results due to inner JOIN FETCH
                // in custom query
                Booking booking = bookingJpaRepository.findById(bookingId).orElse(null);
                if (booking == null) {
                        // Fallback to the fetch-with-joins query used elsewhere; it may return null if
                        // related
                        // associations are missing due to inner joins.
                        booking = bookingJpaRepository.findByIdForStatusUpdate(bookingId);
                }
                if (booking == null) {
                        System.err.println("[BookingService.deleteBooking] Booking not found for id: " + bookingId);
                        throw new RuntimeException("Booking not found: " + bookingId);
                }
                // Only select needed fields for fast check
                java.util.List<Object[]> resultList = bookingJpaRepository.findBookingUserAndLandlordIds(bookingId);
                // Debug: print raw result list and related ids to help track missing ownership
                // info
                try {
                        System.out.println(
                                        "[BookingService.deleteBooking] findBookingUserAndLandlordIds raw result list size: "
                                                        + (resultList == null ? "null" : resultList.size()));
                        if (resultList != null && !resultList.isEmpty()) {
                                System.out.println("[BookingService.deleteBooking] first row: "
                                                + java.util.Arrays.toString(resultList.get(0)));
                        }
                        System.out.println("[BookingService.deleteBooking] booking.user id: "
                                        + (booking.getUser() != null ? booking.getUser().getId() : null));
                        System.out.println("[BookingService.deleteBooking] booking.room id: "
                                        + (booking.getRoom() != null ? booking.getRoom().getId() : null));
                        System.out.println("[BookingService.deleteBooking] booking.room.user id: "
                                        + (booking.getRoom() != null && booking.getRoom().getUser() != null
                                                        ? booking.getRoom().getUser().getId()
                                                        : null));
                } catch (Exception e) {
                        System.err.println("[BookingService.deleteBooking] Failed to log ownership debug info: "
                                        + e.getMessage());
                }

                if (resultList == null || resultList.isEmpty() || resultList.get(0) == null) {
                        System.err.println(
                                        "[BookingService.deleteBooking] Missing ownership info (no rows) for booking id: "
                                                        + bookingId);
                        throw new IllegalArgumentException("Booking not found or missing ownership info: " + bookingId);
                }

                Object[] firstRow = resultList.get(0);
                if (firstRow.length < 2) {
                        System.err.println(
                                        "[BookingService.deleteBooking] Unexpected ownership row structure for booking id: "
                                                        + bookingId);
                        throw new IllegalArgumentException("Booking not found or missing ownership info: " + bookingId);
                }

                UUID bookingUserId = firstRow[0] != null ? (UUID) firstRow[0] : null;
                UUID landlordId = firstRow[1] != null ? (UUID) firstRow[1] : null;

                // If both ids are missing, we cannot verify ownership
                if (bookingUserId == null && landlordId == null) {
                        System.err.println(
                                        "[BookingService.deleteBooking] Both bookingUserId and landlordId are null for booking id: "
                                                        + bookingId);
                        throw new IllegalArgumentException("Booking not found or missing ownership info: " + bookingId);
                }

                // Allow deletion if requester is booking owner or landlord of the room
                if ((bookingUserId == null || !userId.equals(bookingUserId))
                                && (landlordId == null || !userId.equals(landlordId))) {
                        throw new IllegalArgumentException(
                                        "You can only delete your own bookings or bookings for your own rooms");
                }
                Room room = booking.getRoom();
                if (room != null) {
                        room.setAvailable(0);
                        roomJpaRepository.save(room);
                } else {
                        System.err.println(
                                        "[BookingService.deleteBooking] Warning: booking.room is null for booking id: "
                                                        + bookingId);
                }

                // Update only isRemoved field for performance
                bookingJpaRepository.updateIsRemovedById(bookingId, 1);
        }

        // ======================== Email Notification Helper
        // Methods========================//

        private void notifyUsersAboutStatusChange(Booking booking, int oldStatus, int newStatus, String actorRole) {
                if (booking == null)
                        return;

                String roomTitle = booking.getRoom() != null ? booking.getRoom().getTitle() : "(phòng)";
                String bookingId = booking.getId() != null ? booking.getId().toString() : "";

                String statusTextOld = statusText(oldStatus);
                String statusTextNew = statusText(newStatus);

                if ("landlords".equalsIgnoreCase(actorRole)) {
                        // Landlord thực hiện action -> gửi email cho Tenant
                        String tenantEmail = getUserEmail(booking.getUser());
                        if (tenantEmail != null && !tenantEmail.isBlank()) {
                                String tenantName = getUserName(booking.getUser());
                                try {
                                        mailService.sendBookingStatusNotification(tenantEmail, tenantName, roomTitle,
                                                        bookingId, statusTextOld, statusTextNew);
                                        System.out.println("✅ Notification email sent to tenant: " + tenantEmail);
                                } catch (Exception e) {
                                        System.err.println("❌ Failed to send email to tenant " + tenantEmail + ": "
                                                        + e.getMessage());
                                }
                        }
                } else if ("users".equalsIgnoreCase(actorRole)) {
                        // User thực hiện action -> gửi email cho Landlord
                        String landlordEmail = booking.getRoom() != null ? getUserEmail(booking.getRoom().getUser())
                                        : null;
                        if (landlordEmail != null && !landlordEmail.isBlank()) {
                                String landlordName = booking.getRoom() != null
                                                ? getUserName(booking.getRoom().getUser())
                                                : "Chủ nhà";
                                try {
                                        mailService.sendBookingStatusNotification(landlordEmail, landlordName,
                                                        roomTitle,
                                                        bookingId, statusTextOld, statusTextNew);
                                        System.out.println("✅ Notification email sent to landlord: " + landlordEmail);
                                } catch (Exception e) {
                                        System.err.println("❌ Failed to send email to landlord " + landlordEmail + ": "
                                                        + e.getMessage());
                                }
                        }
                }
        }

        private String getUserEmail(User user) {
                if (user == null || user.getProfile() == null)
                        return null;
                String email = user.getProfile().getEmail();
                return (email != null && !email.isBlank()) ? email : null;
        }

        private String getUserName(User user) {
                if (user == null || user.getProfile() == null)
                        return "Người dùng";
                String fullName = user.getProfile().getFullName();
                return (fullName != null && !fullName.isBlank()) ? fullName : "Người dùng";
        }

        private String statusText(int status) {
                return switch (status) {
                        case 0 -> "Chờ xử lý";
                        case 1 -> "Đã chấp nhận";
                        case 2 -> "Bị từ chối";
                        case 3 -> "Người thuê đã đặt cọc";
                        case 4 -> "Đang thuê/Đã xác nhận đặt cọc";
                        default -> "Trạng thái khác";
                };
        }

        // ======================== Scheduled Tasks
        // ========================//

        @Scheduled(cron = "0 0 1 * * ?") // Chạy hàng ngày lúc 1:00 AM
        // @Scheduled(cron = "0 10 11 * * ?") // Chạy hàng ngày 11 giờ 10 phút trưa
        @Transactional
        public void dailyRoomAvailabilityCheck() {
                Date currentDate = new Date();

                // Lấy tất cả booking có status = 4 (đang thuê) và chưa bị xóa
                List<Booking> activeBookings = bookingJpaRepository.findActiveBookingsForAvailabilityCheck();

                int updatedRooms = 0;
                for (Booking booking : activeBookings) {
                        Date rentalDate = booking.getRentalDate();
                        Date rentalExpires = booking.getRentalExpires();

                        if (rentalDate != null && rentalExpires != null) {
                                boolean isOutsideRentalPeriod = currentDate.before(rentalDate)
                                                || currentDate.after(rentalExpires);

                                if (isOutsideRentalPeriod) {
                                        Room room = booking.getRoom();
                                        if (room != null && room.getAvailable() == 1) {
                                                room.setAvailable(0);
                                                roomJpaRepository.save(room);
                                                updatedRooms++;
                                        }
                                }
                        }
                }

                System.out.println("⏰ Daily room availability check completed. Updated " + updatedRooms
                                + " rooms to unavailable.");
        }

        // ======================== Projection-based conversion methods
        // ========================//

        // convert BookingUserProjection to BookingRoomByUserResponseDto
        private BookingRoomByUserResponseDto convertFromProjectionToResponseDto(BookingUserProjection projection) {
                return BookingRoomByUserResponseDto.builder()
                                .bookingId(projection.getId())
                                .rentalDate(projection.getRentalDate())
                                .rentalExpires(projection.getRentalExpires())
                                .tenantCount(projection.getTenantCount())
                                .status(projection.getStatus())
                                .isRemoved(projection.getIsRemoved())
                                .imageProof(projection.getImageProof())
                                .room(convertFromRoomProjectionToDto(projection.getRoom()))
                                .build();
        }

        // convert BookingLandlordProjection to BookingRoomByLandlordResponseDto
        private BookingRoomByLandlordResponseDto convertFromProjectionToLandlordResponseDto(
                        BookingLandlordProjection projection) {
                return BookingRoomByLandlordResponseDto.builder()
                                .bookingId(projection.getId())
                                .rentalDate(projection.getRentalDate())
                                .rentalExpires(projection.getRentalExpires())
                                .tenantCount(projection.getTenantCount())
                                .status(projection.getStatus())
                                .isRemoved(projection.getIsRemoved())
                                .imageProof(projection.getImageProof())
                                .room(convertFromRoomLandlordProjectionToDto(projection.getRoom()))
                                .user(convertFromTenantProjectionToDto(projection.getUser()))
                                .build();
        }

        // convert Room projection to RoomBookingByUserResponseDto
        private RoomBookingByUserResponseDto convertFromRoomProjectionToDto(
                        BookingUserProjection.BookingRoomUserProjection roomProjection) {
                return RoomBookingByUserResponseDto.builder()
                                .roomId(roomProjection.getId())
                                .title(roomProjection.getTitle())
                                .priceMonth(roomProjection.getPrice_month())
                                .priceDeposit(roomProjection.getPrice_deposit())
                                .available(roomProjection.getAvailable())
                                .area(roomProjection.getArea())
                                .ownerName(roomProjection.getUser() != null
                                                && roomProjection.getUser().getProfile() != null
                                                                ? roomProjection.getUser().getProfile().getFullName()
                                                                : null)
                                .ownerPhone(roomProjection.getUser() != null
                                                && roomProjection.getUser().getProfile() != null
                                                                ? roomProjection.getUser().getProfile().getPhoneNumber()
                                                                : null)
                                .address(buildAddressDtoFromProjection(roomProjection.getAddress()))
                                .build();
        }

        // convert Room projection to RoomBookingByLandlordResponseDto
        private RoomBookingByLandlordResponseDto convertFromRoomLandlordProjectionToDto(
                        BookingLandlordProjection.BookingRoomLandlordProjection roomProjection) {
                return RoomBookingByLandlordResponseDto.builder()
                                .roomId(roomProjection.getId())
                                .title(roomProjection.getTitle())
                                .priceMonth(roomProjection.getPrice_month())
                                .priceDeposit(roomProjection.getPrice_deposit())
                                .available(roomProjection.getAvailable())
                                .area(roomProjection.getArea())
                                .address(buildAddressDtoFromLandlordProjection(roomProjection.getAddress()))
                                .build();
        }

        // convert User projection to UserBookingResponseDto
        private UserBookingResponseDto convertFromTenantProjectionToDto(
                        BookingLandlordProjection.BookingTenantProjection userProjection) {
                return UserBookingResponseDto.builder()
                                .userId(userProjection.getId())
                                .fullName(userProjection.getProfile() != null
                                                ? userProjection.getProfile().getFullName()
                                                : null)
                                .phoneNumber(userProjection.getProfile() != null
                                                ? userProjection.getProfile().getPhoneNumber()
                                                : null)
                                .build();
        }

        // Helper method to build address DTO from user projection
        private AddressResponseDto buildAddressDtoFromProjection(
                        BookingUserProjection.BookingAddressProjection addressProjection) {
                if (addressProjection == null) {
                        return null;
                }

                return AddressResponseDto.builder()
                                .id(addressProjection.getId())
                                .street(addressProjection.getStreet())
                                .ward(buildWardDtoFromProjection(addressProjection.getWard()))
                                .build();
        }

        // Helper method to build address DTO from landlord projection
        private AddressResponseDto buildAddressDtoFromLandlordProjection(
                        BookingLandlordProjection.BookingAddressProjection addressProjection) {
                if (addressProjection == null) {
                        return null;
                }

                return AddressResponseDto.builder()
                                .id(addressProjection.getId())
                                .street(addressProjection.getStreet())
                                .ward(buildWardDtoFromLandlordProjection(addressProjection.getWard()))
                                .build();
        }

        // Helper method to build ward DTO from user projection
        private WardResponseDto buildWardDtoFromProjection(BookingUserProjection.BookingWardProjection wardProjection) {
                if (wardProjection == null) {
                        return null;
                }

                return WardResponseDto.builder()
                                .id(wardProjection.getId())
                                .name(wardProjection.getName())
                                .district(buildDistrictDtoFromProjection(wardProjection.getDistrict()))
                                .build();
        }

        // Helper method to build ward DTO from landlord projection
        private WardResponseDto buildWardDtoFromLandlordProjection(
                        BookingLandlordProjection.BookingWardProjection wardProjection) {
                if (wardProjection == null) {
                        return null;
                }

                return WardResponseDto.builder()
                                .id(wardProjection.getId())
                                .name(wardProjection.getName())
                                .district(buildDistrictDtoFromLandlordProjection(wardProjection.getDistrict()))
                                .build();
        }

        // Helper method to build district DTO from user projection
        private DistrictResponseDto buildDistrictDtoFromProjection(
                        BookingUserProjection.BookingDistrictProjection districtProjection) {
                if (districtProjection == null) {
                        return null;
                }

                return DistrictResponseDto.builder()
                                .id(districtProjection.getId())
                                .name(districtProjection.getName())
                                .province(buildProvinceDtoFromProjection(districtProjection.getProvince()))
                                .build();
        }

        // Helper method to build district DTO from landlord projection
        private DistrictResponseDto buildDistrictDtoFromLandlordProjection(
                        BookingLandlordProjection.BookingDistrictProjection districtProjection) {
                if (districtProjection == null) {
                        return null;
                }

                return DistrictResponseDto.builder()
                                .id(districtProjection.getId())
                                .name(districtProjection.getName())
                                .province(buildProvinceDtoFromLandlordProjection(districtProjection.getProvince()))
                                .build();
        }

        // Helper method to build province DTO from user projection
        private ProvinceResponseDto buildProvinceDtoFromProjection(
                        BookingUserProjection.BookingProvinceProjection provinceProjection) {
                if (provinceProjection == null) {
                        return null;
                }

                return ProvinceResponseDto.builder()
                                .id(provinceProjection.getId())
                                .name(provinceProjection.getName())
                                .build();
        }

        // Helper method to build province DTO from landlord projection
        private ProvinceResponseDto buildProvinceDtoFromLandlordProjection(
                        BookingLandlordProjection.BookingProvinceProjection provinceProjection) {
                if (provinceProjection == null) {
                        return null;
                }

                return ProvinceResponseDto.builder()
                                .id(provinceProjection.getId())
                                .name(provinceProjection.getName())
                                .build();
        }

        // ======================== Original Entity-based conversion methods (kept for
        // compatibility)
        // ========================//

        // convert Booking entity to BookingRoomResponseDto
        private BookingRoomByUserResponseDto convertToResponseDto(Booking booking) {
                return BookingRoomByUserResponseDto.builder()
                                .bookingId(booking.getId())
                                .rentalDate(booking.getRentalDate())
                                .rentalExpires(booking.getRentalExpires())
                                .tenantCount(booking.getTenantCount())
                                .status(booking.getStatus())
                                .imageProof(booking.getImageProof())
                                .room(convertToRoomDto(booking.getRoom()))
                                // .user(convertToUserDto(booking.getUser()))
                                .build();
        }

        // convert Room entity to RoomBookingByUserResponseDto
        private RoomBookingByUserResponseDto convertToRoomDto(Room room) {
                return RoomBookingByUserResponseDto.builder()
                                .roomId(room.getId())
                                .title(room.getTitle())
                                // .description(room.getDescription())
                                .priceMonth(room.getPrice_month())
                                .priceDeposit(room.getPrice_deposit())
                                .available(room.getAvailable())
                                .area(room.getArea())
                                .ownerName(room.getUser() != null && room.getUser().getProfile() != null
                                                ? room.getUser().getProfile().getFullName()
                                                : null)
                                .ownerPhone(room.getUser() != null && room.getUser().getProfile() != null
                                                ? room.getUser().getProfile().getPhoneNumber()
                                                : null)
                                .address(buildAddressDto(room))
                                .build();
        }

        // Helper method to build address DTO
        private AddressResponseDto buildAddressDto(Room room) {
                if (room.getAddress() == null) {
                        return null;
                }

                return AddressResponseDto.builder()
                                .id(room.getAddress().getId())
                                .street(room.getAddress().getStreet())
                                .ward(buildWardDto(room))
                                .build();
        }

        // Helper method to build ward DTO
        private WardResponseDto buildWardDto(Room room) {
                if (room.getAddress() == null || room.getAddress().getWard() == null) {
                        return null;
                }

                return WardResponseDto.builder()
                                .id(room.getAddress().getWard().getId())
                                .name(room.getAddress().getWard().getName())
                                .district(buildDistrictDto(room))
                                .build();
        }

        // Helper method to build district DTO
        private DistrictResponseDto buildDistrictDto(Room room) {
                if (room.getAddress() == null || room.getAddress().getWard() == null
                                || room.getAddress().getWard().getDistrict() == null) {
                        return null;
                }

                return DistrictResponseDto.builder()
                                .id(room.getAddress().getWard().getDistrict().getId())
                                .name(room.getAddress().getWard().getDistrict().getName())
                                .province(buildProvinceDto(room))
                                .build();
        }

        // Helper method to build province DTO
        private ProvinceResponseDto buildProvinceDto(Room room) {
                if (room.getAddress() == null || room.getAddress().getWard() == null
                                || room.getAddress().getWard().getDistrict() == null
                                || room.getAddress().getWard().getDistrict().getProvince() == null) {
                        return null;
                }

                return ProvinceResponseDto.builder()
                                .id(room.getAddress().getWard().getDistrict().getProvince().getId())
                                .name(room.getAddress().getWard().getDistrict().getProvince().getName())
                                .build();
        }

}
