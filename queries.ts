import gql from 'graphql-tag'

export const GET_STORE = gql` {
    store(id: "0x202d2f33449bf46d6d32ae7644ada130876461a4") {
      id
      owner
      name
      symbol
      tokenCount
      valueCount
      transferCount
      boughtCount
      things {
        id
        metaId
        tokens {
          price
          tokenId
          state
          resolveOwner {
            id
          }
        }
      }
    }
  }
  `

export const HAS_THING_FROM_STORE = gql`
query tokens($ownerId: String!, $metaId: String!, $storeId: String!) {
  tokens(
    where: { metaId: $metaId, store: $storeId, resolveOwner: $ownerId }
  ) {
    id
  }
}
`;