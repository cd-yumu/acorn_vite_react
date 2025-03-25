import axios from 'axios';
import React from 'react';

function Home(props) {
    return (
        <div>
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