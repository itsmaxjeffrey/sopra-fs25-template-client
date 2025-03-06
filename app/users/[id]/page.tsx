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
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { User } from "@/types/user";
import { Button, Card, Table } from "antd";
import type { TableProps } from "antd"; // antd component library allows imports of types
// Optionally, you can import a CSS module or file for additional styling:
// import "@/styles/views/Dashboard.scss";

const columns: TableProps<User>["columns"] = [
  {
    title: "Id",
    dataIndex: "id",
    key: "id",
  },
  
  {
    title: "Username",
    dataIndex: "username",
    key: "username",
  },
  {
    title: "Creation Date",
    key: "creationDate",
    render: (_, user) => {  // Use render to format the date
      if (!user.creationDate){return null}
      const creationDate = new Date(user.creationDate);
      
      // Choose ONE of these formatting options:
      
      // Option 1: Native JavaScript (no libraries)
      const formattedDate = creationDate.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });

      // Option 2: Using date-fns (install first: npm install date-fns)
      // import { format } from 'date-fns';
      // const formattedDate = format(creationDate, 'MMMM d, yyyy h:mm a');

      return formattedDate;
    }
  },

  {
    title: "Birthday",
    key: "birthday",
    render: (_, user) => {  // Use render to format the date
      if (!user.birthday){return null}
      const birthday = new Date(user.birthday);
      
      // Choose ONE of these formatting options:
      
      // Option 1: Native JavaScript (no libraries)
      const formattedDate = birthday.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });

      // Option 2: Using date-fns (install first: npm install date-fns)
      // import { format } from 'date-fns';
      // const formattedDate = format(creationDate, 'MMMM d, yyyy h:mm a');

      return formattedDate;
    }
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
  },

];


const Profile: React.FC = () => {
    const router = useRouter();
    const apiService = useApi();
    const [users, setUsers] = useState<User[] | null>(null);
    // useLocalStorage hook example use
    const { value: userId, set: setUserId, clear: clearUserId } = useLocalStorage<number | null>("userId", null);
    const [currentUserId, setCurrentUserId] = useState<number|null>(null);
    
    const {
      value: token, // is commented out because we dont need to know the token value for logout
      // set: setToken, // is commented out because we dont need to set or update the token value
      clear: clearToken, // all we need in this scenario is a method to clear the token
    } = useLocalStorage<string>("token", ""); // if you wanted to select a different token, i.e "lobby", useLocalStorage<string>("lobby", "");
  
    const handleLogout = async (): Promise<void> => {

      try{
        if (userId){
          await apiService.post(`/users/${currentUserId}/logout`, {});
        } else {
          console.warn("No user ID available for proper logout");
        }
      } catch (error){
        console.error("Error during logout:", error);
        // Still clear token and redirect in case of errorss
      }
      finally {
        // Always clear tokens and redirect
        clearToken();
        clearUserId();
        router.push("/login");
      }
      
      // Clear token using the returned function 'clear' from the hook
  
    };
    


  return (
    
    <div className="card-container">
      <p>
        <strong>User ID:</strong>
      </p>
      <p>
        <strong>Username:</strong>
      </p>
      <p>
        <strong>Birthday:</strong>
      </p>
      <p>
        <strong>Creation Date:</strong>
      </p>
      
    </div>
  );
  
};

export default Profile;
