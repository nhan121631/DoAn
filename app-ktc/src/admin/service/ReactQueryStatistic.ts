import { queryOptions } from "@tanstack/react-query";
import apiClient from "../lib/api-client-ad";
import type {
  ProvinceStatistic,
  MonthlyTransactionStats,
  MonthlyUserRegistration,
  TopLandlord,
} from "../types/type";

//=====Get rooms by province======//
const getRoomsByProvince = (): Promise<ProvinceStatistic[]> => {
  return apiClient.get("/admin/statistics/rooms/by-province");
};

export const getRoomsByProvinceQueryOptions = () => {
  return queryOptions({
    queryKey: ["roomsByProvince"] as const,
    queryFn: () => getRoomsByProvince(),
  });
};

//=====Get monthly revenue======//
const getMonthlyRevenue = (
  months?: number,
  landlordId?: string
): Promise<MonthlyTransactionStats[]> => {
  const searchParams = new URLSearchParams();
  if (months) searchParams.append("months", months.toString());
  if (landlordId) searchParams.append("landlordId", landlordId);
  const params = searchParams.toString() ? `?${searchParams.toString()}` : "";
  return apiClient.get(`/admin/statistics/revenue/monthly${params}`);
};

export const getMonthlyRevenueQueryOptions = (
  months?: number,
  landlordId?: string
) => {
  return queryOptions({
    queryKey: ["monthlyRevenue", months, landlordId] as const,
    queryFn: () => getMonthlyRevenue(months, landlordId),
  });
};

//=====Get monthly user registrations======//
const getMonthlyUserRegistrations = (
  months?: number
): Promise<MonthlyUserRegistration[]> => {
  const params = months ? `?months=${months}` : "";
  return apiClient.get(`/admin/statistics/users/monthly${params}`);
};

export const getMonthlyUserRegistrationsQueryOptions = (months?: number) => {
  return queryOptions({
    queryKey: ["monthlyUserRegistrations", months] as const,
    queryFn: () => getMonthlyUserRegistrations(months),
  });
};

//=====Get top landlords======//
const getTopLandlords = (limit?: number): Promise<TopLandlord[]> => {
  const params = limit ? `?limit=${limit}` : "";
  return apiClient.get(`/admin/statistics/landlords/top${params}`);
};

export const getTopLandlordsQueryOptions = (limit?: number) => {
  return queryOptions({
    queryKey: ["topLandlords", limit] as const,
    queryFn: () => getTopLandlords(limit),
  });
};
