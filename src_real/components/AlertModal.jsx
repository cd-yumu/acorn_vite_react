// arc/components/AlertModal.jsx

import React from 'react';
import { Button, Modal } from 'react-bootstrap';


//function AlertModal(props) { -> 기존의 props 를 구조 분해 할당해 받는다.
/*
    show: Modal 을 띄울지 여부                          (boolean)
    message: Modal 메시지                               (string)
    onYes: Modal 의 확인 버튼을 눌렀을때 호출될 함수    (function)
*/
function AlertModal({show, message, onYes}) {
    return (
        <>
            <Modal show={show}>
                <Modal.Header>Alert</Modal.Header>
                <Modal.Body>
                    {message}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant='success' onClick={onYes}>OK</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default AlertModal;