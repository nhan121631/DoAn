export const getPostTypes = async () => {
    const response = await fetch(`/api/typepost`);
    if (!response.ok) {
        throw new Error("Failed to fetch post types");
    }
    return response.json();
};

// import { API_URL } from "./Constant";

// export const getPostTypes = async (session:any) => {
//     const response = await fetch(`${API_URL}/post-types`, {
//         headers: {
//             "Content-Type": "application/json",
//             "Authorization": `Bearer ${session.user.accessToken}`,
//         },
//     });

//     if (!response.ok) {
//         const errorJson = await response.json();
//         console.error("Backend error:", errorJson);
//         throw new Error("Failed to fetch post types");
//     }

//     return response.json();
// };
