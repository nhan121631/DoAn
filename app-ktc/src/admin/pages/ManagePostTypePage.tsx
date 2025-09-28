/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Layout, theme, Form, message } from "antd";
import TableManagePostType from "../components/TableManagePostType";
import ModelCreatePostType from "../components/ModalAddPostType";
import { useState } from "react";
import ModelUpdatePostType from "../components/ModalUpdatePost";
import type { IPostType } from "../types/type";
import {
  useCreateTypePost,
  useUpdateTypePost,
} from "../service/ReactQueryTypePost";

const { Content } = Layout;

const ManagePostTypePage = () => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const [messageApi, contextHolder] = message.useMessage();

  // Modal state
  const [open, setOpen] = useState(false);
  const [opentUpdate, setOpenUpdate] = useState(false);
  const [form] = Form.useForm();

  // Handle create post type
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // const handleCreate = async () => {
  //   form.validateFields().then(async (values) => {
  //     try {
  //       await createTypePost(values);
  //       setRefreshKey((prev) => prev + 1);
  //       setErrorMessage(null);
  //       messageApi.success({
  //         content: "You created a new post type successfully!",
  //         duration: 1.5,
  //       });
  //       setOpen(false);
  //       form.resetFields();
  //     } catch (error: any) {
  //       if (error?.response?.data?.message) {
  //         setErrorMessage(error.response.data.message.join(", "));
  //       } else {
  //         setErrorMessage("An error has occurred!");
  //       }
  //     }
  //   });
  // };
  const createMutation = useCreateTypePost({
    mutationConfig: {
      onSuccess: () => {
        messageApi.success({
          content: "You created a post type successfully!",
          duration: 3,
        });
        form.resetFields();
        setOpen(false);
      },
      onError: (error: any) => {
        messageApi.error({
          content:
            error?.response?.data?.message?.join(", ") ||
            "An error has occurred!",
          duration: 3,
        });
      },
    },
  });
  const handleCreate = () => {
    form.validateFields().then((values: IPostType) => {
      createMutation.mutate({ data: values });
    });
  };
  // Handle update post type
  const [values, setValues] = useState<IPostType | null>(null);

  const handleEdit = (record: IPostType) => {
    setErrorMessage(null);
    setValues(record);
    form.setFieldsValue({
      id: record.id,
      code: record.code,
      name: record.name,
      pricePerDay: record.pricePerDay,
      description: record.description,
    });
    console.log("values record:", values);
    setOpenUpdate(true);
  };

  const updateMutation = useUpdateTypePost({
    mutationConfig: {
      onSuccess: () => {
        messageApi.success({
          content: "You updated a post type successfully!",
          duration: 3,
        });
        form.resetFields();
        setOpenUpdate(false);
      },
      onError: (error: any) => {
        messageApi.error({
          content:
            error?.response?.data?.message?.join(", ") ||
            "An error has occurred!",
          duration: 3,
        });
      },
    },
  });
  const handleUpdate = () => {
    form.validateFields().then((formValues: IPostType) => {
      // Thêm id từ state values vào payload
      const payload = {
        ...formValues,
        id: values?.id ?? "",
      };
      console.log("Update values:", payload);
      updateMutation.mutate({ data: payload });
    });
  };

  // const handleUpdate = async () => {
  //   form.validateFields().then(async (formValues) => {
  //     try {
  //       const updatedValues = {
  //         ...formValues,
  //         id: values?.id, // Lấy id từ state values
  //       };
  //       console.log("Update values:", updatedValues);
  //       await updateTypePost(updatedValues);
  //       setRefreshKey((prev) => prev + 1);
  //       setErrorMessage(null);
  //       messageApi.success({
  //         content: "You updated the post type successfully!",
  //         duration: 1.5,
  //       });
  //       setOpenUpdate(false);
  //       form.resetFields();
  //     } catch (error: any) {
  //       if (error?.response?.data?.message) {
  //         setErrorMessage(error.response.data.message.join(", "));
  //       } else {
  //         setErrorMessage("Đã có lỗi xảy ra!");
  //       }
  //     }
  //   });
  // };

  return (
    <Content
      className="mx-4 my-6 p-6 min-h-[280px] dark:!bg-[#171f2f] dark:!text-white"
      style={{
        background: colorBgContainer,
        borderRadius: borderRadiusLG,
      }}
    >
      {contextHolder}

      <h2 className="text-2xl font-semibold mb-4 dark:text-white">
        Post Type Management
      </h2>
      <Button type="primary" className="mb-4" onClick={() => setOpen(true)}>
        Create Post Type
      </Button>
      <TableManagePostType messageApi={messageApi} handleUpdate={handleEdit} />
      <ModelCreatePostType
        open={open}
        setOpen={setOpen}
        form={form}
        handleCreate={handleCreate}
        errorMessage={errorMessage}
      />
      <ModelUpdatePostType
        open={opentUpdate}
        setOpen={setOpenUpdate}
        form={form}
        handleUpdate={handleUpdate}
        data={values} // This should be the data you want to update
        errorMessage={errorMessage}
      />
    </Content>
  );
};

export default ManagePostTypePage;
