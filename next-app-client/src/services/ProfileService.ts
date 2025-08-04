export async function updateProfile(avatar: File | null, profile: string) {
    const formData = new FormData();
    if (avatar) {
        formData.append("avatar", avatar);
    }
    formData.append("profile", profile);

    const response = await fetch("/api/profile", {
        method: "PATCH",
        body: formData,
    });

    if (!response.ok) {
        throw new Error("Failed to update profile");
    }

    return response.json();
}

export async function getBanks(){
    const response = await fetch("https://api.vietqr.io/v2/banks", {
        method: "GET",
    });

    if (!response.ok) {
        throw new Error("Failed to fetch banks");
    }

    const result = await response.json();
    // API trả về { data: [...] } nên cần lấy ra mảng banks
    return Array.isArray(result.data) ? result.data : [];
}