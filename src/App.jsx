import 'bootstrap/dist/css/bootstrap.css'      
import { useNavigate, useOutlet } from "react-router-dom";
import BsNavBar from "./components/BsNavBar";
import { useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";

import Test from './components/Test';
import LoginModal from './components/LoginModal';
import { jwtDecode } from 'jwt-decode';
import api from './api';

function App(){

    // State Data
    const loginModal = useSelector(item => item.loginModal);    // 모달창 정보
    const logoutTimer = useSelector(item=>item.logoutTimer);    // 로그인 타이머 정보

    // Hook
    const currentOutlet = useOutlet();
    const dispatch = useDispatch();
    const navigate = useNavigate();


    // function
    const handleLogout = ()=>{  // 로그아웃 실행
        alert("토큰이 만료되어 자동 로그아웃 되었습니다."); // 1. 알려주기
        delete localStorage.token;                       // 2. localStorage 에서 토큰 삭제하기
        dispatch({type:"USER_INFO", payload:null});      // 3. Redux Store 에 저장된 유저 정보 삭제하기
        navigate("/");                                   // 4. Index Page 로 이동하기기
    };


    // App 이 활성화 될 때때
    useEffect(()=>{
        // localStroage 에 token 존재 시 header 에 token 을 포함해 ping 요청을 보내보고
        // 유효한 토큰으로 정상 응답 될 경우, 모든 axios 요청의 header 에 토큰을 포함시키기
        
        // localStorage 에 token 정보 확인
        const token = localStorage.token;
        console.log("토큰 있나 확인: " + token);
        // 만약 token 정보가 있다면
        if(token){
            console.log(234234234342)
            // 유효한 token 인지 확인
            api.get("/ping",{
                headers:{Authorization:token}
                
            })
            .then(res=>{    // 유효한 token 확인됨
                console.log(res);
                // token 해독하여 여러 정보 추출
                const decoded = jwtDecode(token.substring(7));
                console.log(decoded);
                    
                // 추출된 정보를 Store 의 userInfo 에 저장 (userName, role)
                //발행할 action
                const action={type:"USER_INFO", payload:{
                    userName:decoded.sub,
                    role:decoded.role
                }};
                //액션 발행하기
                dispatch(action);
                console.log("여기임임")


                // // 자동 로그아웃 예약 (토큰 만료 시간)
                const remainingTime = decoded.exp*1000 - Date.now();
                const logoutTimer = setTimeout(()=>{handleLogout()},remainingTime);
                
                // 로그아웃 타이머 정보를 Store 의 logoutTimer 에 저장
                dispatch({type:"LOGOUT_TIMER", payload:logoutTimer});
                console.log("로그인 남은 시간: "+ remainingTime);
            })
            .catch(err=>console.log(err));
        }


        // App 이 비활성화 될 때
        return ()=>{
            // 만약 logoutTimer 를 셋팅한 적이 있다면
            if(logoutTimer){
                // 타이머 삭제
                clearTimeout(logoutTimer);                      
                dispatch({type:"LOGOUT_TIMER", payload:null})   
            }
        };
    },[])

    return (
        <>
            <BsNavBar/>
            <div className='container' style={{marginTop:'60px'}}>
                <div>{currentOutlet}</div> 
            </div>
            <LoginModal show={loginModal.show}></LoginModal>
            <Test></Test>
        </>
    )
}

export default App;