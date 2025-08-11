// /* eslint-disable @typescript-eslint/no-explicit-any */
// import React, { useState, useEffect, useCallback } from "react";
// import { Table, Select, Tag, Button, Popconfirm, message, Space } from "antd";
// import type { TableColumnsType } from "antd";
// import type { UserResponseDto } from "../types/type";
// import {
//   fetchAccounts,
//   updateAccountStatus,
//   updateAccountRoles,
// } from "../service/AccountService";

// const { Option } = Select;

// const TableManageAccount: React.FC = () => {
//   const [loading, setLoading] = useState(false);
//   const [accountsData, setAccountsData] = useState<UserResponseDto[]>([]);
//   const [editingKey, setEditingKey] = useState<string | null>(null);
//   const [tempAuth, setTempAuth] = useState<string | null>(null);

//   const loadAccounts = useCallback(async () => {
//     setLoading(true);
//     try {
//       const responseData = await fetchAccounts();
//       // console.log("🔍 Data from fetchAccounts:", responseData);

//       if (Array.isArray(responseData)) {
//         setAccountsData(responseData);
//         message.success(`Found ${responseData.length} accounts.`);
//       } else {
//         message.error("❌ Received invalid data.");
//         setAccountsData([]);
//       }
//     } catch (error: any) {
//       console.error("❌ Error loading accounts:", error);
//       message.error(error?.message || "Error loading accounts");
//       setAccountsData([]);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     loadAccounts();
//   }, [loadAccounts]);

//   // const toggleStatus = async (record: UserResponseDto) => {
//   //   const newStatus = record.status === "Active" ? 1 : 0;
//   //   try {
//   //     await updateAccountStatus(record.id, newStatus);
//   //     message.success(`Status updated successfully`);
//   //     loadAccounts();
//   //   } catch (error: any) {
//   //     message.error(error?.message || "Failed to update status");
//   //   }
//   // };

//   const toggleStatus = async (record: UserResponseDto) => {
//     // Correct mapping with backend
//     const newStatusNumber = record.status === "Active" ? 1 : 0;
//     const newStatusText = newStatusNumber === 1 ? "Disabled" : "Active"; // toggle text

//     try {
//       await updateAccountStatus(record.id, newStatusNumber);

//       setAccountsData((prev) =>
//         prev.map((acc) =>
//           acc.id === record.id ? { ...acc, status: newStatusText } : acc
//         )
//       );

//       message.success(
//         `Account has been ${newStatusNumber === 0 ? "unlocked" : "disabled"}`
//       );
//     } catch (error: any) {
//       message.error(error?.message || "Failed to update status");
//     }
//   };

//   // const saveAuthorization = async (record: UserResponseDto) => {
//   //   if (!tempAuth) {
//   //     message.warning("Please select a role.");
//   //     return;
//   //   }
//   //   try {
//   //     await updateAccountRoles(record.id, [tempAuth]);
//   //     message.success("Authorization updated successfully!");
//   //     setEditingKey(null);
//   //     setTempAuth(null);
//   //     loadAccounts();
//   //   } catch (error: any) {
//   //     message.error(error?.message || "Failed to update authorization");
//   //   }
//   // };
//   const saveAuthorization = async (record: UserResponseDto) => {
//     if (!tempAuth) {
//       message.warning("Please select a role.");
//       return;
//     }
//     try {
//       await updateAccountRoles(record.id, [tempAuth]);

//       // ✅ Update local state, no need to refetch
//       setAccountsData((prev) =>
//         prev.map((acc) =>
//           acc.id === record.id ? { ...acc, roles: [tempAuth] } : acc
//         )
//       );

//       message.success("Authorization updated successfully!");
//       setEditingKey(null);
//       setTempAuth(null);
//     } catch (error: any) {
//       message.error(error?.message || "Failed to update authorization");
//     }
//   };

//   const columns: TableColumnsType<UserResponseDto> = [
//     {
//       title: "Username",
//       dataIndex: "username",
//       width: "15%",
//       sorter: (a, b) => a.username.localeCompare(b.username),
//     },
//     {
//       title: "Email",
//       dataIndex: "email",
//       width: "20%",
//       sorter: (a, b) => a.email.localeCompare(b.email),
//     },
//     { title: "Phone Number", dataIndex: "phoneNumber", width: "15%" },
//     {
//       title: "Status",
//       dataIndex: "status",
//       width: "10%",
//       render: (val: string) =>
//         val === "Active" ? (
//           <Tag color="green">Active</Tag>
//         ) : (
//           <Tag color="red">Disabled</Tag>
//         ),
//     },
//     {
//       title: "Authorization",
//       dataIndex: "roles",
//       width: "20%",
//       render: (roles, record) => {
//         const isEditing = editingKey === record.id;
//         const currentRole = roles?.[0] || "Users";
//         return isEditing ? (
//           <Space>
//             <Select
//               value={tempAuth || currentRole}
//               onChange={setTempAuth}
//               style={{ width: 120 }}
//             >
//               <Option value="Users">User</Option>
//               <Option value="Landlords">Landlord</Option>
//             </Select>
//             <Button
//               type="primary"
//               size="small"
//               onClick={() => saveAuthorization(record)}
//             >
//               Save
//             </Button>
//             <Button size="small" onClick={() => setEditingKey(null)}>
//               Cancel
//             </Button>
//           </Space>
//         ) : (
//           <span
//             onClick={() => {
//               setEditingKey(record.id);
//               setTempAuth(currentRole);
//             }}
//             style={{ cursor: "pointer" }}
//           >
//             {roles.map((r: any) => (
//               <Tag key={r} color={r === "Landlords" ? "blue" : "default"}>
//                 {r}
//               </Tag>
//             ))}
//           </span>
//         );
//       },
//     },
//     {
//       title: "Action",
//       key: "action",
//       width: "15%",
//       render: (_, record) =>
//         record.status === "Active" ? (
//           <Popconfirm
//             title="Disable this account?"
//             onConfirm={() => toggleStatus(record)}
//           >
//             <Button danger type="primary" size="small">
//               Disable
//             </Button>
//           </Popconfirm>
//         ) : (
//           <Button
//             type="primary"
//             size="small"
//             onClick={() => toggleStatus(record)}
//           >
//             Unlock
//           </Button>
//         ),
//     },
//   ];

