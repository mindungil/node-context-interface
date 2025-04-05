import axios from 'axios';

const sendLogData = async (table) => {
    await axios.post('http://localhost:8080/api/logdata', {
        data: table
    })
    .then(() => {
        console.log(`${table} 로그데이터 전송 완료`);
    })
    .catch((err) => {
        console.error('로그데이터 전송 실패:', err);
    })
}

export default sendLogData;