import api from "../../../lib/api";
import axios from 'axios';


// lib/api/logout.ts
export async function logout() {


    const api = axios.create({
        baseURL: 'http://localhost:8000', // Laravel Sail のポート
        withCredentials: true, // Cookie を送信するために必要
        withXSRFToken: true,
    });

    //const res = await api.post(`/logout`);

    // if (res.status != 200) {
    //     throw new Error('ログアウトに失敗しました');
    // }

    // return res.data;
}