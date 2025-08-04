export const getConvenients = async () => {
    const response = await fetch(`/api/convenients`);
    if (!response.ok) {
        throw new Error("Failed to fetch convenients");
    }
    
    return response.json();
};