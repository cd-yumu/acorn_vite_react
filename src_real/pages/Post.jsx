// src/pages/Post.jxs

import React, { useEffect, useState } from 'react';
import { Pagination, Table } from 'react-bootstrap';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api';

function Post(props) {
    // "/posts?pageNum=x" 에서 pageNum 을 추출하기 위한 hook
    const [params, setParams] = useSearchParams({
        // ?pageNum=1&condition=&keyword 와 같은 상태
        // 값이 필요할 경우 - params.get("pageNum") 과 같은 메소드로 얻는다.
        pageNum:1,
        condition:"",
        keyword:""
    });   
    // useSearchParams url 추소에 같이 오는 파라미터 데이터를 오브젝트로 형성해준다.
    // ex. /posts?page=10&count=5 => {page:10, count:5}  *숫자도 문자열 형식으로 가져옴옴

    // 글 정보를 상태값으로 관리
    const [pageInfo, setPageInfo] = useState({
        list : [],
    });
    
    // 글 목록 데이터를 새로 읽어오는 함수
    const refresh = (pageNum)=>{      // 매개 변수에 '=1' 을 붙이면 전달 값이 없을 경우 기본 1 값 셋팅?

        // 검색 조건과 keyword 에 관련된 정보 얻어내기
        const query = `condition=${params.get("condition")}&keyword=${params.get("keyword")}`;

        api.get(`/posts?pageNum=${pageNum}${params.get("condition") && "&"+query}`) //&condition=${condition}&keyword=${keyword}
        .then(res => {
            setPageInfo(res.data);
            /*  "list": [ ...글 목록 ] 과 함께 다음 정보를 얻을 수 있다.
                "startPageNum": 1,
                "endPageNum": 3,
                "totalPageCount": 3,
                "pageNum": 1,
                "totalRow": 11,
                "findQuery": "",
                "condition": null,
                "keyword": null
            */

            // 페이징 숫자 배열을 만들어서 state 에 넣는다
            setPageArray(range(res.data.startPageNum, res.data.endPageNum));
        })
        .catch(err => console.log(err));
    };

    // 페이징 숫자를 출력할 때 사용하는 배열을 상태값으로 관리
    const [pageArray, setPageArray] = useState([]);

    useEffect(()=>{
        // query 파라미터 값을 읽어와 봄
        let pageNum = params.get("pageNum")
        //만일 존재 하지 않는다면 1 페이지로 설정
        if(pageNum==null)pageNum=1
        //해당 페이지의 내용을 원격지 서버로 부터 받아온다 
        refresh(pageNum);
    },[params]);
    // 이 함수는 Post 컴포넌트가 활성화 되는 시점에 1 번 호출
    // 또한, params 에 변화가 생겼을 때 호출된다.

    //페이지를 이동할 hook
    const navigate = useNavigate();

    //페이징 UI 를 만들때 사용할 배열을 리턴해주는 함수 
    function range(start, end) {
        const result = [];
        for (let i = start; i <= end; i++) {
            result.push(i);
        }
        return result;
    }

    // 페이지 이동하는 함수
    const move = (pageNum)=>{
        // object 에 저장된 정보를 이용해서 query 문자열 만들어내기기
        const query = new URLSearchParams(searchState).toString();
        navigate(`/posts?pageNum=${pageNum}${searchState.condition && "&"+query}`);
    };



    // 검색 조건과 키워드를 상태값으로 관리
    const [searchState, setSearchState] = useState({
        condition:"",
        keyword:""
    })

    // 검색 조건을 변경하거나 검색어를 입력하면 호출되는 함수
    const handleSearchChange = (e)=>{
        setSearchState({
            ...searchState,
            [e.target.name]:e.target.value
        })
    };

    // Reset 버튼을 눌렀을 때
    const handleReset = ()=>{
        setSearchState({
            condition:"",
            keyword:""
        })
        move(1);    // 1 page 의 내용이 보여지게 한다.
    }

    return (
        <>
            <h1>Post List.</h1>
            <Link to='/posts/new'>Create New Post</Link>
            <Table striped bordered size='sm'>
                <thead>
                    <tr>
                        <th>No</th>
                        <th>Title</th>
                        <th>Writer</th>
                        <th>Viewers</th>
                        <th>Add-Date</th>
                    </tr>
                </thead>
                <tbody>
                {
                    pageInfo.list.map(item=>
                        <tr>
                            <td>{item.num}</td>
                            <td>
                                <Link 
                                    to={`/posts/${item.num}${searchState.condition && "?condition="+searchState.condition+"&keyword="+searchState.keyword}`}>
                                    {item.title}
                                </Link>
                            </td>
                            <td>{item.writer}</td>
                            <td>{item.viewCount}</td>
                            <td>{item.createdAt}</td>
                        </tr>
                    )
                }
                </tbody>
            </Table>
            <Pagination className='mt-3'>
                <Pagination.Item onClick={()=>move(pageInfo.startPageNum-1)} 
                    disabled={pageInfo.startPageNum === 1}>Prev</Pagination.Item>
                {
                    pageArray.map(item=>
                        <Pagination.Item key={item} onClick={()=>{move(item)}} 
                        active={pageInfo.pageNum === item}>{item}</Pagination.Item>
                    )   
                }
                <Pagination.Item onClick={()=>move(pageInfo.endPageNum+1)} 
                    disabled={pageInfo.endPageNum === pageInfo.totalPageCount}>Next</Pagination.Item>
            </Pagination>

            <label htmlFor="search">Search</label>
            <select name="condition" id="search" onChange={handleSearchChange} value={searchState.condition}>
                <option value="">Select</option>
                <option value="title_content">Title+Content</option>
                <option value="title">Title</option>
                <option value="writer">Writer</option>
            </select>
            <input type="text" placeholder='Keyword...' name='keyword' onChange={handleSearchChange} value={searchState.keyword}/>
            <button onClick={()=>{move(1)}}>Search</button>
            <button onClick={handleReset}>Reset</button>
            { pageInfo.keyword && <p><strong>{pageInfo.totalRow}</strong>개의 글이 검색되었습니다.</p> }
        </>
    );
}

export default Post;