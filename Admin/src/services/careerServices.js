import axios from "axios";
import {BACKEND_URL} from '../Utils/constant'

export const sendJob = async (data) =>{
    const res = await axios.post (BACKEND_URL+"/career/create",data,{
        headers: { 'Content-Type': 'application/json' },
      })
    console.log(res?.data);
    return res;

}
export const editJob = async (jobId,jobData) =>{
    const res = await axios.put (BACKEND_URL+`/career/update/${jobId}`, jobData,{
        headers: { 'Content-Type': 'application/json' },
      })
    console.log(res?.data);
    return res;
}
export const removeJob = async (jobId) =>{
    const res = await axios.delete (BACKEND_URL+`/career/delete/${jobId}`);
    console.log(res?.data);
    return res;
}
export const fetchJob = async ()=>{
    const res = await axios.get(BACKEND_URL+"/career/getall")
    return res;
}
    

// ── Job Applications ────────────────────────────────────────────────

export const fetchApplications = async () => {
    const res = await axios.get(BACKEND_URL + "/career/applications");
    return res;
};

export const removeApplication = async (id) => {
    const res = await axios.delete(BACKEND_URL + `/career/applications/${id}`);
    return res;
};

// Triggers a file download directly in the browser
export const downloadApplicationsExcel = () => {
    window.open(BACKEND_URL + "/career/applications/export", "_blank");
};
