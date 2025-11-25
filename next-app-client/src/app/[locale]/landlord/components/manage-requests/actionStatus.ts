'use server';

export async function updateRequestStatus(id: number, newStatus: 0 | 1) {
  console.log(`Mock updating request ${id} to status ${newStatus}`);

  // Giả lập delay 500ms
  await new Promise((resolve) => setTimeout(resolve, 500));

  return { success: true };
}
