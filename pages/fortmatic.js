import React, { useState, useEffect } from "react";
import Fortmatic from 'fortmatic'
import Web3 from 'web3'


const FortmaticPage = (props) => {

    const [globalWeb3, setWeb3] = useState()

    useEffect(() => {
        if (typeof window !== 'undefined') {
            let fm = new Fortmatic('pk_test_B086452452BE45F2');
            let web3 = new Web3(fm.getProvider());

            setWeb3(web3)

            console.log('web3:', web3)
        }
    }, [])



    async function getAccount() {

        console.log('web3:', globalWeb3)
        const account = await globalWeb3.eth.getAccounts()
        console.log('account:', account)
    }


    return (
        <div>
            <button onClick={() => {
                getAccount()
            }}>Call Fortmatic</button>
        </div>
    );
}
export default FortmaticPage;