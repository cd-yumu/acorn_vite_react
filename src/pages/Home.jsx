// src/pages/Home.jsx


import React from 'react';
import api from '../api';


function Home(props) {
    
    return (
        <div>
            <h1>인덱스 페이지 입니다.</h1>
            <button onClick={()=>{
                api.get("/ping")
                .then(res=>{
                    alert(res.data);
                })
                .catch(error=>{
                    alert("응답하지 않음");
                });
            }}>Ping 요청 해보기</button>

        </div>
    );
}


export default Home;