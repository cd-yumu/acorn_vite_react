
import React, { useEffect, useState } from 'react';
import { Alert, Button, Form, ProgressBar } from 'react-bootstrap';
// gemini 가 응답한 markdown 을 해석하기 위한 페키지 설치 및 import
import MarkDown from 'react-markdown';
// CodeMirror 를 사용하기 위해 3개의 페키지를 설치 하고 import 해야 한다 
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { dracula } from "@uiw/codemirror-theme-dracula";
// MarkDown 에  코드 블럭을 prettify 하기 위해 
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github.css"; //github 과 동일한 스타일로 코드 디자인이 된다.
import { Navigate, useNavigate } from 'react-router-dom';
//import "highlight.js/styles/atom-one-dark.css"  // dark 테마 스타일 코드 
import ConfirmModal from '../components/ConfirmModal';
import { motion, AnimatePresence } from "framer-motion";
import { java } from '@codemirror/lang-java';

/*
    - codeMirror 를 사용하기 위해 3 개의 package 가 설치되어 있어야 한다<div className=""></div>
    npm install @uiw/react-codemirror @codemirror/lang-javascript @uiw/codemirror-theme-dracula 

    - MarkDown 을 사용하기 위해서 아래의 package 가 설치 되어 있어야 한다. 
    npm install react-markdown

    - MarkDown 을 출력할 때 code 를 이쁘게 출력하기 위한 package
    npm install rehype-highlight

    - transition 또는 animation 을 화면 전환할 때 사용하기 위한 package
    npm install framer-motion


*/

