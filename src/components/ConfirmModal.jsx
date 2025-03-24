// src/components/ComfirmModal.jsx
import React from 'react';
import { Button, Modal, ModalBody } from 'react-bootstrap';

function ConfirmModal({show, message, onYes, onCancel}) {
    return (
        <>
            <Modal show={show}>
                <Modal.Header>Alert</Modal.Header>
                <ModalBody>
                    {message}
                </ModalBody>
                <Modal.Footer>
                    <Button onClick={onYes} variant='success'>OK</Button>
                    <Button onClick={onCancel} variant='warning'>Cancel</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default ConfirmModal;