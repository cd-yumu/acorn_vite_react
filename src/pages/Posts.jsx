import React, { useEffect, useState } from 'react';
import { Pagination, Table } from 'react-bootstrap';
import api from '../api';
import { useNavigate } from 'react-router-dom';

function Posts(props) {

    // Component 활성화
    useEffect(()=>{
        // 글 목록 요청
        refresh(1)
    },[]);

    // Hook
    const navigate = useNavigate();

    // State

    // 글 목록 페이지 상태값
    const [pageInfo, setPageInfo] = useState({list:[]});    // 요청 데이터 list 는 응답이 늦을 수도 있기 때문에 바로 초기화 해줘야 한다     
    // 페이징 처리용 상태값 (하단 페이징 버튼)
    const [paging, setPaging] = useState([]);


    // function

    // 페이지 번호에 맞는 글 목록 불러오기
    const refresh = (pageNum)=>{
        api.get(`/posts?pageNum=${pageNum}`)
        .then(res=>{
            // 글 목록 정보 상태값 저장
            setPageInfo(res.data);
            // 페이징 정보 상태값 저장
            setPaging(range(res.data.startPageNum, res.data.endPageNum))
        })
        .catch(err=>console.log(err));
    };

    // 전달 정보에 맞는 배열 만들어줌 ex. (4,6) => [4,5,6]
    const range = (str,end)=>{
        const result = [];
        for(let i = str; i <= end ; i++){
            result.push(i);
        }
        return result;
    }



    
    return (
        <>
            {/* <pre>{JSON.stringify(pageInfo, null, 4)}</pre> */}
            <h1>Posts.</h1>

            {/* 글 목록 */}
            <Table>
                <thead>
                    <tr>
                        <th>No</th>
                        <th>Title</th>
                        <th>Wirter</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    {pageInfo.list.map(item=>
                        <tr key={item.num}>
                            <td>{item.num}</td>
                            <td>{item.title}</td>
                            <td>{item.writer}</td>
                            <td>{item.updatedAt}</td>
                        </tr>
                    )}
                </tbody>
            </Table>

            {/* 페이징 처리 */}
            {/* <Pagination>
                <Pagination.Item onClick={navigate(`/posts?pageNum=${pageInfo.startPageNum-1}`)} disabled={paging[0] == 1}>Prev</Pagination.Item>
                {
                    paging.map(item=><Pagination.Item onClick={navigate(`/posts?pageNum=${item}`)}>{item}</Pagination.Item>)
                }
                <Pagination.Item onClick={navigate(`/posts?pageNum=${pageInfo.endPageNum+1}`)} disabled={paging[paging.length-1] == pageInfo.totalPageCount}>Next</Pagination.Item>
            </Pagination> */}
        </>
    );
}

export default Posts;