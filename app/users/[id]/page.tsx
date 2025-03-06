// your code here for S2 to display a single user profile after having clicked on it
// each user has their own slug /[id] (/1, /2, /3, ...) and is displayed using this file
// try to leverage the component library from antd by utilizing "Card" to display the individual user
// import { Card } from "antd"; // similar to /app/users/page.tsx

"use client";
// For components that need React hooks and browser APIs,
// SSR (server side rendering) has to be disabled.
// Read more here: https://nextjs.org/docs/pages/building-your-application/rendering/server-side-rendering

import '@ant-design/v5-patch-for-react-19';
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { User } from "@/types/user";

import { Button, Card, DatePicker, Form, Input, message, Table } from "antd";
import type { TableProps } from "antd"; // antd component library allows imports of types
// Optionally, you can import a CSS module or file for additional styling:


const Profile: React.FC = () => {
    const router = useRouter();
    const apiService = useApi();
    const params = useParams();
    const [user, setUser] = useState<User | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);
    const [isLoading,setIsLoading]= useState(false);

    const [saving, setSaving] = useState(false);




    // useLocalStorage hook example use
    const { value: storedId } = useLocalStorage<number | null>("id", null);
    const { clear: clearToken } = useLocalStorage<string>("token", "");
    const { clear: clearId } = useLocalStorage<number | null>("id", null);    
    const isCurrentUser = storedId?.toString() === params.id;
    const {
        value: token, // is commented out because we dont need to know the token value for logout
        // set: setToken, // is commented out because we dont need to set or update the token value
        // clear: clearToken, // all we need in this scenario is a method to clear the token
      } = useLocalStorage<string>("token", ""); // if you wanted to select a different token, i.e "lobby", useLocalStorage<string>("lobby", "");

    
    const formatBirthday = (dateString: string) => {
      if (!dateString) return "N/A";
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
      });
    };
  const handleLogout = async (): Promise<void> => {
    try {
      if (storedId) {
        
        
        // Make the logout request to change status on server
        const response = await apiService.post(`/users/${id}/logout`, {});
        // console.log("Logout response:", response);
        
        // Don't need to refresh users as we're redirecting immediately
        // Just clear tokens and redirect
        clearToken();
        clearId();
        // console.log("Local storage cleared");
        router.push("/login");
      } else {
        // console.log("Logging out user with ID:", id);
        // console.log("Current token:", token);
        console.warn("No user ID available for proper logout");
        // Still redirect to login if id is not available
        router.push("/login");
      }
    } catch (error) {
      console.error("Error during logout:", error);
      // If there's an error, still redirect to login
      clearToken();
      clearId();
      router.push("/login");
    }
  };



    useEffect(() => {
      if (token){
        apiService.setAuthToken(token);
        setIsLoading(false);
      }
    },[token, apiService, storedId])
  
    const fetchUser = async () => {
      if (isLoading || !token) {
        apiService.setAuthToken(token) 
        return;
      }
      try {
        // apiService.get<User[]> returns the parsed JSON object directly,
        // thus we can simply assign it to our users variable.
        setLoading(true);
        const data = await apiService.get<User>("/users/${params.id}");
        setUser(data);
        // console.log("Fetched users:", users);
      } catch (error) {
        if (error instanceof Error) {
          alert(`Something went wrong while fetching user:\n${error.message}`);
          // console.log("Current token:", token);
        } else {
          console.error("An unknown error occurred while fetching user.");
          // console.log("Current token:", token);
        }
      } 
      finally{
        setLoading(true);
      }
    };

    const handleEdit = () => {
      setIsEditing(true);

      form.setFieldsValue({
        username:user?.username,
        birthday: user?.birthday ? dayjs(user.birthday) : null,
      })
    }
    
    const handleCancel = () => {
      setIsEditing(false);
      form.resetFields();
    } 

    const handleSave = async (values: {
      username: string;
      birthday: Date;
    }) => {
      try {
        setSaving(true);
    

        await apiService.put('/users/${id}', values);
        await fetchUser();
        setIsEditing(false);
        message.success("Profile updated successfully");
      } catch (error) {
        console.error("Failed to update user:", error);
        message.error("Failed to update profile");
      } finally {
        setSaving(false);
      }
    };

  
};

export default Profile;
function dayjs(birthday: Date) {
  throw new Error('Function not implemented.');
}

