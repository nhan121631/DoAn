// Types for LandlordTask

import { LandlordTaskCreateDto, LandlordTaskResponseDto, LandlordTaskUpdateDto } from "@/types/types";


const BASE_URL = "/api/landlord-tasks";

export const LandlordTaskService = {
  // Create a new landlord task
  async createTask(data: LandlordTaskCreateDto): Promise<LandlordTaskResponseDto> {
    console.log("Sending task data to API:", data);
    
    const res = await fetch(`${BASE_URL}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    
    if (!res.ok) {
      const errorData = await res.text();
      console.error("Create task API error:", {
        status: res.status,
        statusText: res.statusText,
        error: errorData
      });
      throw new Error(`Failed to create landlord task: ${res.status} - ${errorData}`);
    }
    
    return res.json();
  },

  // Update an existing landlord task
  async updateTask(taskId: string, data: LandlordTaskUpdateDto): Promise<LandlordTaskResponseDto> {
    console.log("Updating task ID:", taskId, "with data:", data);
    
    const res = await fetch(`${BASE_URL}/${taskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    
    if (!res.ok) {
      const errorData = await res.text();
      console.error("Update task API error:", {
        taskId,
        status: res.status,
        statusText: res.statusText,
        error: errorData
      });
      throw new Error(`Failed to update landlord task: ${res.status} - ${errorData}`);
    }
    
    return res.json();
  },

  // Get tasks by landlord ID
  async getTasksByLandlord(landlordId: string): Promise<LandlordTaskResponseDto[]> {
    const res = await fetch(`${BASE_URL}/landlord/${landlordId}`);
    if (!res.ok) throw new Error("Failed to fetch tasks by landlord");
    return res.json();
  },

  // Get task detail by task ID
  async getTaskDetail(taskId: string): Promise<LandlordTaskResponseDto> {
    const res = await fetch(`${BASE_URL}/${taskId}`);
    if (!res.ok) throw new Error("Failed to fetch task detail");
    return res.json();
  },

  // Delete a landlord task
  async deleteTask(taskId: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/${taskId}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete landlord task");
  },

  // Additional helper methods
  
  // Get tasks by status
  async getTasksByStatus(landlordId: string, status: string): Promise<LandlordTaskResponseDto[]> {
    const tasks = await this.getTasksByLandlord(landlordId);
    return tasks.filter(task => task.status === status);
  },

  // Get tasks by priority
  async getTasksByPriority(landlordId: string, priority: string): Promise<LandlordTaskResponseDto[]> {
    const tasks = await this.getTasksByLandlord(landlordId);
    return tasks.filter(task => task.priority === priority);
  },

  // Get overdue tasks
  async getOverdueTasks(landlordId: string): Promise<LandlordTaskResponseDto[]> {
    const tasks = await this.getTasksByLandlord(landlordId);
    const now = new Date();
    return tasks.filter(task => 
      task.dueDate && 
      new Date(task.dueDate) < now && 
      task.status !== 'COMPLETED' && 
      task.status !== 'CANCELLED'
    );
  },

  // Get tasks by contract
  async getTasksByContract(contractId: string, landlordId: string): Promise<LandlordTaskResponseDto[]> {
    const tasks = await this.getTasksByLandlord(landlordId);
    return tasks.filter(task => task.contractId === contractId);
  },

  // Get tasks by room
  async getTasksByRoom(roomId: string, landlordId: string): Promise<LandlordTaskResponseDto[]> {
    const tasks = await this.getTasksByLandlord(landlordId);
    return tasks.filter(task => task.roomId === roomId);
  },
};