function Quiz(){
    const quizs = [
        { content: "1부터 10까지 숫자를 콘솔에 출력하는 JavaScript 코드를 작성하세요.", score: 10 },
        { content: "변수 `name`에 본인의 이름을 저장하는 코드를 작성하세요.", score: 10 },
        { content: "`num1`과 `num2` 두 숫자의 합을 구해서 출력하는 코드를 작성하세요.", score: 10 },
        { content: "`for` 문을 사용하여 1부터 5까지의 합을 계산하는 코드를 작성하세요.", score: 10 },
        { content: "`if`문을 사용하여 어떤 숫자가 짝수인지 홀수인지 출력하는 코드를 작성하세요.", score: 10 },
        { content: "객체 `person`을 만들고, 그 안에 `name`, `age` 속성을 추가해 보세요.", score: 10 },
        { content: "배열 `[1, 2, 3, 4, 5]`의 모든 요소를 순회하며 출력하는 코드를 작성하세요.", score: 10 },
        { content: "`function` 키워드를 사용해서 두 수를 곱하는 함수를 작성하세요.", score: 10 },
        { content: "`setTimeout`을 사용해서 3초 후에 'Hello'를 출력하는 코드를 작성하세요.", score: 10 },
        { content: "현재 날짜와 시간을 콘솔에 출력하는 코드를 작성하세요.", score: 10 }
      ];

    // 상태값 관리
    const [state, setState] = useState({
        isFinish:false,
        progress:0,
        list:[],
        index:0, //문제의 index 값 state 로 관리 
        isAnswered:false,
        isCorrect:false,
        inputCode:"" //입력한 code 를 state 로 관리  
    });

    // 모달의 상태값 제어어
    const [modal, setModal] = useState({
        show:false,
        message:""
    });


    const navigate = useNavigate();

    useEffect(()=>{
        //DB 에서 불러온 데이터를 state 에 넣어준다.
        setState({
            ...state,
            list:quizs.map(item=>{
                // isCorrect 라는 키값으로 null 을 넣어준다.
                item.isCorrect = null;
                return item;
            })
        })
    }, []);
    
    const handleSubmit = ()=>{
        //질문과 입력한 답을 json 으로 전송한다.
        api.post("/gemini/quiz", {
            quiz:state.list[state.index].content,
            answer:state.inputCode //state 에 있는 내용을 전송한다 
        })
        .then(res=>{
            // res.data 는 이런 모양의 object 이다 {isCorrect:true or false, comment:"마크다운"}
            console.log(res.data);
            setState({
                ...state,
                ...res.data,
                isAnswered:true,
                list:state.list.map((item, index)=>{
                    // 만일 item 의 index 가 현재 문제를 푼 index 라면
                    if(index === state.index){
                        // 체점 결과를 넣어준다.
                        item.isCorrect = res.data.isCorrect;
                    } 
                    return item;
                }),
                progress: state.progress + state.list[state.index].score,
                isFinish: state.index === state.list.length -1
            })
        })
        .catch(error=>console.log(error));



    }


    //다시 풀기 버튼을 눌렀을때 실행되는 함수
    const handleRetry = ()=>{
        setState({
            ...state, 
            isAnswered:false
        });
    }

    // 다음 문제 버튼 눌렀을 때
    const handleNext = ()=>{
       //문제의 index 1 증가, isAnswered : false, inputCode:""
       setState({
            ...state,
            index:state.index+1,
            isAnswered:false,
            inputCode:""
       });
    }

    // 결과보기 버튼을 눌렀을 때
    const handleFinish = ()=>{

        // 총점 계산하기
        let totalScore = 0;
        for(let i = 0 ; i < state.list.length ; i++){
            // i 번째 item 을 불러와서
            const item = state.list[i];  
            // 만일 정답을 맞추었으면 totalScore 에 획득한 점수 누적   
            if(item.isCorrect) totalScore += item.score;
        }

        // 총점 계산하기 -Reduce 함수 사용
        const totalScore2 = state.list.reduce((sum, item)=>{
            if(item.isCorrect){
                return sum+item.score;
            } else {
                return sum;
            }
        }, 0);
        /*  reduce
            이 함수는 배열의 방 개수 만큼 호출된다. 
            item 에는 배열의 각 아이템이 순서대로 전달되고,
            sum 에는 함수 안에서 리턴한 값이 전달된다.
            최초 호출 시 초기값이 전달된다.
            0 은 최초 호출시 초기값이다.
            
            결국 가장 마지막에 리턴한 값으로 reducer 함수에 값이 리턴된다.

            reduce(함수, 초기값)
         */

        // 한 줄로 표현하면면
        const totalScore3 = state.list.reduce((sum,item)=>item.isCorrect?sum+item.score:sum,0);

        // 결국 reduce 는 
        // 배열에 저장된 모든 아이템을 활용해서 하나의 결과 값을 얻어낸다.
        // 그래서 reduce 임임

        setModal({
            show:true,
            message: `당신의 점수는 ${totalScore2} 점 입니다. 확인을 누르면 다시 풀기, 취소를 누르면 종료 됩니다.`
        })
    };

    const handleYes = ()=>{
        setState({
            isFinish:false,
            progress:0,
            list:quizs.map(item=>{
                item.isCorrect = null;
                return item;
            }),
            index:0,
            isAnswered:false,
            isCorrect:false,
            inputCode:""
        });
        setModal({show:false});
    };

    const handleCancle = ()=>{
        setModal({show:false});
        navigate("/");
    };

    return (
        <>  
           

            <ConfirmModal show={modal.show} message={modal.message} onYes={handleYes} onCancel={handleCancle}/>

            {/* pre 요소는 tab 과 공백을 모두 해석해서 뿌린다. */}
            {/* 숫자 2는 들여쓰기 2 칸으로 셋팅함 */}
            {/* <pre><div>{JSON.stringify(state, null, 2)}</div></pre> */}
            <h1> javascript 문제</h1>
            
            {/* label={`${(((state.index+1)/10)*100)}%`} */}
            <ProgressBar>
                {
                    state.list.map(item=> item.isCorrect !== null &&
                        <ProgressBar now={item.score} animated
                        variant={item.isCorrect ? 'success' : 'danger'}/>
                    )
                }
            </ProgressBar>

            <AnimatePresence mode="popLayout">
                {/* sync : 등장과 사라짐이 동시에
                    wait : 등장과 사라짐이 기다렸다 나타남
                    popLayout : 위 두 개가 섞인 느낌이넹

                    * 사용법은 Framer Motion 싸이트에서 확인할 수 있다 (https://motion.dev/)
                */}
            {state.isAnswered ? (
                <motion.p
                key="p1"
                initial={{ opacity: 0, y: 20 }} // 시작 상태
                animate={{ opacity: 1, y: 0 }}  // 끝 상태
                exit={{ opacity: 0, y: -20 }}   // 제거 상태 (위쪽이 -, 아래쪽이 +)
                transition={{ duration: 0.2 }}
                >
                <div>
                    <h3>체점 결과</h3>
                    { state.isCorrect ?
                        <Alert variant='success' >축하 합니다 정답 입니다</Alert>
                        :
                        <Alert variant='danger' >오답 입니다</Alert>
                    }
                    <MarkDown rehypePlugins={rehypeHighlight}>{state.comment}</MarkDown>
                    <Button onClick={handleRetry} variant='warning' className="me-3"> &larr; 다시 풀기</Button>
                    { state.isFinish ?
                        <Button onClick={handleFinish} variant='primary'>결과 보기</Button>
                    :
                        <Button onClick={handleNext} variant='success'>다음 문제 &rarr;</Button>
                    }
                    
                </div>
                </motion.p>
            ) 
            :
            state.list.length > 0 &&
             (
                <motion.p
                key="p2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                >
                
                <div>
                    <div>
                        <strong>{`${state.index+1}. 번 `}</strong> 
                        <strong>{`배점:${state.list[state.index].score}`}</strong>
                        <MarkDown rehypePlugins={rehypeHighlight}>{ state.list[state.index].content}</MarkDown>
                    </div>
                    <CodeMirror style={{fontSize:"20px"}}
                        extensions={[javascript()]}   
                            // java 로 사용하고 싶다면 npm install codemirror/lang-java 설치 후
                            // 해당 패키지로부터 import 받아 java 로 이름 짓고 
                            // 여기에 사용한다.
                        theme={dracula}
                        height='300px'
                        value={state.inputCode}
                        onChange={value => setState({...state, inputCode:value})}/>
                            {/* readOnly 속성을 추가하면 편집 용도가 아닌 출력 용도로만 사용할 수 있다. */}
                    <Button onClick={handleSubmit} >제출</Button>
                </div>
                </motion.p>
            )}
            </AnimatePresence>

{/*             
            { state.isAnswered ? 
                <div>
                    <h3>체점 결과</h3>
                    { state.isCorrect ?
                        <Alert variant='success' >축하 합니다 정답 입니다</Alert>
                        :
                        <Alert variant='danger' >오답 입니다</Alert>
                    }
                    <MarkDown rehypePlugins={rehypeHighlight}>{state.comment}</MarkDown>
                    <Button onClick={handleRetry} variant='warning' className="me-3"> &larr; 다시 풀기</Button>
                    { state.isFinish ?
                        <Button onClick={handleFinish} variant='primary'>결과 보기</Button>
                    :
                        <Button onClick={handleNext} variant='success'>다음 문제 &rarr;</Button>
                    }
                    
                </div>
            :
                state.list.length > 0 &&
                <div>
                    <div>
                        <strong>{`${state.index+1}. 번 `}</strong> 
                        <strong>{`배점:${state.list[state.index].score}`}</strong>
                        <MarkDown rehypePlugins={rehypeHighlight}>{ state.list[state.index].content}</MarkDown>
                    </div>
                    <CodeMirror style={{fontSize:"20px"}}
                        extensions={[javascript()]}
                        theme={dracula}
                        height='300px'
                        value={state.inputCode}
                        onChange={value => setState({...state, inputCode:value})}/>
                    <Button onClick={handleSubmit} >제출</Button>
                </div>

            } */}
        </>
    )
}

export default Quiz;