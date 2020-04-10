import React from "react";
import Modal from 'react-bootstrap/Modal'
import { useStateValue } from '../State/globalState'


interface AuthModalProps {
    handleConnectMetamask: () => void
    handleConnectFortmatic: () => void
}

const AuthModal = (props: AuthModalProps) => {

    const { handleConnectFortmatic, handleConnectMetamask } = props

    const [{ showAuthModal }, dispatch] = useStateValue()

    return (
        <Modal
            show={showAuthModal}
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
                type: "updateShowAuthModal",
                showAuthModal: false
            })}>
                <Modal.Title style={{ display: 'flex', flex: 1, justifyContent: 'center', fontWeight: 800, textAlign: 'center' }} id="contained-modal-title-vcenter">
                    Connect Wallet to Vote
                </Modal.Title>

            </Modal.Header>

            <Modal.Body>


                <div className="buttonContainer">
                    <button onClick={() => {
                        handleConnectMetamask()
                    }} className="notNow">Metamask</button>
                    <button onClick={() => {
                        handleConnectFortmatic()
                    }} className="boost">Fortmatic</button>
                </div>

            </Modal.Body>

        </Modal>
    );
}
export default AuthModal;