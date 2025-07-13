import { Layout, theme, Table } from "antd";
import type { TableColumnsType } from "antd";

const { Content } = Layout;

interface DataType {
  key: React.Key;
  name: string;
  email: string;
  phonenumber: string;
  status: 0 | 1;
  authorization: "Admin" | "User";
}

const columns: TableColumnsType<DataType> = [
  {
    title: "Name",
    dataIndex: "name",
    width: "20%",
  },
  {
    title: "Email",
    dataIndex: "email",
    width: "25%",
  },
  {
    title: "Phone Number",
    dataIndex: "phonenumber",
    width: "20%",
  },
  {
    title: "Status",
    dataIndex: "status",
    width: "15%",
    render: (value) =>
      value === 0 ? (
        <span className="text-green-600 font-semibold">Active</span>
      ) : (
        <span className="text-red-500 font-semibold">Disabled</span>
      ),
  },
  {
    title: "Authorization",
    dataIndex: "authorization",
    width: "15%",
  },
  {
    title: "Action",
    key: "action",
    width: "20%",
    render: (_, record) => (
      <div className="flex gap-2">
        {record.status === 0 && (
          <button
            className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded"
            onClick={() => alert(`Disable account: ${record.name}`)}
          >
            Disable
          </button>
        )}
        {record.status === 1 && (
          <button
            className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded"
            onClick={() => alert(`Unlock account: ${record.name}`)}
          >
            Unlock
          </button>
        )}
      </div>
    ),
  },
];
const data: DataType[] = [
  {
    key: "1",
    name: "John Brown",
    email: "john.brown@example.com",
    phonenumber: "0123456789",
    status: 1,
    authorization: "Admin",
  },
  {
    key: "2",
    name: "Jim Green",
    email: "jim.green@example.com",
    phonenumber: "0987654321",
    status: 0,
    authorization: "User",
  },
];

function ManageAccountPage() {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <Content
      className="mx-4 my-6 p-6 min-h-[280px] dark:!bg-[#171f2f] dark:!text-white"
      style={{
        background: colorBgContainer,
        borderRadius: borderRadiusLG,
      }}
    >
      <h2 className="text-xl font-semibold mb-4 dark:text-white">
        Account Management
      </h2>
      <Table<DataType>
        columns={columns}
        dataSource={data}
        pagination={{ pageSize: 5 }}
      />
    </Content>
  );
}

export default ManageAccountPage;
