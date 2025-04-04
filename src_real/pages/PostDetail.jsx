// src/pages/PostDetail.jsx


import React, { useEffect, useState } from 'react';
import { Button, Table } from 'react-bootstrap';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion, transform } from "framer-motion";

//module css 를 import 해서 cx 함수로 사용할 준비를 한다.
import customCss from "./css/cafe_detail.module.css";
import binder from "classnames/bind";
import { useDispatch, useSelector } from 'react-redux';
import ConfirmModal from '../components/ConfirmModal';
import api from '../api';
const cx=binder.bind(customCss);

function PostDetail() {
    // "/posts/:num" 에서 num 에 해당되는 경로 파라미터 값 읽어오기
    const {num} = useParams()
    //글 하나의 정보를 상태값으로 관리
    const [state, setState]=useState({})
    //검색 키워드 관련처리
    const [params, setParams]=useSearchParams({
        condition:"",
        keyword:""
    });
    //로그인된 userName
    const userName = useSelector(state => state.userInfo && state.userInfo.userName);
    // state.userInfo && state.userInfo.userName 에서 리턴되는 값은 null 또는 "kimgura"

    const navigate = useNavigate();


    useEffect(()=>{
        const query=new URLSearchParams(params).toString();
        api.get(`/posts/${num}${params.get("condition") ? "?"+query : ""}`)
        .then(res=>{
            //글하나의 정보를 상태값에 넣어주고 
            setState(res.data);
        })
        .catch(error=>{
            console.log(error);
        });

        // 댓글 목록 받아오기
        refreshComments();

    }, [num]);

    const [modalShow, setModalShow] = useState(false);
    // 액션을 발행할 dispatch 함수
    const dispatch = useDispatch();

    // 원글에 댓글 추가 폼 이벤트 처리
    const handleCommentFormSubmit = (e)=>{
         e.preventDefault();

         // 만약 로그인을 하지 않은 상태라면
         if(!userName){
            const action = {
                type:"LOGIN_MODAL",
                payload: {
                    show: true,
                    title: "You need to Login for new comment"  
                }
            };
            dispatch(action);
            return; // 함수를 여기서 종료

         }

         // 폼에 입력한 내용을 object 로 얻어낸다.
         const formData = new FormData(e.target);
         const formObject = Object.fromEntries(formData.entries());
         // 새 댓글 추가 요청
         api.post(`/posts/${num}/comments`, formObject)
         .then(res =>{
            console.log(res.data);
            refreshComments() //여기였대요 래히핑이 찾았어...ㅎ...
            // 댓글 입력창 초기화
            e.target.content.value = "";    // textarea 의 value 에 빈 문자열 넣어주기
         })
         .catch(err=>console.log(err));
    };

     // 댓글 정보를 상태값으로 관리
     const [comments, setComments] = useState({
        list:[],
        totalPageCount:0,
        isLoading: false,   // 로딩중인지 여부
        btnDisabled:true,   // 버튼 disabled 여부 (댓글의 마지막 페이지 인지 여부)
        currentPage: 1      // 현재 댓글 페이지
    });

    // 댓글 정보를 얻어오는 함수
    const refreshComments = ()=>{
        api.get(`/posts/${num}/comments?pageNum=1`)
        .then(res=>{
            // 응답되는 댓글 목록을 상태값에 넣어준다.
            setComments({
                ...comments,
                list:res.data.list,
                totalPageCount:res.data.totalPageCount,
                btnDisabled:res.data.totalPageCount === 1
            });
            console.log(res.data);
        })
        .catch(err=>console.log(err));
    };


    // 댓글 더보기 버튼 눌렀을 때 호출되는 함수
    const handleMoreBtn = ()=>{
        // 로딩중에 여러번 눌러지지 않도록
        if(comments.isLoading) return;
        // 현재 댓글 페이지 번호보다 1 이 더 큰 댓글 페이지를 요청
        const page = comments.currentPage + 1;
        // 로딩중이라고 상태값 변경
        setComments({...comments, isLoading:true});
        api.get(`/posts/${num}/comments?pageNum=${page}`)
        .then(res=>{
            setComments({
                ...comments,
                list: [...comments.list, ...res.data.list],  // 기존 리스트에 응답 리스트 추가가
                isLoading:false,
                currentPage:page,
                btnDisabled: comments.totalPageCount === page  
            });
        })
        .catch(err=>{
            console.log(err);
            setComments({...comments, isLoading:false});
        });

    };

    return (
        <>
            <ConfirmModal show={modalShow} message="이 글을 삭제 하시겠습니까?" 
                onCancel={()=>setModalShow(false)} onYes={()=>{
                api.delete(`/posts/${state.num}`)
                .then(res=>{
                    navigate("/posts");
                })
                .catch(error=>{
                    console.log(error);
                });
                setModalShow(false);
            }}/>
            {state.prevNum !== 0 ? <Link to={`/posts/${state.prevNum}${params.get("condition") && "?"+new URLSearchParams(params).toString() }`}>이전글</Link> : ""}
            {state.nextNum !== 0 ? <Link to={`/posts/${state.nextNum}${params.get("condition") && "?"+new URLSearchParams(params).toString() }`}>다음글</Link> : ""}
            <h1>글 자세히 보기 페이지</h1>
            <Table>
                <thead>
                    <tr>
                        <th>번호</th>
                        <td>{state.num}</td>
                    </tr>
                    <tr>
                        <th>작성자</th>
                        <td>{state.writer}</td>
                    </tr>
                    <tr>
                        <th>제목</th>
                        <td>{state.title}</td>
                    </tr>
                    <tr>
                        <th>조회수</th>
                        <td>{state.viewCount}</td>
                    </tr>
                    <tr>
                        <th>수정일</th>
                        <td>{state.updatedAt}</td>
                    </tr>
                    <tr>
                        <th>작성일</th>
                        <td>{state.createdAt}</td>
                    </tr>
                </thead>
            </Table>
            <div className={cx("content")} dangerouslySetInnerHTML={{__html:state.content}}></div>
            {
                userName === state.writer ?
                <> 
                    <Button variant='warning' onClick={()=>{
                        navigate(`/posts/${state.num}/edit`);
                    }}>수정</Button>
                    <Button variant='danger' onClick={()=>setModalShow(true)}>삭제</Button>
                </>
                :   ""
            }

            <h4>댓글을 입력해 주세요</h4>
            {/* 원글에 댓글을 작성할 폼	 */}
            <form onSubmit={handleCommentFormSubmit} className={cx("comment-form")} method="post">
                <input type="hidden" name="postNum" defaultValue={num}/>
                <input type="hidden" name="targetWriter" defaultValue={state.writer}/>
                { userName? 
                    <textarea key='ta1' name="content"/>
                :
                    <textarea key='ta2' name="content" value='댓글 작성을 위해 로그인이 필요 합니다'/>
                }
                <button type="submit">등록</button>
            </form>
            {/* 왜 defaultValue??? value 를 쓰면 왜 오류지? 경고임 */}
            
            {/* 댓글 목록 */}
            <div className={cx("comments")}>
                <ul>
                    {comments.list.map(item => <CommemntLi key={item.num} postNum={num} comment={item} onRefresh={refreshComments }/>)}
                </ul>
                <div className="d-grid col-sm-6 mx-auto mb-5">
                    <button className="btn btn-success" 
                        disabled={comments.btnDisabled} onClick={handleMoreBtn} >
                        { comments.isLoading ? 
                            <div className="spinner-border" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        :
                            <span>댓글 더보기</span>
                        }
                    </button>
                </div>
            </div>
        </>
    );
}
/*
    <CommentLi postNum = {1} comment = {댓글 하나의 정보} onRefresh=()=>{}/>

    이 컴포넌트는 다음과 같이 사용할 예정이다.
    <ul> {comments.map(item => <CommentLi postNum =1 comment = {...}>)} </ul>
*/
function CommemntLi({postNum, comment, onRefresh}){

    // 로그인된 userName 얻어내기 (로그인 상태가 아니면 null)
    const userName = useSelector(state => state.userInfo && state.userInfo.userName); 
    // userInfo 는 null 일 가능성을 고려해서 && 를 사용한다. -> null, false, 빈문자열 을 대비한다다
    // userName 에는 userInfo 가 null 이면 null, null 이 아니면 userName 이 대입된다.

    /* 상태값 관리를 통해 댓글의 대댓글 작성 폼 요소의 생성과 비생성을 제어한다 */
    // 대댓글 form 상태 관리
    const [insertForm, setInsertForm] = useState(false);
    // 댓글 수정 form 상태 관리
    const [updateForm, setUpdateForm] = useState(false);

    // 프로필 이미지 처리
    const profileImage = comment.profileImage ? 
        <img className={cx("profile-image")} src={`/upload/${comment.profileImage}`} alt="Profile" />
    : 
        <svg className={cx("profile-image","default-icon")} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>
            <path fillRule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z"/>
        </svg>; 
            
    // 대댓글 등록 폼 submit 이벤트 처리
    const handleReInsertSubmit = (e)=>{
        e.preventDefault();
        // 폼에 입력한 내용을 object 로 얻어낸다.
        // {postNum, targetWriter, parentNum, content}
        const formData = new FormData(e.target);
        const formObject = Object.fromEntries(formData.entries());
        // 새로운 댓글을 axios 를 이용해서 전송한다.
        api.post(`/posts/${postNum}/comments`,formObject)
        .then(()=>{
            onRefresh();
            setInsertForm(false);
        })
        .catch(err=>console.log(err));
    };

    // 댓글 수정 폼 submit 이벤트 처리
    const handleUpdateSubmit = (e)=>{
        e.preventDefault();
        // 폼에 입력한 내용을 object 로 얻어낸다.
        // {num, content}
        const formData = new FormData(e.target);
        const formObject = Object.fromEntries(formData.entries());
        // 댓글을 수정하는 요청 보내기
        api.patch(`/posts/${postNum}/comments/${comment.num}`,formObject)  
        .then(()=>{
            onRefresh();
            setUpdateForm(false);
        })
        .catch(err=>console.log(err));
    };

    // 답글 버튼을 눌렀을 때 실행할 함수
    const handleInsertButton = ()=>{
        setInsertForm(!insertForm);
        setUpdateForm(false);
    };

    // 수정 버튼을 눌렀을 때 실행할 함수
    const handleUpdateButton = ()=>{
        setUpdateForm(!updateForm);
        setInsertForm(false);
    };

    // 삭제 버튼을 눌렀을 때 실행할 함수 
    const handleDeleteButton = ()=>{
        const isDelete = window.confirm("댓글을 삭제하시겠습니까?");
        if(isDelete){
            // 댓글을 삭제하는 요청 보내기 
            api.delete(`/posts/${postNum}/delete-comment/${comment.num}`)
            .then(()=>{
                onRefresh();
            })
            .catch(err=>console.log(err));
        }
    };
   
    //수정 삭제 링크 처리 
    // 로그인된 useName 이 댓글의 작성자와 같을 경우
    /*
        link 에 대입되는 값은 
        False 일 때, false
        True 일 때, jsx 객체 가 대입된다.
        즉, false 또는 a 요소 두 개가 들어있는 jsx 객체가 대입된다.
        이때, react 는 boolean 값을 UI 에 랜더링 하지 않는다.
     */
        const link = userName === comment.writer && 
            <>
                <button className={cx("update-link")} onClick={handleUpdateButton}>
                    {updateForm?"취소":"수정"}
                </button>
                <button className={cx("delete-link")} onClick={handleDeleteButton}>삭제</button>
            </>;

    return ( 
    <>
       <li className={cx({"indent":comment.num !== comment.parentNum})}>
            {comment.deleted === "yes" ?
            <>
                <svg style={{display: comment.num!==comment.parentNum?"inline":"none"}}  
                    className={cx("reply-icon")} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M1.5 1.5A.5.5 0 0 0 1 2v4.8a2.5 2.5 0 0 0 2.5 2.5h9.793l-3.347 3.346a.5.5 0 0 0 .708.708l4.2-4.2a.5.5 0 0 0 0-.708l-4-4a.5.5 0 0 0-.708.708L13.293 8.3H3.5A1.5 1.5 0 0 1 2 6.8V2a.5.5 0 0 0-.5-.5z"/>
                </svg>
                <pre>삭제된 댓글입니다</pre>
            </>
            :
            <>
                <svg style={{display: comment.num!==comment.parentNum?"inline":"none"}}  
                    className={cx("reply-icon")} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
	  				<path fillRule="evenodd" d="M1.5 1.5A.5.5 0 0 0 1 2v4.8a2.5 2.5 0 0 0 2.5 2.5h9.793l-3.347 3.346a.5.5 0 0 0 .708.708l4.2-4.2a.5.5 0 0 0 0-.708l-4-4a.5.5 0 0 0-.708.708L13.293 8.3H3.5A1.5 1.5 0 0 1 2 6.8V2a.5.5 0 0 0-.5-.5z"/>
				</svg>
				<dl>
                    <dt className={cx("comment-header")}>
                        {/* 프로필 이미지 */}
                        <div className={cx("comment-profile")}>
                            {profileImage}
                            <div className={cx("comment-meta")}>
                                <span className={cx("comment-writer")}>
                                    {comment.writer}
                                    {comment.num !== comment.parentNum ? '@' + comment.targetWriter : ''}
                                </span>
                                <small className={cx("comment-date")}>{comment.createdAt}</small>
                            </div>
                        </div>

                        {/* 답글, 수정, 삭제 버튼 */}
                        <div className={cx("comment-actions")}>
                            <button className={cx("reply-link")} onClick={handleInsertButton}>
                                {insertForm ? "취소" : "답글" }
                            </button>
                            {link}
                        </div>
                    </dt>
					<dd>
						<pre>{comment.content}</pre>
					</dd>
				</dl>

                {/* 상태값으로 관리 중인 insertForm 과 updateForm 을 통해 해당 폼 요소를 선택적으로 생성한다. */}
                
                {   insertForm &&
                    // 댓글의 댓글 작성할 폼 
                    <AnimatePresence mode='sync'>
                        <motion.div
                            key='form1'
                            initial={{ scaleY:0, opacity:0 }} // 시작 상태
                            animate={{ scaleY:1, opacity:1}}  // 끝 상태
                            exit={{ scaleY:0 }}   // 제거 상태 (위쪽이 -, 아래쪽이 +)
                            transition={{ duration: 0.2, ease:"easeOut" }}
                            style={{transformOrigin:"top"}}>
                            <form onSubmit={handleReInsertSubmit} className={cx("re-insert-form")}  method="post">
                                <input type="hidden" name="postNum" defaultValue={postNum}/>
                                <input type="hidden" name="targetWriter" defaultValue={comment.writer}/>
                                <input type="hidden" name="parentNum" defaultValue={comment.parentNum}/>
                                <textarea name="content"></textarea>
                                <button type="submit">등록</button>
                            </form>
                        </motion.div>
                    </AnimatePresence>
                }

                {   updateForm &&
                    // 댓글 수정폼 
                    <AnimatePresence mode='sync'>
                        <motion.div
                            key='form2'
                            initial={{ scaleY:0, opacity:0 }} // 시작 상태
                            animate={{ scaleY:1, opacity:1}}  // 끝 상태
                            exit={{ scaleY:0 }}   // 제거 상태 (위쪽이 -, 아래쪽이 +)
                            transition={{ duration: 0.2, ease:"easeOut" }}
                            style={{transformOrigin:"top"}}>
                            <form onSubmit={handleUpdateSubmit} className={cx("update-form")}  method="post">
                                <input type="hidden" name="num" defaultValue={comment.num}/>
                                <textarea name="content" defaultValue={comment.content}></textarea>
                                <button type="submit">수정확인</button>
                            </form>	
                        </motion.div>
                    </AnimatePresence>

                }

            </>
            }
        </li> 
    </>
    );
}

export default PostDetail;