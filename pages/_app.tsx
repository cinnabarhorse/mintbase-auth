import React from 'react'
import App from 'next/app'

import { GlobalState } from '../State/globalState'
import { initialState } from '../State/initialState'
import { reducer } from '../State/reducers'
import Head from 'next/head'
import Layout from '../components/Layout'
import Header from '../components/Header'

class MyApp extends App {



    render() {
        const { Component, pageProps } = this.props

        return (

            <Layout>

                <Head>
                    <link
                        rel="stylesheet"
                        href="https://maxcdn.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css"
                        integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T"
                        crossOrigin="anonymous"
                    />

                </Head>
                <GlobalState initialState={initialState} reducer={reducer}>
                    <Header />
                    <Component {...pageProps} />

                </GlobalState>
            </Layout>


        )
    }
}

export default MyApp