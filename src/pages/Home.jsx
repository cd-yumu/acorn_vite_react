import axios from 'axios';
import React from 'react';
import { useSelector } from 'react-redux';

function Home(props) {

    const userInfo = useSelector(item=>item.userInfo);

    return (
        <div>
            <pre>{JSON.stringify(userInfo, null, 4)}</pre>
            <h1>Index Page.</h1>
            <button onClick={()=>{
                axios.get("/ping")
                .then(res => alert(res.data))
                .catch(err=> alert("Error!"))
            }}>Ping</button>
        </div>
    );
}

export default Home;