// src/componenets/BsNavBar.jsx

import React from 'react';
import { Button, Container, Nav, Navbar } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import api from '../api';

function BsNavBar() {

    // store 의 상태값을 바꿀 함수
    const dispatch = useDispatch();
    // redux store 로 부터 상태값 가져오기기
    const userInfo = useSelector(state=>state.userInfo);
    // route 이동을 하기위한 hook
    const navigate = useNavigate();
    // 로그아웃 타이머
    const logoutTimer = useSelector(state=>state.logoutTimer);

    return (
        <>
            <Navbar fixed="top" expand="md" className="bg-warning mb-2">
                <Container>
                    <Navbar.Brand as={NavLink} to="/">Acorn</Navbar.Brand>
                    <Navbar.Toggle aria-controls="one"/>
                    <Navbar.Collapse id="one">
                        <Nav className='me-auto'>
                            <Nav.Link as={NavLink} to="/">Home</Nav.Link>
                            <Nav.Link as={NavLink} to="/posts">Post</Nav.Link>
                            <Nav.Link as={NavLink} to="/quiz">Quiz</Nav.Link>
                        </Nav>
                        {
                            userInfo ? 
                            <>
                                <Nav>
                                    <Nav.Link as={Link} to="/user/detail">{userInfo.userName}</Nav.Link>
                                    {/* <span className='navbar-text'>Signed in</span> */}
                                    <Button className='ms-2' size='sm' variant='outline-primary' onClick={()=>{
                                        const isLogin = window.confirm("확인을 누르면 로그아웃 합니다");
                                        if(!isLogin) return;
                                        // 토큰 삭제
                                        delete localStorage.token;
                                        // 요청 헤더에 token 포함되도록 설정한것 삭제하기
                                        delete api.defaults.headers.common["Authorization"];
                                        // store 에 userInfo 를 초기화
                                        dispatch({type:"USER_INFO", payload:null});
                                        // 인덱스로 이동
                                        navigate("/");
                                        // 로그아웃 타이머 초기화
                                        clearTimeout(logoutTimer);
                                        dispatch({type:"LOGOUT_TIMER", payload:null});
                                    }}>Logout</Button>
                                </Nav>
                            </>
                            :
                            <>
                                <Button size='sm' className='sm' variant='success' onClick={()=>{
                                        const action = {type : "LOGIN_MODAL", payload : {
                                            title : "Login Form.",
                                            show : "true"
                                        }};
                                        dispatch(action);
                                    }}>Login
                                </Button>
                                <Button size='sm' className='ms-2' variant='primary'>Signup</Button>
                            </>
                        }
                    </Navbar.Collapse>
                </Container>
            </Navbar> 
        </>
    );
}

export default BsNavBar;