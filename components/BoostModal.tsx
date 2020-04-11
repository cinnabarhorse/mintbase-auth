import React from "react";
import Modal from 'react-bootstrap/Modal'
import { useStateValue } from '../State/globalState'
import { Speaker, BoostStatus } from "../types";

import Lottie from 'react-lottie';
import animationData from '../animations/rocket.json'
import { remainingBoosts } from "../functions";
import { themeColor } from "../theme";

interface BoostModalProps {
    speakerObject: Speaker
    handleConfirmBoost: () => void
    boostStatus: BoostStatus
    total: number
}

const BoostModal = (props: BoostModalProps) => {

    const { speakerObject, handleConfirmBoost, boostStatus, total } = props
    const [{ showBoostModal, tokenVotes }, dispatch] = useStateValue()

    const defaultOptions = {
        loop: true,
        autoplay: true,
        animationData: animationData,
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice'
        }
    };

    return (
        <Modal
            show={showBoostModal}
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

                    .lottieContainer {
                        width:90px;
                        height:25px;
                        display:flex;
                        justify-content:center;
                        align-items:center;
                        background:white;
                        padding:15px;
                      
                        border-radius:100px;
                        
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
                        background:${themeColor};
                        border:none;
                        color:white;
                        transition: background 0.2s, color 0.2s, box-shadow 0.2s;

                    }

                    .boost:hover {
                        box-shadow:0 2px 4px 0 rgba(136,144,195,0.2), 0 5px 15px 0 rgba(37,44,97,0.3);
                    }
                `}
            </style>



            <Modal.Header closeButton onClick={() => dispatch({
                type: "updateShowBoostModal",
                showBoostModal: false
            })}>
                <Modal.Title style={{ display: 'flex', flex: 1, justifyContent: 'center', fontWeight: 800, textAlign: 'center' }} id="contained-modal-title-vcenter">

                    {boostStatus === "boosting" &&
                        <div style={{ display: 'flex', flexDirection: 'row' }}>
                            Boosting {speakerObject.fname} {speakerObject.lname}


                            <div className="lottieContainer">
                                <Lottie options={defaultOptions}
                                    height={40}
                                    width={90}
                                    isStopped={false}
                                    isPaused={false} />
                            </div>



                        </div>
                    }

                    {boostStatus === "complete" &&
                        <div>Boost complete!</div>
                    }

                    {!boostStatus &&
                        <div>Boost {speakerObject.fname} {speakerObject.lname}?</div>
                    }


                </Modal.Title>

            </Modal.Header>

            <Modal.Body>
                <div className="bodyContainer">
                    <img className="profilePic" src={speakerObject.profilePic} />
                </div>


                {!boostStatus &&
                    <div className="buttonContainer">
                        <button onClick={() => {
                            dispatch({
                                type: 'updateShowBoostModal',
                                showBoostModal: false
                            })
                        }} className="notNow">Not Now</button>
                        <button onClick={() => handleConfirmBoost()} className="boost">Boost!</button>
                    </div>
                }

                {boostStatus === "boosting" &&
                    <div className="buttonContainer">
                        Boost Amount: 1
                </div>
                }

                {boostStatus === "complete" &&
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                        <div style={{ marginTop: 20 }}>New total: {total} </div>
                        <div style={{ marginTop: 20 }}>You have {remainingBoosts(tokenVotes)} boosts left.  </div>
                        <button onClick={() => {
                            dispatch({
                                type: 'updateShowBoostModal',
                                showBoostModal: false
                            })
                        }}> Close</button>
                    </div>
                }

            </Modal.Body>

        </Modal >
    );
}
export default BoostModal;