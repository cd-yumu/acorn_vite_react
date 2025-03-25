import React from 'react';
import { Button, Container, Nav, Navbar } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink, useNavigate } from 'react-router-dom';

function BsNavBar(props) {

    // Store Data
    const userInfo = useSelector(state=>state.userInfo);

    // Hook
    const dispatch = useDispatch();
    const navigate = useNavigate();


    //Handler
    const handleLogin = ()=>{
        console.log("handleLogin 작동");
        // 로그인 모달창 띄우기
        const action = {
            type : "LOGIN_MODAL", 
            payload : {
                title:"Login Form.",
                show:true
            }
        };
        dispatch(action);
    };


    const handleLogout = ()=>{ 
        const answer = window.confirm("Do you want Logout?")
        if(answer){
            alert("Logout Succeed");                         // 1. 알려주기
            delete localStorage.token;                       // 2. localStorage 에서 토큰 삭제하기
            dispatch({type:"USER_INFO", payload:null});      // 3. Redux Store 에 저장된 유저 정보 삭제하기
            navigate("/");                                   // 4. Index Page 로 이동하기기    
        }
    };


    const handleSignup = ()=>{};

    return (
        <>
            <Navbar fixed='top' expand='md' className='bg-success mb-2'>
                <Container >
                    <Navbar.Brand as={NavLink} className='text-white'>MyPage</Navbar.Brand>
                    <Navbar.Toggle aria-controls="one"/>
                    <Navbar.Collapse id="one">
                        {/* 네비바 링크 목록 */}
                        <Nav className='me-auto'>
                            <Nav.Link as={NavLink} to="/" className='text-white'>Home</Nav.Link>
                            <Nav.Link as={NavLink} to="/posts" className='text-white'>Post</Nav.Link>
                        </Nav>

                        {/* 로그인 관련 */}
                        {
                            userInfo ?
                                // 사용자 정보가 있으면 - 정보보기, 로그아웃 제공 
                                <Nav>

                                    <Button onClick={handleLogout}>Logout</Button>
                                </Nav>
                            :
                                // 사용자 정보가 없으면 - 로그인, 회원가입 제공
                                <Nav>
                                    <Button onClick={handleLogin} className='me-2'>Login</Button>
                                    <Button onClick={handleSignup}>Sign-up</Button>
                                </Nav>
                        }

                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </>
    );
}

export default BsNavBar;