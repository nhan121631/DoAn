/* eslint-disable @typescript-eslint/no-explicit-any */

export async function resetPassword(email: string) {
    const formData = new FormData();
    formData.append("email", email);

    const response = await fetch("/api/resetpass", {
        method: "POST",
        body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
        // Trả về lỗi chi tiết từ backend nếu có
        const msg = data?.message?.[0] || data?.error || "Failed to reset password";
        throw new Error(msg);
    }

    return data;
}

export async function verifyResetCode(email: string, code: string) {
    const formData = new FormData();
    formData.append("email", email);
    formData.append("code", code);

    const response = await fetch("/api/very-resetpass", {
        method: "POST",
        body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
        // Trả về lỗi chi tiết từ backend nếu có
        const msg = data?.message?.[0] || data?.error || "Invalid code or email";
        throw new Error(msg);
    }

    return data;
}

export async function changePassword(email: string, newPassword: string, code: string) {
    const formData = new FormData();
    formData.append("email", email);
    formData.append("newPassword", newPassword);
    formData.append("code", code);

    const response = await fetch("/api/change-pass", {
        method: "POST",
        body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
        // Trả về lỗi chi tiết từ backend nếu có
        const msg = data?.message?.[0] || data?.error || "Failed to change password";
        throw new Error(msg);
    }

    return data;
}

export async function updatePassword(request:any) {
    const response = await fetch("/api/update-pass", {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
    });

    const data = await response.json();

    if (!response.ok) {
        // Trả về lỗi chi tiết từ backend nếu có
        const msg = data?.message?.[0] || data?.error || "Failed to update password";
        throw new Error(msg);
    }

    return data;
}
