import Layout from '../components/Layout'
import { withApollo } from '../lib/apollo'
import loadFirebase from '../firebase';
import { useState, useEffect } from 'react';
import { snapshotToArray, remainingBoosts } from '../functions'
import { useQuery } from '@apollo/react-hooks';
import { HAS_THING_FROM_STORE } from '../queries';
import { useStateValue } from '../State/globalState'
import { Speaker, TokenId, Boost } from '../types'
import Container from 'react-bootstrap/Container'
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import BoostModal from '../components/BoostModal';
import AuthModal from '../components/AuthModal';

import CantBoostModal from '../components/CantBoostModal';

import Lottie from 'react-lottie';
import animationData from '../animations/inifinite.json'
import { MintbaseIcon } from '../icons';
import NextReusableHead from '../components/NextReusableHead';



const IndexPage = () => {

  const [{ showBoostModal, speakers, userInfo, tokens, tokenVotes, showAuthModal, showCantBoostModal, currentAccount, globalWeb3 }, dispatch] = useStateValue()

  const [boostStatus, setBoostStatus] = useState<undefined | "boosting" | "complete">()

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice'
    }
  };

  //Necessary because of Firebase RT updates
  const [totalCount, setTotalCount] = useState(undefined)

  //Current speaker object
  const [selectedSpeaker, setSelectedSpeaker] = useState<Speaker>(undefined)
  const [loadingSpeakers, setLoadingSpeakers] = useState(true)


  //The variables for our store on Mintbase
  const allPostsQueryVars = {
    ownerId: currentAccount ? currentAccount.toLowerCase() : "",
    metaId: "m4NDqqsZP8iE2M1csDhe",
    storeId: "0x965c51e9368cff73f6b374debadce4162f73e99c".toLowerCase()
  }

  const { error, data, } = useQuery(
    HAS_THING_FROM_STORE,
    {
      variables: allPostsQueryVars,
      skip: !currentAccount ? true : false,
      notifyOnNetworkStatusChange: true,
    },
  )

  /*

  HOW THIS APP WORKS

  1. User signs in using Metamask or Fortmatic
  2. useQuery fetches all tokens from wallet using TheGraph
  3. useEffect extracts ids and puts 3 votes into userVotes array
  4. For each token, fetch all the votes associated with that tokenId from db and store in votes array.
  4. Iterate through votes array and remove items from Tokens array to create tokenVotes array — should be left with an array of all remaining votes
  5. Use tokenVotes[0] to set tokenId of boost object.
  6. After boosting, refetch votes object and repeat cycle. 
  */

  useEffect(() => {

    if (!data) return
    if (data.tokens.length > 0) {

      const allTokens: TokenId[] = data.tokens

      dispatch({
        type: 'updateTokens',
        tokens: allTokens
      })


      if (!tokenVotes) {
        setUserVotes(allTokens)
      }

    }
    else {
      dispatch({
        type: 'updateTokens',
        tokens: []
      })

    }
  }, [data])

  useEffect(() => {
    loadSpeakers()
  }, [])


  /*
  Loads all speakers from Firebase
  */
  async function loadSpeakers() {


    const firebase = await loadFirebase()

    firebase.firestore().collection("speakers")
      .orderBy("score", "desc")
      .limit(6)
      .onSnapshot((snapshotArray) => {

        if (!snapshotArray.empty) {

          dispatch({
            type: 'updateSpeakers',
            speakers: snapshotToArray(snapshotArray)
          })
          setLoadingSpeakers(false)

        }
        else {
          setLoadingSpeakers(false)
          dispatch({
            type: 'updateSpeakers',
            speakers: []
          })
        }
      })


  }

  /*
  First adds three votes per token owned by user, then removes after loading all votes from Firebase backend. 
  */
  async function setUserVotes(tokens: TokenId[]) {

    var tokensEnumerated = []

    tokens.forEach((token: TokenId) => {
      //Repeat three times because each token has three votes
      tokensEnumerated.push(token.id)
      tokensEnumerated.push(token.id)
      tokensEnumerated.push(token.id)
    });

    const votes = await loadVotesForTokens(tokens)

    votes.forEach((vote: TokenId) => {
      const index = tokensEnumerated.indexOf(vote.id)
      tokensEnumerated.splice(index, 1)
    });

    console.log('after removing:', tokensEnumerated)

    dispatch({
      type: "updateTokenVotes",
      tokenVotes: tokensEnumerated
    })




  }

  async function loadVotesForTokens(tokens: TokenId[]) {

    const firebase = await loadFirebase()
    const allVotes = await Promise.all((tokens.map(async (token: TokenId) => {

      return await firebase.firestore().collection("boosts").where("tokenId", "==", token.id).get()
        .then((snapshot) => {
          return snapshotToArray(snapshot)
        })
        .catch((err) => {
          console.log('err:', err)
        })

    })))

    //Enumerate all the votes into one array
    var allVotesEnumerated = []

    allVotes.forEach((boostArray: Boost[]) => {
      boostArray.forEach((boost: Boost) => {
        allVotesEnumerated.push(boost.tokenId)
      });
    });

    return allVotesEnumerated



  }


  /*
  Verify that the user can vote. 
  */
  function handleBoost(speaker: Speaker) {

    var remaining = remainingBoosts(tokenVotes)

    if (currentAccount && remaining > 0) {
      dispatch({
        type: "updateShowBoostModal",
        showBoostModal: true
      })

      setBoostStatus(undefined)
      setSelectedSpeaker(speaker)
    }

    else if (currentAccount && remaining === 0) {
      dispatch({
        type: "updateShowCantBoostModal",
        showCantBoostModal: true
      })
    }

    else {
      dispatch({
        type: 'updateShowAuthModal',
        showAuthModal: true
      })
    }
  }

  /*
First ask user to sign transaction using wallet, then add to db. 
  */
  async function handleConfirmBoost() {

    const speaker: Speaker = selectedSpeaker


    globalWeb3.eth.personal.sign(`Sign this transaction to boost ${speaker.fname} ${speaker.lname} `, currentAccount, async function (err, res) {
      if (err) console.error(err);
      const tokenId = tokenVotes[0]
      console.log('token id:', tokenId)

      setBoostStatus("boosting")
      dispatch({
        type: "updateShowBoostModal",
        showBoostModal: true
      })


      const firebase = await loadFirebase()

      const newVotes = [...userInfo.votes, speaker.key]

      //Use batch transaction to update users, speakers, and boosts atomically
      const batch = firebase.firestore().batch()
      const userRef = firebase.firestore().collection("users").doc(currentAccount)
      const speakerRef = firebase.firestore().collection("speakers").doc(speaker.key)
      const boostRef = firebase.firestore().collection("boosts").doc()
      const increment = firebase.firestore.FieldValue.increment(1)

      batch.update(userRef, {
        votes: newVotes
      })

      batch.update(speakerRef, {
        score: increment
      })

      batch.set(boostRef, {
        by: currentAccount,
        speaker: speaker.key,
        amount: 1,
        tokenId: tokenId,
        timestamp: firebase.firestore.Timestamp.now(),
      })



      /*
      Set a 1.5s timeout to make user feel like something is happening.
      */
      setTimeout(() => {
        batch.commit()
          .then(() => {

            setUserVotes(tokens)
            setTotalCount(speaker.score + 1)
            setBoostStatus("complete")

          })
          .catch((err) => {
            console.log('err:', err)
          })
      }, 1500);
    })




  }

  return (
    <Layout>

      <NextReusableHead
        title="DappCon 2020 Vote Demo"
        description="DappCon2020 Vote Demo -- powered by Mintbase. Created by @coderdannn"
        siteName="DappCon 2020 Vote Demo"
        url="https://mintbase-auth.now.sh"
        faviconPath="/favicon.ico"
      />

      <Container>
        <Row>

          <Col>


            <div className="testing">
              For testing only
          </div>

            <div className="headerDesc">
              Connect a wallet containing the DappCon 2020 NFT to boost your favorite speakers. Each NFT ticket can boost three times.
          </div>

            <div className="poweredBy">
              <span style={{ marginRight: 10 }}>{MintbaseIcon(30)}</span>
              <span>Powered by <a target="_blank" href="https://mintbase.io">Mintbase</a></span>

            </div>
          </Col>
        </Row>

        <Row>
          <div className="allSpeakers">

            {!speakers && loadingSpeakers &&

              <div className="lottieContainer">
                <Lottie options={defaultOptions}
                  height={120}
                  width={270}
                  isStopped={false}
                  isPaused={false} />
              </div>
            }

            {speakers && speakers.map((speaker: Speaker, index) => {

              return (
                <Col key={index} xl={4} lg={4} md={6} sm={6} xs={12}>
                  <div className="speakerContainer">
                    <span className="speakerFName">{speaker.fname} </span>
                    <span className="speakerLName">{speaker.lname}</span>
                    <img className="speakerPic" src={speaker.profilePic} />

                    <div className="boostContainer">
                      <div className="score">
                        {speaker.score}
                      </div>


                      <button onClick={() => handleBoost(speaker)} className="boostButton">🚀 Boost</button>

                    </div>
                  </div>

                </Col>

              )
            })}
          </div>

        </Row>
      </Container>

      {showBoostModal && selectedSpeaker &&
        <BoostModal
          boostStatus={boostStatus}
          handleConfirmBoost={() => handleConfirmBoost()}
          speakerObject={selectedSpeaker}
          total={totalCount ? totalCount : selectedSpeaker.score}

        />
      }

      {showAuthModal &&
        <AuthModal />
      }

      {showCantBoostModal &&
        <CantBoostModal />
      }


      <footer>
        Created with ❤️ by <a target="_blank" className="footerLink" href="https://twitter.com/@coderdannn">@coderdannn</a>
      </footer>


      <style jsx>
        {`

        .testing {
          color:#C2FF48;
          font-size:21px;
          text-transform:uppercase;
          line-spacing:1.2px;
        }

        .headerDesc {
       
          width:100%;
          padding:25px;
          text-align:center;
          font-size:21px;
          color:black;
          margin-top:15px;
          margin-bottom:15px;
        }

        .poweredBy {
          text-align:center;
          width:100%;
          display:flex;
          align-items:center;
          justify-content:center;
        }

        .allSpeakers {
          display:flex;
          flex-wrap:wrap;
          width:100%;
        }

        .lottieContainer {
          margin-top:30px;
          height:1000px;
          width:100%;
        }

        .speakerContainer {
          width:100%;
          padding:30px;
          display:flex;
          flex-direction:column;
          
          margin-bottom:40px;
          align-items:center;
        }
        
        .speakerFName {
          color:white;
          font-size:24px;
        padding-top:10px;
          text-align:center;
          font-weight:800;
        }

        .speakerLName {
          color:white;
          font-size:24px;
         font-weight:800;
          padding-bottom:10px;
          text-align:center;
        }

        .speakerPic {
          width:100%;
          height:100%;
        }

        .boostContainer {
          margin-top:15px;
          width:100%;
          display:flex;
          flex-direction:row;
        }

        .score {
          justify-content:center;
          display:flex;
          flex:1;
          font-size:32px;
          color:white;
          margin-right:15px;
        }

        .boostButton {
          flex-direction:row;
          width:180px;
          color:black;
          justify-content:center;
          display:flex;
          flex:1;
          background-color:none;
          background:none;
          border:solid 2px black;
          transition: color 0.2s, background 0.2s;
        }

        .boostButton:hover {
          background:black;
          color:white;
        }

        footer {
          height:60px;
          background:black;
          color:white;
          display:flex;
          justify-content:center;
          align-items:center;
        }

        .footerLink {
          margin-left: 10px;
          color: white;
          transition:color 0.2s;
        }

        .footerLink:hover {
          color: #22bad9;
        }

        @media screen and (max-width:768px) {

          .headerDesc {
            font-size:18px;
            padding-left:25px;
            padding-right:25px;
            margin-top:10px;
            width:100%;
  
          }
         
        }

        .
      `}
      </style>


    </Layout>
  )

}


export default withApollo({ ssr: true })(IndexPage)
