"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { User } from "@/types/user";
import {
  Button,
  Card,
  Descriptions,
  Form,
  Input,
  DatePicker,
  Spin,
  Space,
  Typography,
  App,
} from "antd";
import {
  EditOutlined,
  UserOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import "dayjs/locale/en";
import "@ant-design/v5-patch-for-react-19";

// Set consistent locale
dayjs.locale("en");

const { Title } = Typography;

interface UserProfileFormValues {
  username: string;
  birthday?: dayjs.Dayjs | null;
}

const UserProfile: React.FC = () => {
  const { message } = App.useApp();
  const params = useParams();
  const userId = params?.id as string;
  const router = useRouter();
  const apiService = useApi();
  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const [form] = Form.useForm<UserProfileFormValues>();

  // Authentication data
  const {
    value: token,
    clear: clearToken,
  } = useLocalStorage<string>("token", "");
  const {
    value: storedId,
    clear: clearStoredId,
  } = useLocalStorage<number | null>("storedId", null);

  const isOwnProfile = storedId !== null && storedId.toString() === userId;

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const timer = setInterval(() => {
      setCurrentTime(dayjs().format("YYYY-MM-DD HH:mm:ss"));
    }, 1000);
    return () => clearInterval(timer);
  }, [mounted]);

  useEffect(() => {
    if (!mounted || typeof window === "undefined") return;

    const checkAuth = async () => {
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        apiService.setAuthToken(token);
        await fetchUserData();
      } catch (error) {
        router.push("/login");
      }
    };

    checkAuth();
  }, [token, userId, router, apiService, mounted]);

  const fetchUserData = async () => {
    try {
      const userData = await apiService.get<User>(`/users/${userId}`);
      setUser(userData);
      // Don't try to set form values here - the form might not be mounted yet
    } catch (error) {
      message.error(
        error instanceof Error
          ? `Failed to fetch user data: ${error.message}`
          : "Failed to fetch user data"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const values = await form.validateFields();
      const updateData: Partial<User> = {
        username: values.username,
      };
      if (values.birthday !== undefined) {
        updateData.birthday = values.birthday ? values.birthday.format("YYYY-MM-DD") : null;
      }

      await apiService.put(`/users/${userId}`, updateData);

      setUser((prev) => {
        if (!prev) return null;
        const newUser = {
          ...prev,
          username: values.username,
        };
        if (values.birthday !== undefined) {
          newUser.birthday = values.birthday ? values.birthday.toDate() : null;
        }
        return newUser;
      });

      message.success("Profile updated successfully");
      setIsEditing(false);
    } catch (error) {
      message.error(
        error instanceof Error
          ? `Failed to update profile: ${error.message}`
          : "Failed to update profile"
      );
    }
  };

  const handleToggleEdit = () => {
    if (isEditing) {
      form.resetFields();
      setIsEditing(false);
    } else {
      // Only set form values when we're about to edit
      if (user) {
        form.setFieldsValue({
          username: user.username,
          birthday: user.birthday ? dayjs(user.birthday) : undefined,
        });
      }
      setIsEditing(true);
    }
  };

  const handleLogout = async () => {
    try {
      if (storedId) await apiService.post(`/users/${storedId}/logout`, {});
    } finally {
      clearToken();
      clearStoredId();
      router.push("/login");
    }
  };

  if (isLoading || !mounted) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ textAlign: "center", margin: "50px" }}>
        <Title level={4} style={{ color: "white" }}>
          User not found
        </Title>
        <Button onClick={() => router.push("/users")}>Back to Users</Button>
      </div>
    );
  }

  return (
    <Card
      title={
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Title level={4} style={{ color: "white" }}>
            {user.username}'s Profile
          </Title>
          {mounted && (
            <Typography.Text style={{ fontSize: "14px", color: "white" }}>
              Current time: {currentTime}
            </Typography.Text>
          )}
        </div>
      }
      style={{ maxWidth: 800, margin: "20px auto" }}
    >
      {isEditing ? (
        <Form form={form} layout="vertical">
          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: "Please enter a username" }]}
          >
            <Input prefix={<UserOutlined />} />
          </Form.Item>

          <Form.Item label="Birthday" name="birthday">
            <DatePicker style={{ width: "100%" }} placeholder="Select your birthday" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" onClick={handleSaveProfile}>
                Save
              </Button>
              <Button onClick={handleToggleEdit}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      ) : (
        <>
          <Descriptions
            bordered
            column={1}
            styles={{
              label: {
                fontWeight: "bold",
                width: "150px",
                textAlign: "right",
                paddingRight: "20px",
                color: "white",
              },
              content: {
                color: "white",
              },
            }}
          >
            <Descriptions.Item label="ID">{user.id}</Descriptions.Item>
            <Descriptions.Item label="Username">
              <Space>
                <UserOutlined />
                {user.username}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Status">{user.status}</Descriptions.Item>
            <Descriptions.Item label="Birthday">
              <Space>
                <CalendarOutlined />
                {user.birthday ? dayjs(user.birthday).format("MMMM D, YYYY") : "Not specified"}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Registered on">
              <Space>
                <ClockCircleOutlined />
                {user.creationDate
                  ? dayjs(user.creationDate).format("MMMM D, YYYY h:mm A")
                  : "Unknown"}
              </Space>
            </Descriptions.Item>
          </Descriptions>

          <div style={{ marginTop: 16, textAlign: "right" }}>
            <Space>
              {isOwnProfile && (
                <>
                  <Button type="primary" icon={<EditOutlined />} onClick={handleToggleEdit}>
                    Edit Profile
                  </Button>
                  <Button danger icon={<LogoutOutlined />} onClick={handleLogout}>
                    Logout
                  </Button>
                </>
              )}
            </Space>
          </div>
        </>
      )}
    </Card>
  );
};

export default UserProfile;