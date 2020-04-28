
import React, { useEffect } from 'react'
import { useStateValue } from '../State/globalState'

import Jazzicon, { jsNumberForAddress } from 'react-jazzicon'
import Dropdown from 'react-bootstrap/Dropdown'
import { remainingBoosts } from '../functions'
import { themeColor } from '../theme'
import loadFirebase from '../firebase'
import { DappCon2020 } from '../icons'



const Header = () => {

  const [{ currentAccount, currentNetwork, userInfo, tokens, tokenVotes }, dispatch] = useStateValue()


  useEffect(() => {

    //@ts-ignore
    if (window.ethereum) {
      //@ts-ignore
      window.ethereum.on('accountsChanged', function (accounts) {
        // Time to reload your interface with accounts[0]!
        logout()
      })

      //@ts-ignore
      window.ethereum.on('networkChanged', function (netId) {
        // Time to reload your interface with netId
        logout()
      })
    }
    //@ts-ignore

  }, [])


  async function logout() {

    const firebase = await loadFirebase()

    try {

      await firebase.auth().signOut()



      dispatch({
        type: "updateCurrentAccount",
        currentAccount: undefined
      })

      dispatch({
        type: "updateUserInfo",
        userInfo: undefined
      })

      dispatch({
        type: "updateTokenVotes",
        tokenVotes: undefined
      })

    } catch (error) {
      alert(error)
    }




  }

  return (

    <div className="headerContainer">

      <style jsx>{`
     

      .headerContainer {
       
          position: sticky;
          position: -webkit-sticky;
          position: -moz-sticky;
          position: -ms-sticky;
          position: -o-sticky;
          top:0;
          background:${themeColor};
          display: flex;
          height:100px;
          width:100%;
          flex-direction: row;
          align-content: center;
          justify-content: center;
          justify-items: center;
          z-index: 999;
          margin: 0 auto;
          opacity: 1;
      
        align-items:flex-start;
      }

      .navInnerContainer {
        display:flex;
        align-items:center;
        flex-direction:row;
        width:100%;
       height:100px;
       padding-left:25px;
       padding-right:25px;
      }

      .textContainer {
        justify-content:center;
        display:flex;
        flex-direction:column;
      }

      .headerTitle {
        font-size:3.5vw;
        font-weight:800;
        text-decoration:underline;
        color:white;
       
      }

      .connectButtonContainer {
        margin-left:15px;
        display:flex;
        flex:1;
        align-items:center;
        justify-content:flex-end;
      }

      .connectButton {
        margin:10px;
        padding:15px;
        min-width:180px;
        height:50px;
      }

      .jazzicon {
        margin:10px;
        padding:15px;
        background:none;
        border:none;
      }

      a {
        font-size: 14px;
        margin-right: 15px;
        text-decoration: none;
      }
      .is-active {
        text-decoration: underline;
      }


      @media screen and (max-width:768px) {

        .headerContainer {
          flex-direction:row;
          align-items:flex-start;
        }
      

        .connectButton {
          font-size:14px;
          height:70px;
          margin:0;
          padding:0;
          width:100px;
          min-width:unset;
        }

        .connectButton {
        
          margin-left:0 !important;
        }
      }

      @media screen and (max-width:576px) {
        .headerTitle {
          font-size:18px;
        }
      
      }

    `}</style>

      <div className="navInnerContainer">

        <a href="https://dappcon.io" target="_blank
        " style={{ marginRight: 20 }} >
          {DappCon2020()}
        </a>


        <div className="textContainer">
          <span className="headerTitle">Vote for your favorite speaker</span>

        </div>

        <div className="connectButtonContainer">
          {!currentAccount &&
            <button className="connectButton" style={{ marginLeft: 10 }} onClick={() => {
              dispatch({
                type: "updateShowAuthModal",
                showAuthModal: true
              })
            }}>Connect Wallet</button>
          }

          {currentAccount && userInfo &&

            <Dropdown>
              <Dropdown.Toggle style={{ background: 'none', border: 'none' }} variant="primary" id="dropdown-basic">
                <Jazzicon diameter={40} seed={jsNumberForAddress(currentAccount)} />
              </Dropdown.Toggle>

              <Dropdown.Menu>

                <Dropdown.Item>
                  Tokens: {tokens ? tokens.length : 0}
                </Dropdown.Item>


                <Dropdown.Item>
                  Boosts remaining: {remainingBoosts(tokenVotes)}
                </Dropdown.Item>


                <Dropdown.Item>
                  Network: {currentNetwork ? currentNetwork : "Loading..."}
                </Dropdown.Item>

                <Dropdown.Item onClick={() => {
                  logout()



                }}>Logout</Dropdown.Item>

              </Dropdown.Menu>
            </Dropdown>


          }
        </div>


      </div>

    </div>


  )
}

export default Header
