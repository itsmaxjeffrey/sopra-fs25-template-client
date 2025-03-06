// this code is part of S2 to display a list of all registered users
// clicking on a user in this list will display /app/users/[id]/page.tsx
"use client"; // For components that need React hooks and browser APIs, SSR (server side rendering) has to be disabled. Read more here: https://nextjs.org/docs/pages/building-your-application/rendering/server-side-rendering
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


// Columns for the antd table of User objects
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
    title: "Status",
    dataIndex: "status",
    key: "status",
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

];

const Dashboard: React.FC = () => {
  const router = useRouter();
  const apiService = useApi();
  const [users, setUsers] = useState<User[] | null>(null);
  // useLocalStorage hook example use
  const { value: userId, set: setUserId, clear: clearUserId } = useLocalStorage<number | null>("userId", null);
  const [currentUserId, setCurrentUserId] = useState<number|null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // The hook returns an object with the value and two functions
  // Simply choose what you need from the hook:
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

  useEffect(() => {
    if (token){
      apiService.setAuthToken(token);
      setIsLoading(false);
    }
  },[token, apiService])

  useEffect(() => {
    const fetchUsers = async () => {
      if (isLoading || !token) {
        apiService.setAuthToken(token) 
        return;
      }
      try {
        // apiService.get<User[]> returns the parsed JSON object directly,
        // thus we can simply assign it to our users variable.
        const users: User[] = await apiService.get<User[]>("/users");
        setUsers(users);
        console.log("Fetched users:", users);
      } catch (error) {
        if (error instanceof Error) {
          alert(`Something went wrong while fetching users:\n${error.message}`);
          // console.log("Current token:", token);
        } else {
          console.error("An unknown error occurred while fetching users.");
          // console.log("Current token:", token);
        }
      }
    };

    fetchUsers();
  }, [isLoading,token,apiService]); // dependency apiService does not re-trigger the useEffect on every render because the hook uses memoization (check useApi.tsx in the hooks).
  // if the dependency array is left empty, the useEffect will trigger exactly once
  // if the dependency array is left away, the useEffect will run on every state change. Since we do a state change to users in the useEffect, this results in an infinite loop.
  // read more here: https://react.dev/reference/react/useEffect#specifying-reactive-dependencies

  return (
    <div className="card-container">
      <Card
        title="Get all users from secure endpoint:"
        loading={!users}
        className="dashboard-container"
      >
        {users && (
          <>
            {/* antd Table: pass the columns and data, plus a rowKey for stable row identity */}
            <Table<User>
              columns={columns}
              dataSource={users}
              rowKey="id"
              onRow={(row) => ({
                onClick: () => router.push(`/users/${row.id}`),
                style: { cursor: "pointer" },
              })}
            />
            <Button onClick={handleLogout} type="primary">
              Logout
            </Button>
          </>
        )}
      </Card>
    </div>
  );
};

export default Dashboard;
