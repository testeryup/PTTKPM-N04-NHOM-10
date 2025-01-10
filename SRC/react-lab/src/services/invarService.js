import axios from '../axios';
let testRequest = () => {
    return axios.get("/api/var");
}

export default {
    testRequest
}