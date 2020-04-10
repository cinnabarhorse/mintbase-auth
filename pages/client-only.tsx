import Layout from '../components/Layout'
import Header from '../components/Header'
import { withApollo } from '../lib/apollo'

const ClientOnlyPage = props => (
  <Layout>
    <Header />

  </Layout>
)

export default withApollo()(ClientOnlyPage)
