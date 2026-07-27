import axios from "axios";
import {BACKEND_URL} from '../Utils/constant'

export const fetchUser = async () => {
    
 const res= await axios.get(BACKEND_URL+"/api/getall");
  console.log(res?.data);

  return res?.data;
};

export const handleDeleteUser = async (userID) => {
       try {
        const response = await axios.delete(
        BACKEND_URL +  `/api/delete?id=${userID}`
        );

        console.log(response.data.message); 
        return response?.data?.message;
      } catch (error) {
        console.error("Delete failed:", error.response.data.message);
      }
}
