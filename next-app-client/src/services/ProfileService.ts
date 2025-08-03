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
