import axios from "axios";
import { BASE_URL } from '../utils/constants';

export const fetchJob = async ()=>{
    const res = await axios.get(BASE_URL+"/career/getall")
    return res;
}
   