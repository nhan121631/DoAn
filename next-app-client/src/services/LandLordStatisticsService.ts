export const getLandlordPostedRoomCount = async () => {
    const response = await fetch('/api/landlord/statistics/posted-room', { cache: 'no-store' });
    if (!response.ok) {
        throw new Error('Failed to fetch posted room count');
    }
    return response.json();
}

export const getLandlordRentedRoomCount = async () => {
    const response = await fetch('/api/landlord/statistics/rented-room', { cache: 'no-store' });
    if (!response.ok) {
        throw new Error('Failed to fetch rented room count');
    }
    return response.json();
}
export const getLandlordViewedRoomCount = async () => {
    const response = await fetch('/api/landlord/statistics/viewed-room', { cache: 'no-store' });
    if (!response.ok) {
        throw new Error('Failed to fetch viewed room count');
    }
    return response.json();
}
export const getLandlordFavoritedRoomCount = async () => {
    const response = await fetch('/api/landlord/statistics/favorited-room', { cache: 'no-store' });
    if (!response.ok) {
        throw new Error('Failed to fetch favorited room count');
    }
    return response.json();
}

export const getLandlordMaintainceStatistics = async (startDate?: string, endDate?: string) => {
    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);
    const response = await fetch(`/api/landlord/statistics/maintaince-room?${queryParams.toString()}`, { cache: 'no-store' });
    if (!response.ok) {
        throw new Error('Failed to fetch maintenance statistics');
    }
    return response.json();
}

export const getLandlordFeePostRoomStatistics = async (startDate?: string, endDate?: string) => {
    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);
    const response = await fetch(`/api/landlord/statistics/cost-post-room?${queryParams.toString()}`, { cache: 'no-store' });
    if (!response.ok) {
        throw new Error('Failed to fetch fee post room statistics');
    }
    return response.json();
}

export const getLandlordRevenueStatistics = async (startDate?: string, endDate?: string) => {
    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);
    const response = await fetch(`/api/landlord/statistics/revenue-room?${queryParams.toString()}`, { cache: 'no-store' });
    if (!response.ok) {
        throw new Error('Failed to fetch revenue statistics');
    }
    return response.json();
}