import { ApiService } from "@/api/apiService";
import { useMemo } from "react"; // think of usememo like a singleton, it ensures only one instance exists
import useLocalStorage from "./useLocalStorage";

export const useApi = () => {
  const {value: token} = useLocalStorage('token',null);

  return useMemo(() =>{
    const service = new ApiService();

    if (token) {
      service.setAuthToken(token);
    }
    return service;
  },[token]);
   // only if ApiService changes, the memo gets updated and useEffect in app/users/page.tsx gets triggered
};
