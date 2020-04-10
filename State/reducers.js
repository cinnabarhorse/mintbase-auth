export const reducer = (state, action) => {

  switch (action.type) {
    case "updateAuthUser":
      return {
        ...state,
        authUser: action.authUser
      };

    case "updateUserInfo":
      return {
        ...state,
        userInfo: action.userInfo
      };
    case "updateTokens":
      return {
        ...state,
        tokens: action.tokens
      }
    case "updateTokenVotes":
      return {
        ...state,
        tokenVotes: action.tokenVotes
      }

    case "updateWeb3":
      return {
        ...state,
        globalWeb3: action.globalWeb3
      }

    case "updateCurrentAccount":
      return {
        ...state,
        currentAccount: action.currentAccount
      }

    case "updateCurrentNetwork":
      return {
        ...state,
        currentNetwork: action.currentNetwork
      }

    case "updateShowBoostModal":
      return {
        ...state,
        showBoostModal: action.showBoostModal
      }
    case "updateShowAuthModal":
      return {
        ...state,
        showAuthModal: action.showAuthModal
      }

    case "updateShowCantBoostModal":
      return {
        ...state,
        showCantBoostModal: action.showCantBoostModal
      }

    case "updateSpeakers":
      return {
        ...state,
        speakers: action.speakers
      }

    default:
      return state;
  }
};
