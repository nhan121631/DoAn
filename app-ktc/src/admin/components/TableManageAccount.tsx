import React, { useState, useEffect, useCallback } from "react";
import { Table, Select, Tag, Button, Popconfirm, message, Space, Pagination } from "antd";
import type { TableColumnsType } from "antd";
import apiClient from "../lib/api-client-ad";
import { AxiosError, type AxiosResponse } from "axios";

const { Option } = Select;

export interface UserResponseDto {
  id: string;
  username: string;
  email: string;
  phoneNumber: string;
  status: string;
  roles: string[];
}

interface UserPageResponseDto {
  data: UserResponseDto[];
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

interface RoleUpdateRequestDto {
  roleNames: string[];
}

interface UpdateUserStatusRequestDto {
    status: number;
}

const TableManageAccount: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [accountsData, setAccountsData] = useState<UserResponseDto[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 7,
    total: 0,
  });

  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [tempAuth, setTempAuth] = useState<string | null>(null);

  const fetchAccounts = useCallback(async (page: number, size: number) => {
    setLoading(true);
    try {
      console.log(`Fetching accounts for page ${page - 1}, size ${size}...`);
      const response: AxiosResponse<UserPageResponseDto | UserResponseDto[]> = await apiClient.get(
        `/admin/accounts?page=${page - 1}&size=${size}`
      );
      
      console.log("API Response (full AxiosResponse object):", response);
      console.log("API Response.data (the actual data body):", response.data);

      let dataToProcess: UserResponseDto[] = [];
      let totalRecordsFromResponse = 0;
      let currentPageFromResponse = page; 
      let pageSizeFromResponse = size; 

      
      if (typeof response.data === 'object' && response.data !== null && 'data' in response.data && Array.isArray((response.data as UserPageResponseDto).data)) {
        const paginatedResponse = response.data as UserPageResponseDto;
        dataToProcess = paginatedResponse.data;
        totalRecordsFromResponse = paginatedResponse.totalRecords;
        currentPageFromResponse = paginatedResponse.pageNumber + 1; 
        pageSizeFromResponse = paginatedResponse.pageSize;
        console.log("Detected paginated response structure.");
      } 
      else if (Array.isArray(response.data)) {
        dataToProcess = response.data as UserResponseDto[];
        totalRecordsFromResponse = response.data.length; 
        currentPageFromResponse = 1; // Giả định đây là trang đầu tiên nếu không có thông tin phân trang
        pageSizeFromResponse = response.data.length > 0 ? response.data.length : pagination.pageSize; 
        console.log("Detected direct array response structure.");
      } else {
        message.error("Invalid data format received from API. Expected a paginated object or a direct array of users.");
        console.error("Invalid data format or unexpected response:", response.data);
        setAccountsData([]);
        setPagination((prev) => ({ ...prev, total: 0 }));
        setLoading(false);
        return; 
      }

      console.log("Data extracted (before filter):", dataToProcess);

      // LỌC BỎ CÁC TÀI KHOẢN CÓ VAI TRÒ "Administrators" TRƯỚC KHI HIỂN THỊ
      const filteredData = dataToProcess.filter(
        (account) => !account.roles.includes('Administrators')
      );

      console.log("Data extracted (after filter for display):", filteredData);
      console.log("Total records (from response):", totalRecordsFromResponse);

      setAccountsData(filteredData); // Cập nhật state với dữ liệu đã lọc
      setPagination((prev) => ({
        ...prev,
        current: currentPageFromResponse,
        pageSize: pageSizeFromResponse,
        total: totalRecordsFromResponse, // Giữ tổng số bản ghi từ backend để phân trang tổng thể
      }));

      if (filteredData.length > 0) {
        console.log("Data loaded successfully and filtered for display.");
      } else {
        console.log("No non-Admin data found or loaded on this page.");
      }

    } catch (error: any) {
      if (error instanceof AxiosError) {
        if (error.response) {
          message.error(`Error loading accounts: ${error.response.status} - ${error.response.data?.message || error.message}`);
          console.error("API Error Response:", error.response);
        } else if (error.request) {
          message.error("No response received from server. Please check network connection.");
          console.error("API Error Request:", error.request);
        } else {
          message.error(`An unexpected error occurred: ${error.message}`);
          console.error("API Error Message:", error.message);
        }
      } else {
        message.error("An unknown error occurred while fetching accounts.");
        console.error("Unknown Error:", error);
      }
      setAccountsData([]);
      setPagination((prev) => ({ ...prev, total: 0 })); 
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts(pagination.current, pagination.pageSize);
  }, [fetchAccounts, pagination.current, pagination.pageSize]);

  const toggleStatus = async (record: UserResponseDto) => {
    const newStatusValue = record.status === "Active" ? 1 : 0;
    const newStatusText = newStatusValue === 0 ? "unlocked" : "disabled";

    try {
      const requestBody: UpdateUserStatusRequestDto = { status: newStatusValue };
      await apiClient.patch<UserResponseDto>(`/admin/accounts/${record.id}/status`, requestBody);

      message.success(`Account ${newStatusText} successfully`);
      fetchAccounts(pagination.current, pagination.pageSize); 
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        message.error("Account not found.");
      } else if (error.response && error.response.status === 400) {
        message.error("Invalid status value.");
      } else {
        message.error(`Failed to update status: ${error.response?.data?.message || error.message}`);
      }
      console.error("Status update failed:", error);
    }
  };

  const handleAuthorizationChange = (value: string) => {
    setTempAuth(value);
  };

  const saveAuthorization = async (record: UserResponseDto) => {
    if (tempAuth === null) {
        message.warning("No role selected.");
        return;
    }

    try {
      const requestBody: RoleUpdateRequestDto = {
        roleNames: [tempAuth]
      };
      await apiClient.patch<UserResponseDto>(`/admin/accounts/${record.id}/roles`, requestBody);

      message.success("Authorization updated successfully!");
      setEditingKey(null);
      setTempAuth(null);
      fetchAccounts(pagination.current, pagination.pageSize); 
    } catch (error: any) {
      message.error(`Failed to update authorization: ${error.response?.data?.message || error.message}`);
      console.error("Authorization update failed:", error);
    }
  };

  const cancelEdit = () => {
    setEditingKey(null);
    setTempAuth(null);
  };

  const columns: TableColumnsType<UserResponseDto> = [
    {
      title: "Name",
      dataIndex: "username",
      width: "15%",
      sorter: (a, b) => a.username.localeCompare(b.username),
    },
    {
      title: "Email",
      dataIndex: "email",
      width: "20%",
      sorter: (a, b) => a.email.localeCompare(b.email),
    },
    {
      title: "Phone Number",
      dataIndex: "phoneNumber",
      width: "15%",
      sorter: (a, b) => a.phoneNumber.localeCompare(b.phoneNumber),
    },
    {
      title: "Status",
      dataIndex: "status",
      width: "10%",
      sorter: (a, b) => a.status.localeCompare(b.status),
      render: (value: string) =>
        value === "Active" ? (
          <Tag color="green">Active</Tag>
        ) : (
          <Tag color="red">Disabled</Tag>
        ),
    },
    {
      title: "Authorization",
      dataIndex: "roles",
      width: "20%",
      sorter: (a, b) => (a.roles[0] || '').localeCompare(b.roles[0] || ''),
      render: (roles: string[], record) => {
        const isEditing = editingKey === record.id;
        const currentRoleDisplay = roles && roles.length > 0 ? roles[0] : "Users"; 

        return isEditing ? (
          <Space>
            <Select
              defaultValue={currentRoleDisplay}
              value={tempAuth || currentRoleDisplay}
              onChange={handleAuthorizationChange}
              style={{
                width: 120,
              }}
            >
              <Option value="Users">User</Option>
              <Option value="Landlords">Landlord</Option>
            </Select>
            <Button
              type="primary"
              size="small"
              onClick={() => saveAuthorization(record)}
            >
              OK
            </Button>
            <Button size="small" onClick={cancelEdit}>
              Cancel
            </Button>
          </Space>
        ) : (
          <span
            onClick={() => {
                setEditingKey(record.id);
                setTempAuth(currentRoleDisplay);
            }}
            style={{ cursor: 'pointer', textDecoration: 'underline' }}
          >
            {roles && roles.length > 0 ? (
                roles.map(role => (
                    <Tag 
                        key={role} 
                        color={role === "Administrators" ? "gold" : (role === "Landlords" ? "blue" : "default")}
                    >
                        {role}
                    </Tag>
                ))
            ) : (
                <Tag>Users</Tag>
            )}
          </span>
        );
      },
    },
    {
      title: "Action",
      key: "action",
      width: "15%",
      render: (_, record) =>
        record.status === "Active" ? (
          <Popconfirm
            title="Are you sure you want to disable this account?"
            onConfirm={() => toggleStatus(record)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger type="primary" size="small">
              Disable
            </Button>
          </Popconfirm>
        ) : (
          <Button
            type="primary"
            size="small"
            onClick={() => toggleStatus(record)}
          >
            Unlock
          </Button>
        ),
    },
  ];

  const handleTableChange = (page: number, pageSize?: number) => {
    setPagination((prev) => ({
      ...prev,
      current: page,
      pageSize: pageSize || prev.pageSize,
    }));
  };

  return (
    <div style={{ padding: '20px' }}>
      
      <Table<UserResponseDto>
        columns={columns}
        dataSource={accountsData}
        pagination={false}
        loading={loading}
        rowKey="id"
        scroll={{ x: 'max-content' }}
      />
      <div style={{ marginTop: '20px', textAlign: 'right' }}>
        <Pagination
          current={pagination.current}
          pageSize={pagination.pageSize}
          total={pagination.total}
          onChange={handleTableChange}
          // showSizeChanger
          // pageSizeOptions={['5', '10', '20', '50']}
          hideOnSinglePage={true}
        />
      </div>
    </div>
  );
};

export default TableManageAccount;
