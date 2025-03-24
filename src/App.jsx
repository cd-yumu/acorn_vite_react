import { useOutlet } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.css'
import BsNavBar from "./components/BsNavBar";
import LoginModal from "./components/LoginModal";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
// "/api" 라는 요청경로가 붙어있는 axios 객체이다.
import api from "./api";

function App(){

    const currentOutlet = useOutlet();

    // 로그인 모달의 상태값 redux store 로 부터 얻어낸다.
    const loginModal = useSelector(state => state.loginModal);
    const dispatch = useDispatch();


    // 로그아웃 타이머를 위한 변수
    let logoutTimer = null;

    // 자동 로그아웃 함수
    const setupAutoLogout = (token) => {
        const decoded = jwtDecode(token.substring(7));
        const exp = decoded.exp * 1000; // 초 → 밀리초
        const now = Date.now();
        const remainingTime = exp - now;

        if (remainingTime <= 0) {
            doLogout();
            return;
        }

        logoutTimer = setTimeout(() => {
            doLogout();
        }, remainingTime);
    };

    const doLogout = () => {
        delete localStorage.token;
        dispatch({ type: 'USER_INFO', payload: null });
        alert('토큰이 만료되어 자동 로그아웃 되었습니다.');
    };


    // App Component 가 활성화 되는 시점에 token 관련 처리
    useEffect(()=>{
        const token = localStorage.token;
        // 만일 토큰이 존재 한다면 
        if(token){
            api.get("/ping", {
                headers : {Authorization : token}
            })
            // 토큰이 유효한 경우 then 이 실행
            .then(() => {
                // 여기가 실행되면 사용가능한 토큰이라는 의미 

                // axios 의 요청 헤더에 자동으로 토큰이 포함되도록 한다.
                // api.defaults.headers.common["Authorization"] = token; 
                // 이제 없어도 된다 (중앙에서 넣기 때문)

                // 토큰을 디코딩해서 userName 을 얻어온다.
                //const decoded = decodeToken(token.substring(7));
                const decoded = jwtDecode(token.substring(7));
                // 발생할 action
                // const action = {type : "USER_INFO", payload : {
                //     userName :  decoded.payload.sub,
                //     role : decoded.payload.role
                // }};
                const action = {type : "USER_INFO", payload : {
                    userName :  decoded.sub,
                    role : decoded.role
                }};
                // 액션 발행하기
                dispatch(action);
            })
            // 토큰이 만료된 경우 catch 가 실행 (요청에 대해 오류가 전달되기 때문)
            .catch(() => {
                delete localStorage.token;
            });
        }
    },[]);
    const location = useLocation();
    return (
        <>
          <BsNavBar/>
            <div className="container" style={{marginTop:"60px"}}>
                <div style={{ position: "relative", overflow: "hidden", height: "100vh"  }}>
                    <AnimatePresence mode="wait">
                        {/* key가 바뀌면 AnimatePresence가 페이지 전환으로 인식 */}
                        <motion.div
                            key={location.pathname}
                            initial={{ x: "100%", opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: "-100%", opacity: 0 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            style={{
                            position: "absolute",
                            width: "100%",
                            height: "100%",
                            }}
                        >
                        <div>{currentOutlet}</div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
            <LoginModal show={loginModal.show}/>
        </>
    )
}

export default App;