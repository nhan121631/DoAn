import { IRegisterInputs } from "@/app/users/components/Auth/RegisterForm";
import { API_URL } from "./Constant";

export async function RegisterService(data: IRegisterInputs) {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

 if (!response.ok) {
  const errorData = await response.json();
  const errorMsg =
    Array.isArray(errorData.message) ? errorData.message[0]
    : Array.isArray(errorData.errors) ? errorData.errors[0]
    : errorData.message || errorData.error || "Registration failed";
  throw new Error(errorMsg);
}

      return await response.json();
    } catch (error) {
      console.error('Error during registration:', error);
      throw error;
    }
}