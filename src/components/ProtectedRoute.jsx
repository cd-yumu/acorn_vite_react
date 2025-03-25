import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';

// Protected Router 용으로 사용하기 위해서는 children 을 전달 받고 리턴해준다.
function ProtectedRoute({children}) {
    // 현재 로그인 상태를 확인하여 허가 여부를 결정한다.
    

    // Redux Store
    const isLogin = useSelector(item => item.userInfo);

    // Hook
    const location = useLocation();
    const dispatch = useDispatch();

    // 로그인 하지 않은 상태라면
    if(!isLogin){
        // 로그인 모달창 띄우기
        dispatch({type:"LOGIN_MODAL", payload:{
            title:"You need to Login",
            show: true, 
            url: location.pathname + location.search    // 원래 가려던 목적지도 전달
        }});

        return null;    // 아무것도 출력 안 함
    } 

    return children;
}

export default ProtectedRoute;