//   return (
//     <div style={{ padding: "20px" }}>
//       <Table
//         columns={columns}
//         dataSource={accountsData}
//         loading={loading}
//         pagination={{ pageSize: 5 }}
//         rowKey="id"
//       />
//     </div>
//   );
// };

// export default TableManageAccount;

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback } from "react";
import { Table, Select, Tag, Button, Popconfirm, message, Space } from "antd";
import type { TableColumnsType } from "antd";
import type { UserResponseDto } from "../types/type";
import {
  fetchAccounts,
  updateAccountStatus,
  updateAccountRoles,
} from "../service/AccountService";

const { Option } = Select;

const TableManageAccount: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [accountsData, setAccountsData] = useState<UserResponseDto[]>([]);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [tempAuth, setTempAuth] = useState<string | null>(null);

  const loadAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const responseData = await fetchAccounts();
      
      if (responseData && Array.isArray(responseData)) {
        setAccountsData(responseData);
        message.success(`Tìm thấy ${responseData.length} tài khoản.`);
      } else {
        message.error("❌ Nhận dữ liệu không hợp lệ.");
        setAccountsData([]);
      }
    } catch (error: any) {
      console.error("❌ Lỗi khi tải tài khoản:", error);
      message.error(error?.message || "Lỗi khi tải tài khoản");
      setAccountsData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  const updateAuthorization = useCallback(
    async (record: UserResponseDto) => {
      if (!tempAuth) {
        message.error("Vui lòng chọn một vai trò.");
        return;
      }
      setLoading(true);
      try {
        await updateAccountRoles(record.id, [tempAuth]);
        message.success("Cập nhật vai trò thành công!");
        setEditingKey(null);
        await loadAccounts();
      } catch (error: any) {
        console.error("Lỗi khi cập nhật vai trò:", error);
        message.error(error?.message || "Cập nhật vai trò thất bại!");
      } finally {
        setLoading(false);
      }
    },
    [tempAuth, loadAccounts]
  );

  const toggleStatus = useCallback(async (record: UserResponseDto) => {
    setLoading(true);
    try {
      const newStatus = record.status === "Active" ? 1 : 0;
      await updateAccountStatus(record.id, newStatus);
      message.success("Cập nhật trạng thái thành công!");
      await loadAccounts();
    } catch (error: any) {
      console.error("Lỗi khi cập nhật trạng thái:", error);
      message.error(error?.message || "Cập nhật trạng thái thất bại!");
    } finally {
      setLoading(false);
    }
  }, [loadAccounts]);

  const columns: TableColumnsType<UserResponseDto> = [
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Phone Number",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "Active" ? "green" : "red"}>{status}</Tag>
      ),
    },
    {
      title: "Roles",
      dataIndex: "roles",
      key: "roles",
      render: (roles, record) => {
        const currentRole = roles[0];
        return editingKey === record.id ? (
          <Space>
            <Select
              style={{ width: 120 }}
              defaultValue={currentRole}
              onChange={(value) => setTempAuth(value)}
            >
              <Option value="Landlords">Landlords</Option>
              <Option value="Users">Users</Option>
            </Select>
            <Button
              size="small"
              type="primary"
              onClick={() => updateAuthorization(record)}
            >
              Save
            </Button>
            <Button size="small" onClick={() => setEditingKey(null)}>
              Cancel
            </Button>
          </Space>
        ) : (
          <span
            onClick={() => {
              setEditingKey(record.id);
              setTempAuth(currentRole);
            }}
            style={{ cursor: "pointer" }}
          >
            {roles.map((r: any) => (
              <Tag key={r} color={r === "Landlords" ? "blue" : "default"}>
                {r}
              </Tag>
            ))}
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
            title="Vô hiệu hóa tài khoản này?"
            onConfirm={() => toggleStatus(record)}
            okText="Có"
            cancelText="Không"
          >
            <Button danger type="primary" size="small">
              Vô hiệu hóa
            </Button>
          </Popconfirm>
        ) : (
          <Button
            type="primary"
            size="small"
            onClick={() => toggleStatus(record)}
          >
            Mở khóa
          </Button>
        ),
    },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <Table
        columns={columns}
        dataSource={accountsData}
        loading={loading}
        pagination={{ pageSize: 5 }} // Giới hạn 5 bản ghi mỗi trang ở frontend
        rowKey="id"
      />
    </div>
  );
};

export default TableManageAccount;
