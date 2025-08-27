# API Endpoints

**Base URL:** `http://localhost:3333/api`

---

## **PostTypes**
| Method | Endpoint | Name | Status |
|--------|----------|------|--------|
| GET | `/post-types` | Get all post-types | ✅ Done |
| POST | `/post-types` | AddPostType | ✅ Done |
| PATCH | `/post-types` | Update PostType | ✅ Done |
| PATCH | `/post-types/delete/{id}` | Delete PostType | ✅ Done |

---

## **Convenients**
| Method | Endpoint | Name | Status |
|--------|----------|------|--------|
| GET | `/convenients` | Get all convenients | ✅ Done |
| POST | `/convenients` | Create new convenient | ✅ Done |
| DELETE | `/convenients/{id}` | Delete convenient by id | ✅ Done |

---

## **Addresses**
| Method | Endpoint | Name | Status |
|--------|----------|------|--------|
| GET | `/provinces` | Get all province | ✅ Done |
| GET | `/districts/{provinceId}` | Get all districts by province | ✅ Done |
| GET | `/wards/{districtId}` | Get all ward by district | ✅ Done |

---

## **Auth**
| Method | Endpoint | Name | Status |
|--------|----------|------|--------|
| POST | `/auth/login` | login | ✅ Done |
| POST | `/auth/google-login` | google login(test) | ✅ Done |
| POST | `/auth/register` | Register | ✅ Done |
| POST | `/auth/reset-password/{email}` | send reset pass | ✅ Done |
| POST | `/auth/verify-reset-code` | verify-reset-code | ✅ Done |
| POST | `/auth/update-password` | update-password | ✅ Done |

---

## **Transaction**
| Method | Endpoint | Name | Status |
|--------|----------|------|--------|
| GET | `/transactions/by-user/{userId}/paging?page={page}&size={size}` | (pagin)Get all transaction by userId | ✅ Done |
| GET | `/transactions/by-user/{userId}/date-range?startDate={startDate}&endDate={endDate}&page={page}&size={size}` | filter by date | ✅ Done |
| POST | `/transactions/{userId}` | Create transaction by userId | ✅ Done |

---

## **ManageAccounts**
| Method | Endpoint | Name | Status |
|--------|----------|------|--------|
| GET | `/admin/accounts/paginated?page={page}&size={size}` | Get paginated accounts | ✅ Done |
| GET | `/admin/accounts/{id}?page={page}&size={size}` | Get account by id | ✅ Done |
| PATCH | `/admin/accounts/{id}/status` | Update account status | ✅ Done |
| PATCH | `/admin/accounts/{id}/roles` | Update account roles | ✅ Done |

---

## **Wallet**
| Method | Endpoint | Name | Status |
|--------|----------|------|--------|
| GET | `/wallets/{id}` | Get wallet by id | ✅ Done |

---

## **Profile**
| Method | Endpoint | Name | Status |
|--------|----------|------|--------|
| GET | `/profile/{id}` | Get profile by id | ✅ Done |
| PATCH | `/profile/update` | Update profile | ✅ Done |
| POST | `/profile/{userId}/preferences` | Add Preferences address | ✅ Done |
| GET | `/profile/{userId}/preferences` | Get Preferences address by userId | ✅ Done |

---

## **Room / User**
| Method | Endpoint | Name | Status |
|--------|----------|------|--------|
| GET | `/rooms/{id}` | Get room by id | ✅ Done |
| GET | `/rooms/allroom-vip?page={page}&size={size}` | Get all VIP rooms | ✅ Done |
| GET | `/rooms/allroom-normal?page={page}&size={size}` | Get all normal rooms | ✅ Done |
| GET | `/rooms/allroom-normal?page={page}&size={size}&lat={lat}&lng={lng}` | Get all normal rooms with location | ✅ Done |
| GET | `/rooms/allroom-normal?page={page}&size={size}&lat={lat}&lng={lng}` | Get all normal rooms with location | ✅ Done |

---

## **Room / Landlord**
| Method | Endpoint | Name | Status |
|--------|----------|------|--------|
| GET | `/rooms/by-landlord/{id}/paging?page={page}&size={size}` | Get rooms by landlord | ✅ Done |
| POST | `/rooms` | Create room | ✅ Done |
| PATCH | `/rooms/{id}` | Update room | ✅ Done |
| PATCH | `/rooms/{id}/hidden` | Hide room | ✅ Done |
| PATCH | `/rooms/update-post-extend` | Update post extend | ✅ Done |

---

## **Room / Admin**
| Method | Endpoint | Name | Status |
|--------|----------|------|--------|
| GET | `/rooms/by-admin/paging?page={page}&size={size}` | Get rooms by admin | ✅ Done |
| POST | `/rooms/admin-send-email` | Admin send email | ✅ Done |
| PATCH | `/rooms/{id}/approval` | Approve room | ✅ Done |
| DELETE | `/rooms/{id}/delete` | Delete room | ✅ Done |

---

## **Booking**
| Method | Endpoint | Name | Status |
|--------|----------|------|--------|
| POST | `/bookings/user/{roomId}` | Create booking | ✅ Done |
| GET | `/bookings/user/{userId}/paging?page={page}&size={size}` | Get bookings by userId | ✅ Done |
| GET | `/bookings/landlord/{landlordId}/paging?page={page}&size={size}` | Get bookings by landlordId | ✅ Done |
| PATCH | `/bookings/{bookingId}/status` | Update booking status(landlord/user) | ✅ Done |
| PATCH | `/bookings/{bookingId}/delete?userId={userId}` | Delete booking | ✅ Done |

---

## **ManageMaintain**
| Method | Endpoint | Name | Status |
|--------|----------|------|--------|
| GET | `/landlord/maintenances/rooms` | Get maintenance rooms | ✅ Done |
| POST | `/landlord/maintenances` | Create maintenance | ✅ Done |
| GET | `/landlord/maintenances?page={page}&size={size}` | Get maintenances | ✅ Done |
| PATCH | `/landlord/maintenances/{id}` | Update maintenance | ✅ Done |

---

## **Favorite**
| Method | Endpoint | Name | Status |
|--------|----------|------|--------|
| GET | `/favorites?page={page}&size={size}` | Get all room to favorites | ✅ Done |
| POST | `/favorites/rooms/{roomId}` | Add room to favorites | ✅ Done |
| DELETE | `/favorites/rooms/{roomId}` | Remove room from favorites | ✅ Done |

---

## **API Gemini**
| Method | Endpoint | Name | Status |
|--------|----------|------|--------|
| POST | `/ai_search` | ai_search | ✅ Done |
| POST | `/ai_chatbot` | ai_chatbot | ✅ Done |

---

## **API Contract**
| Method | Endpoint | Name | Status |
|--------|----------|------|--------|
| POST | `/contracts` | Create contract | ✅ Done |
| GET | `/contracts/tenants/{tenantId}` | Get contracts by tenantId | ✅ Done |
| GET | `/contracts/landlords/{landlordId}` | Get contracts by landlordId | ✅ Done |
| GET | | Get con tract by room | ✅ Done |
| GET | | Get by contract id | ✅ Done |

---

## **API Create Bill**
| Method | Endpoint | Name | Status |
|--------|----------|------|--------|
| POST | `/bills` | Create bill | ✅ Done |
| GET | | Get bill by contract | ✅ Done |
| GET | `/bills/tenants/{tenantId}` | Get bills by tenantId | ✅ Done |
| GET | `/bills/{bill}/paid` | Get bills paid | ✅ Done |

## **API Chưa hoàn thành**
Rental room
Rating
Save room
Request room 
Fillter 
Search 
....

