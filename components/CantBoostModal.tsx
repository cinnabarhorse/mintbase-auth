import React from "react";
import Modal from 'react-bootstrap/Modal'
import { useStateValue } from '../State/globalState'


const CantBoostModal = () => {

    const [{ showCantBoostModal }, dispatch] = useStateValue()

    return (
        <Modal
            show={showCantBoostModal}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
        >

            <style jsx>
                {`
                    .bodyContainer {
                        display:flex;
                        width:100%;
                        justify-content:center;
                    }

                    .profilePic {
                        width:150px;
                        height:150px;
                        border-radius:10px;
                    }

                    .buttonContainer {
                        display:flex;
                        justify-content:center;
                        flex-direction:row;
                        margin:15px;
                    }

                    button {
                        display:flex;
                        justify-content:center;
                        width:150px;
                        height:60px;
                       margin:20px;
                       font-weight:800;
                    }

                    .notNow {
                        background:none;
                        border:solid 4px black;
                        color:black;
                        transition: background 0.2s, color 0.2s;
                    }
                    .notNow:hover {
                        background:black;
                        color:white;
                    }

                    .boost {
                        background:#FC2E53;
                        border:none;
                        color:white;
                        transition: background 0.2s, color 0.2s;
                    }

                    .boost:hover {
                        background:red;
                        
                    }
                `}
            </style>



            <Modal.Header closeButton onClick={() => dispatch({
                type: "updateShowCantBoostModal",
                showCantBoostModal: false
            })}>
                <Modal.Title style={{ display: 'flex', flex: 1, justifyContent: 'center', fontWeight: 800, textAlign: 'center' }} id="contained-modal-title-vcenter">
                    Uh oh! 😱
                </Modal.Title>

            </Modal.Header>

            <Modal.Body>

                <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                    <div style={{ fontSize: '21px', margin: 15 }}>
                        You already boosted three speakers!
                    </div>

                </div>




            </Modal.Body>

        </Modal>
    );
}
export default CantBoostModal;