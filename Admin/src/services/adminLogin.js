import axios from "axios";
import {BACKEND_URL} from '../Utils/constant'


export const login = async (props) => {
    
 const res = await axios.post(BACKEND_URL+"/admin/login",{
    email:props.email,
    password:props.password
 });
  console.log(res?.data);

  return res?.data;
};