// src/pages/UserPwdUpdateForm.js


import { useState } from "react";
import { Alert, Breadcrumb, Button, Form } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";



function UserPwdUpdateForm() {
    // 공백이 아닌 한글자가 1 번이상 반복되어야 통과되는 정규 표현식 
    const reg_password = /^[^\s]+$/
    // 특수문자가 포함되어야 통과되는 정규표현식
    const reg_newPassword = /[\W]/

    //폼에 입력한 내용을 상태값으로 관리
    const [formData, setFormData] = useState({
        password:"",
        newPassword:"",
        newPassword2:""
    })

    //폼의 유효성 여부를 상태값으로 관리
    const [isValid, setValid] = useState({
        password:false,
        newPassword:false
    })

    //폼입력란에 한번이라도 입력했는지 여부를 상태값으로 관리
    const [isDirty, setDirty] = useState({
        password:false,
        newPassword:false
    })

    //에러메세지를 관리하기 위한 상태값
    const [error, setError] = useState({
        show:false,
        message:""
    })

    // input 요소에 change 이벤트가 일어 났을때 실행할 함수 
    const handleChange = (e)=>{
        // e.target 은  name 과 value 가 있는 object 인데 해당 object 의 구조를 분해 할당한다.
        const {name, value} = e.target

        //만일 현재 입력란이 아직 더럽혀지지 않았다면 
        if(!isDirty[name]){                     
            //더럽혀 졌는지 여부를 변경하기 
            setDirty({
                ...isDirty,
                [name]:true
            })
        }

        setFormData({
            ...formData,
            [name]:value
        })
        validate(name, value)
    }

    //검증 함수
    const validate = (name, value)=>{
        if(name === "password"){
            setValid({
                ...isValid,
                [name]: reg_password.test(value)
            })
        }else if(name === "newPassword"){
            const isEqual = value === formData.newPassword2
            setValid({
                ...isValid,
                newPassword: reg_newPassword.test(value) && isEqual
            })
        }else if(name === "newPassword2"){
            const isEqual = value === formData.newPassword
            setValid({
                ...isValid,
                newPassword: reg_newPassword.test(value) && isEqual
            })
        }
    }

    const navigate = useNavigate()
    const dispatch = useDispatch()

    //폼 전송 이벤트가 발생했을때 실행할 함수
    const handleSubmit = (e)=>{
        e.preventDefault()
        api.patch("/user/password", formData)
        .then(res=>{
            console.log(res.data)
            // 정상적으로 비밀번호가 변경되었다면 어떤 처리를 하나?

            // 1. 로그아웃 처리를 하고
            delete localStorage.token;
            delete api.defaults.headers.common["Authorization"];
            dispatch({type:"USER_INFO", payload:null});  
            // 2. 위치를 / 최상위 경로로 변경하고
            navigate("/"); 
            // 3. "변경된 비밀번호로 로그인 하세요" 라는 로그인 모달을 띄운다.
            dispatch({
                type:"LOGIN_MODAL", 
                payload:{
                    title: "변경된 비밀번호로 다시 로그인 하세요",
                    show:true
                }});
        })
        .catch(error=>{
            console.log(error)
            //에러가 발생하면 어떤 처리를 해야 하나?
            //에러 메시지
            const message = error.response.data
            setError({
                show:true,
                message     // message : message
            })
        })
    }

    return (
        <>
            {/* 브래드 크럼 */}
            <Breadcrumb>
                <Breadcrumb.Item as={Link} to='/' href='/'>Home</Breadcrumb.Item>
                <Breadcrumb.Item as={Link} to='/user/detail' href='/user/detail'>User</Breadcrumb.Item>
                <Breadcrumb.Item as={Link} active>Update Password</Breadcrumb.Item>
            </Breadcrumb>

            {/* 본문 */}
            <h1>비밀번호 수정 양식</h1>
            { error.show && <Alert variant="danger">{error.message}</Alert>}
            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                    <Form.Label>기존 비밀 번호</Form.Label>
                    <Form.Control isValid={isValid.password} 
                        isInvalid={!isValid.password && isDirty.password} onChange={handleChange} type="password" name="password"/>
                    <div className="form-text">
                        반드시 입력하세요!
                    </div>
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>새 비밀 번호</Form.Label>
                    <Form.Control isValid={isValid.newPassword} 
                        isInvalid={!isValid.newPassword && isDirty.newPassword} onChange={handleChange} type="password" name="newPassword"/>
                    <div className="form-text">
                        특수문자를 하나이상 포함하고 확인란과 같아야 합니다
                    </div>
                    <Form.Control.Feedback type="invalid">
                        비밀번호를 확인하세요!
                    </Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>새 비밀 번호 확인</Form.Label>
                    <Form.Control onChange={handleChange} type="password" name="newPassword2"/>
                </Form.Group>
                <Button disabled={!isValid.password || !isValid.newPassword} variant="success" size="sm" type="submit">저장</Button>
            </Form>
        </>
    );
}

export default UserPwdUpdateForm;