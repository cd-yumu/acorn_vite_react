import React, { useState } from 'react';
import { Button, FloatingLabel, Form, Modal } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import api from '../api';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';


function LoginModal(props) {

    // Hook
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Store Data
    const loginModal = useSelector(item => item.loginModal);

    // State
    const [inputInfo, setInputInfo] = useState({});
    const [show, setShow] = useState(props.show);



    // Handler
    const handleClose = ()=>{   // 모달 창 닫기 버튼
        dispatch({type:'LOGIN_MODAL', payload:{show:false}});
    }

    const handleChange = (e)=>{ // 모달 창의 로그인 정보 입력
        setInputInfo({
            ...inputInfo,
            [e.target.name]:e.target.value
        });
    }  

    const handleLogout = ()=>{  // 로그아웃 실행
        alert("토큰이 만료되어 자동 로그아웃 되었습니다."); // 1. 알려주기
        delete localStorage.token;                       // 2. localStorage 에서 토큰 삭제하기
        dispatch({type:"USER_INFO", payload:null});      // 3. Redux Store 에 저장된 유저 정보 삭제하기
        navigate("/");                                   // 4. Index Page 로 이동하기기
    };

    const handleLogin = ()=>{   // 로그인 요청
        // /auth: 전달된 정보를 확인 후 토큰을 리턴함
        api.post("/auth", inputInfo)    
        // 로그인 성공 시
        .then( res=>{
            // 로그인 모달창 닫기
            handleClose();

            // 토큰을 localStorage 에 저장
            localStorage.token = res.data;

            // 응답된 token 으로부터 사용자 이름과 token 유효시간 등 정보 추출
            const decoded = jwtDecode(res.data.substring(7));
            console.log("token 해석 결과")
            console.log(decoded);
            /* ex
                {
                exp: 1742915211,
                iat: 1742897211,
                iss: "your-issuer",
                role: "ROLE_USER",
                sub: "kimgura"
                }
            */
             
            // 추출된 정보를 Store 에 반영 (userName, role)
            dispatch({
                type:"USER_INFO",
                payload: {
                    userName:decoded.sub,
                    role:decoded.role
                }
            });

            // 자동 로그아웃 예약 (토큰 만료 시간)
            const remainingTime = decoded.exp*1000 - Date.now();
            const logoutTimer = setTimeout(()=>{
                handleLogout();
            },remainingTime);
            dispatch({type:"LOGOUT_TIMER", payload:logoutTimer});
            console.log("로그인 남은 시간: "+ remainingTime);

            // 원래 가려던 경로가 있는지 확인
            if(loginModal.url) navigate(loginModal.url);
        })
        .catch(err=>console.log(err));
    };  // handleLogin

    


    return (
        <>
            {/* BootStrap Modal */}
            <Modal show={props.show} size="lg" centered onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>{loginModal.title}</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <FloatingLabel controlId='userName' label="User Name" className='mb-3'>
                        <Form.Control onChange={handleChange} name="userName" type="text" />
                    </FloatingLabel>
                    <FloatingLabel controlId='password' label="Password" className='mb-3'>
                        <Form.Control onChange={handleChange} name="password" type="password" />
                    </FloatingLabel>
                    {/* 로그인 정보 오류 시 발생 메시지 */}
                    {/* {errorMsg && <Alert variant='danger'>{errorMsg}</Alert>} */}
                </Modal.Body>

                <Modal.Footer>
                    <Button onClick={handleLogin}>Sign in</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default LoginModal;