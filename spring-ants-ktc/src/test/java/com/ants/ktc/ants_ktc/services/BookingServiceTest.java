package com.ants.ktc.ants_ktc.services;

import com.ants.ktc.ants_ktc.dtos.booking.BookingRoomByUserResponseDto;
import com.ants.ktc.ants_ktc.dtos.booking.PaginationUserBookingRoomResponseDto;
import com.ants.ktc.ants_ktc.repositories.BookingJpaRepository;
import com.ants.ktc.ants_ktc.repositories.RoomJpaRepository;
import com.ants.ktc.ants_ktc.repositories.UserJpaRepository;
import com.ants.ktc.ants_ktc.repositories.projection.BookingUserProjection;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class BookingServiceTest {

    @Mock
    private BookingJpaRepository bookingJpaRepository;

    @Mock
    private RoomJpaRepository roomJpaRepository;

    @Mock
    private UserJpaRepository userJpaRepository;

    @Mock
    private MailService mailService;

    @Mock
    private ContractService contractService;

    @Mock
    private LandlordTaskService landlordTaskService;

    @InjectMocks
    private BookingService bookingService;

    @Test
    public void testGetPaginatedUserBookings_Success() {
        // Given
        UUID userId = UUID.randomUUID();
        int page = 0;
        int size = 10;

        // Create mock projection
        BookingUserProjection mockProjection = createMockBookingUserProjection();

        List<BookingUserProjection> projectionList = Arrays.asList(mockProjection);
        Page<BookingUserProjection> mockPage = new PageImpl<>(projectionList, PageRequest.of(page, size), 1);

        when(bookingJpaRepository.findByUserIdProjection(eq(userId), any(Pageable.class)))
                .thenReturn(mockPage);

        // When
        PaginationUserBookingRoomResponseDto result = bookingService.getPaginatedUserBookings(userId, page, size);

        // Then
        assertNotNull(result);
        assertEquals(page, result.getPageNumber());
        assertEquals(size, result.getPageSize());
        assertEquals(1, result.getTotalRecords());
        assertEquals(1, result.getTotalPages());
        assertFalse(result.isHasNext());
        assertFalse(result.isHasPrevious());
        assertEquals(1, result.getBookings().size());

        BookingRoomByUserResponseDto bookingDto = result.getBookings().get(0);
        assertNotNull(bookingDto);
        assertEquals(UUID.fromString("550e8400-e29b-41d4-a716-446655440001"), bookingDto.getBookingId());
        assertEquals(2, bookingDto.getTenantCount());
        assertEquals(1, bookingDto.getStatus());
        assertEquals(0, bookingDto.getIsRemoved());

        verify(bookingJpaRepository).findByUserIdProjection(eq(userId), any(Pageable.class));
    }

    @Test
    public void testGetPaginatedUserBookings_EmptyResult() {
        // Given
        UUID userId = UUID.randomUUID();
        int page = 0;
        int size = 10;

        Page<BookingUserProjection> emptyPage = new PageImpl<>(Arrays.asList(), PageRequest.of(page, size), 0);

        when(bookingJpaRepository.findByUserIdProjection(eq(userId), any(Pageable.class)))
                .thenReturn(emptyPage);

        // When
        PaginationUserBookingRoomResponseDto result = bookingService.getPaginatedUserBookings(userId, page, size);

        // Then
        assertNotNull(result);
        assertEquals(page, result.getPageNumber());
        assertEquals(size, result.getPageSize());
        assertEquals(0, result.getTotalRecords());
        assertEquals(0, result.getTotalPages());
        assertFalse(result.isHasNext());
        assertFalse(result.isHasPrevious());
        assertTrue(result.getBookings().isEmpty());

        verify(bookingJpaRepository).findByUserIdProjection(eq(userId), any(Pageable.class));
    }

    @Test
    public void testGetPaginatedUserBookings_MultiplePages() {
        // Given
        UUID userId = UUID.randomUUID();
        int page = 1;
        int size = 2;

        // Create mock projections
        BookingUserProjection projection1 = createMockBookingUserProjection();
        BookingUserProjection projection2 = createMockBookingUserProjection();

        List<BookingUserProjection> projectionList = Arrays.asList(projection1, projection2);
        Page<BookingUserProjection> mockPage = new PageImpl<>(projectionList, PageRequest.of(page, size), 5);

        when(bookingJpaRepository.findByUserIdProjection(eq(userId), any(Pageable.class)))
                .thenReturn(mockPage);

        // When
        PaginationUserBookingRoomResponseDto result = bookingService.getPaginatedUserBookings(userId, page, size);

        // Then
        assertNotNull(result);
        assertEquals(page, result.getPageNumber());
        assertEquals(size, result.getPageSize());
        assertEquals(5, result.getTotalRecords());
        assertEquals(3, result.getTotalPages()); // ceil(5/2) = 3
        assertTrue(result.isHasNext());
        assertTrue(result.isHasPrevious());
        assertEquals(2, result.getBookings().size());

        verify(bookingJpaRepository).findByUserIdProjection(eq(userId), any(Pageable.class));
    }

    @Test
    public void testGetPaginatedUserBookings_FirstPage() {
        // Given
        UUID userId = UUID.randomUUID();
        int page = 0;
        int size = 2;

        BookingUserProjection projection = createMockBookingUserProjection();
        List<BookingUserProjection> projectionList = Arrays.asList(projection);
        Page<BookingUserProjection> mockPage = new PageImpl<>(projectionList, PageRequest.of(page, size), 3);

        when(bookingJpaRepository.findByUserIdProjection(eq(userId), any(Pageable.class)))
                .thenReturn(mockPage);

        // When
        PaginationUserBookingRoomResponseDto result = bookingService.getPaginatedUserBookings(userId, page, size);

        // Then
        assertNotNull(result);
        assertEquals(0, result.getPageNumber());
        assertEquals(2, result.getPageSize());
        assertEquals(3, result.getTotalRecords());
        assertEquals(2, result.getTotalPages()); // ceil(3/2) = 2
        assertTrue(result.isHasNext());
        assertFalse(result.isHasPrevious());
        assertEquals(1, result.getBookings().size());

        verify(bookingJpaRepository).findByUserIdProjection(eq(userId), any(Pageable.class));
    }

    private BookingUserProjection createMockBookingUserProjection() {
        return new BookingUserProjection() {
            @Override
            public UUID getId() {
                return UUID.fromString("550e8400-e29b-41d4-a716-446655440001");
            }

            @Override
            public Date getRentalDate() {
                return new Date();
            }

            @Override
            public Date getRentalExpires() {
                return new Date();
            }

            @Override
            public Integer getTenantCount() {
                return 2;
            }

            @Override
            public Integer getStatus() {
                return 1;
            }

            @Override
            public Integer getIsRemoved() {
                return 0;
            }

            @Override
            public BookingRoomUserProjection getRoom() {
                return new BookingRoomUserProjection() {
                    @Override
                    public UUID getId() {
                        return UUID.fromString("550e8400-e29b-41d4-a716-446655440002");
                    }

                    @Override
                    public String getTitle() {
                        return "Test Room";
                    }

                    @Override
                    public Double getPrice_month() {
                        return 1000.0;
                    }

                    @Override
                    public Double getPrice_deposit() {
                        return 500.0;
                    }

                    @Override
                    public Integer getAvailable() {
                        return 0;
                    }

                    @Override
                    public Double getArea() {
                        return 25.5;
                    }

                    @Override
                    public BookingOwnerProjection getUser() {
                        return new BookingOwnerProjection() {
                            @Override
                            public UUID getId() {
                                return UUID.fromString("550e8400-e29b-41d4-a716-446655440003");
                            }

                            @Override
                            public BookingOwnerProfileProjection getProfile() {
                                return new BookingOwnerProfileProjection() {
                                    @Override
                                    public String getFullName() {
                                        return "Test Owner";
                                    }

                                    @Override
                                    public String getPhoneNumber() {
                                        return "0123456789";
                                    }
                                };
                            }
                        };
                    }

                    @Override
                    public BookingAddressProjection getAddress() {
                        return new BookingAddressProjection() {
                            @Override
                            public UUID getId() {
                                return UUID.fromString("550e8400-e29b-41d4-a716-446655440004");
                            }

                            @Override
                            public String getStreet() {
                                return "123 Test Street";
                            }

                            @Override
                            public BookingWardProjection getWard() {
                                return new BookingWardProjection() {
                                    @Override
                                    public Long getId() {
                                        return 1L;
                                    }

                                    @Override
                                    public String getName() {
                                        return "Test Ward";
                                    }

                                    @Override
                                    public BookingDistrictProjection getDistrict() {
                                        return new BookingDistrictProjection() {
                                            @Override
                                            public Long getId() {
                                                return 1L;
                                            }

                                            @Override
                                            public String getName() {
                                                return "Test District";
                                            }

                                            @Override
                                            public BookingProvinceProjection getProvince() {
                                                return new BookingProvinceProjection() {
                                                    @Override
                                                    public Long getId() {
                                                        return 1L;
                                                    }

                                                    @Override
                                                    public String getName() {
                                                        return "Test Province";
                                                    }
                                                };
                                            }
                                        };
                                    }
                                };
                            }
                        };
                    }
                };
            }

            @Override
            public String getImageProof() {
                // TODO Auto-generated method stub
                throw new UnsupportedOperationException("Unimplemented method 'getImageProof'");
            }
        };
    }
}
