import Layout from '../components/Layout'
import Header from '../components/Header'
import { withApollo } from '../lib/apollo'
import loadFirebase from '../firebase';
import { useState, useEffect } from 'react';
import { snapshotToArray, remainingBoosts } from '../functions'
import { useQuery } from '@apollo/react-hooks';
import { HAS_THING_FROM_STORE } from '../queries';
import { useStateValue } from '../State/globalState'
import { Store, Thing, Speaker, UserInfo, Token, TokenId, Boost } from '../types'
import Container from 'react-bootstrap/Container'
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import BoostModal from '../components/BoostModal';
import AuthModal from '../components/AuthModal';
import getWeb3 from '../web3/getWeb3';

import Fortmatic from 'fortmatic'
import Web3 from 'web3'
import CantBoostModal from '../components/CantBoostModal';



const IndexPage = () => {

  const [{ showBoostModal, speakers, userInfo, tokens, tokenVotes, showAuthModal, showCantBoostModal, currentAccount, globalWeb3 }, dispatch] = useStateValue()

  const [boostStatus, setBoostStatus] = useState<undefined | "boosting" | "complete">()


  //Necessary because of Firebase RT updates
  const [totalCount, setTotalCount] = useState(undefined)

  const [selectedSpeaker, setSelectedSpeaker] = useState<Speaker>(undefined)

  const allPostsQueryVars = {
    ownerId: "0xC3c2e1Cf099Bc6e1fA94ce358562BCbD5cc59FE5".toLowerCase(),
    metaId: "PXZw3LzsUoj0udlGg8TK",
    storeId: "0x5c27dde1e78382bb01859151efb4d50e2c55e633".toLowerCase()
  }

  const { loading, error, data, fetchMore, networkStatus } = useQuery(
    HAS_THING_FROM_STORE,
    {
      variables: allPostsQueryVars,
      skip: !currentAccount ? true : false,
      // Setting this value to true will make the component rerender when
      // the "networkStatus" changes, so we are able to know if it is fetching
      // more data
      notifyOnNetworkStatusChange: true,
    },
  )

  console.log('current wallet:', currentAccount)

  console.log('error:', error)
  console.log('data:', data)


  /*

  1. User signs in with wallet
  2. useQuery fetches all tokens from wallet, extracts ids and puts into Tokens array
  3. For each token, fetch all the votes associated with that tokenId from db and store in votes array.
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

  async function loadSpeakers() {
    const firebase = await loadFirebase()

    firebase.firestore().collection("speakers")
      .orderBy("score", "desc")
      .limit(6)
      .onSnapshot((snapshotArray) => {

        console.log('snapshot:', snapshotArray)

        if (!snapshotArray.empty) {

          dispatch({
            type: 'updateSpeakers',
            speakers: snapshotToArray(snapshotArray)
          })

        }
        else {
          dispatch({
            type: 'updateSpeakers',
            speakers: []
          })
        }
      })


  }


  async function setUserVotes(tokens: TokenId[]) {

    var tokensEnumerated = []

    tokens.forEach((token: TokenId) => {
      //Repeat three times because each token has three votes
      tokensEnumerated.push(token.id)
      tokensEnumerated.push(token.id)
      tokensEnumerated.push(token.id)
    });

    console.log('tokens enumerated:', tokensEnumerated)

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

      console.log('token:', token)
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

    /*   dispatch({
         type: "updateTokenVotes",
         tokenVotes: allVotesEnumerated
       })
       */


    return allVotesEnumerated

    console.log('all votes:', allVotesEnumerated)

  }


  const boostIcons = [
    "⚡", "🚀", "🦄", "👍", "🔥", "🌶"
  ]

  function handleBoost(speaker: Speaker) {

    var remaining = remainingBoosts(tokenVotes)

    //Each user can only vote three times
    if (remaining > 0) {
      dispatch({
        type: "updateShowBoostModal",
        showBoostModal: true
      })

      setBoostStatus(undefined)
      setSelectedSpeaker(speaker)
    }

    else if (remaining === 0) {
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

  async function handleConfirmBoost() {

    console.log('globalweb:', globalWeb3)

    const speaker: Speaker = selectedSpeaker


    globalWeb3.eth.personal.sign(`Sign this transaction to boost ${speaker.fname} ${speaker.lname} `, currentAccount, async function (err, res) {
      if (err) console.error(err);

      console.log('res:', res)

      console.log('tokens:', tokenVotes)

      const tokenId = tokenVotes[0]

      console.log('token id:', tokenId)

      setBoostStatus("boosting")
      dispatch({
        type: "updateShowBoostModal",
        showBoostModal: true
      })


      const firebase = await loadFirebase()

      const newVotes = [...userInfo.votes, speaker.key]

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



      setTimeout(() => {
        batch.commit()
          .then((result) => {

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

  async function handleConnectFortmatic() {
    let fm = new Fortmatic('pk_test_B086452452BE45F2');
    //@ts-ignore
    let web3 = new Web3(fm.getProvider());

    const accounts = await web3.eth.getAccounts()

    if (accounts && accounts.length > 0) {
      console.log('account:', accounts[0])

      await signInWithFirebase(accounts[0])

      dispatch({
        type: "updateCurrentAccount",
        currentAccount: accounts[0]
      })

      dispatch({
        type: "updateWeb3",
        globalWeb3: web3
      })

      dispatch({
        type: 'updateShowAuthModal',
        showAuthModal: false
      })
    }

  }

  async function handleConnectMetamask() {
    console.log('connect!')
    const web3 = await getWeb3()

    console.log('web3:', web3)
    const accounts = await web3.web3.eth.getAccounts()

    if (accounts.length > 0) {
      await signInWithFirebase(accounts[0])

      dispatch({
        type: "updateWeb3",
        globalWeb3: web3.web3
      })

      dispatch({
        type: "updateShowAuthModal",
        showAuthModal: false
      })

      dispatch({
        type: 'updateCurrentAccount',
        currentAccount: accounts[0]
      })
    }


  }

  async function signInWithFirebase(account: string) {
    const firebase = await loadFirebase()
    firebase.auth().signInAnonymously()
      .then(async (result) => {

        //Add anonymous user with wallet address as key

        firebase.firestore().collection("users").doc(account).onSnapshot((snapshot) => {
          if (snapshot.exists) {

            console.log('data:', snapshot.data())

            dispatch({
              type: "updateUserInfo",
              userInfo: {
                id: account,
                votes: snapshot.data()!.votes
              }
            })
          }

          //Doesn't exist, add new user
          else {
            firebase.firestore().collection("users").doc(account).set({
              votes: []
            })
              .then(() => {
                dispatch({
                  type: "updateUserInfo",
                  userInfo: {
                    id: account,
                    votes: []
                  }
                })
              })



            console.log('result:', result)
          }

        })

        //Already exists, just load data


      })
      .catch(function (error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // ...
        console.log('error:', error)
      });
  }

  return (
    <Layout>

      <style jsx>
        {`

        .headerDesc {
       
          font-size:21px;
          color:black;
          width:70%;
          margin:15px;
        }

        .allSpeakers {
          display:flex;
          flex-wrap:wrap;
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

      {/*} <Header /> */}

      <Container>

        <Row>


          <div className="headerDesc">
            Connect a wallet containing the DappCon 2020 NFT to boost your favorite speakers. Each NFT ticket can boost three times.
</div>


          <div className="allSpeakers">


            {speakers && speakers.map((speaker: Speaker, index) => {

              return (
                <Col xl={4} lg={4} md={6} sm={6} xs={12}>
                  <div className="speakerContainer">
                    <span className="speakerFName">{speaker.fname} </span>
                    <span className="speakerLName">{speaker.lname}</span>
                    <img className="speakerPic" src={speaker.profilePic} />

                    <div className="boostContainer">
                      <div className="score">
                        {speaker.score}
                      </div>


                      <button onClick={() => handleBoost(speaker)} className="boostButton">{boostIcons[1]} Boost</button>

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
        <AuthModal
          handleConnectMetamask={() => handleConnectMetamask()}
          handleConnectFortmatic={() => handleConnectFortmatic()} />
      }

      {showCantBoostModal &&
        <CantBoostModal />
      }


    </Layout>
  )

}

export default withApollo({ ssr: true })(IndexPage)
