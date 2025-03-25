// src/pages/Home.jsx

import React from 'react';
import api from '../api';
import { Link } from 'react-router-dom';


function Home() {
    
    return (
        <div>
            <h1>Index Page.</h1>

            <button onClick={()=>{
                api.get("/ping")
                .then(res=>{
                    alert(res.data);
                })
                .catch(()=>{
                    alert("응답하지 않음");
                });
            }}>Ping 요청 해보기</button>

            <ul>
                <li><Link to="/posts/new?a=10&b=20">Post 에 글 남기기</Link></li>
            </ul>
        </div>
    );
}


export default Home;