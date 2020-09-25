import React, { Component } from 'react'
import { toast } from 'react-toastify';
import TronWeb from 'tronweb';
import 'react-toastify/dist/ReactToastify.css';

const FOUNDATION_ADDRESS = "TLd2166z9RgTsQcGiLrRVK4nBnzUie2VuK";
const OWNER = "TQ9nCgHVgki3KjXUnC5Vdm3bcuNTQ4EVMY";

const Utils = {
    tronWeb: false,
    contract: false,

    async setTronWeb(tronWeb) {
        this.tronWeb = tronWeb;
        this.contract = await tronWeb.contract().at(FOUNDATION_ADDRESS)
    },
};

toast.configure();

class Main extends Component {

    async componentDidMount() {

        await this.connectTronWeb();
        await this.loadBlockChainData();

    }

    connectTronWeb = async () => {
        await new Promise(resolve => {
            const tronWebState = {
                installed: window.tronWeb,
                loggedIn: window.tronWeb && window.tronWeb.ready
            };

            if (tronWebState.installed) {
                this.setState({
                    tronWeb:
                        tronWebState
                });
                return resolve();
            }

            let tries = 0;

            const timer = setInterval(() => {
                if (tries >= 10) {
                    const TRONGRID_API = 'https://api.trongrid.io';

                    window.tronWeb = new TronWeb(
                        TRONGRID_API,
                        TRONGRID_API,
                        TRONGRID_API
                    );

                    this.setState({
                        tronWeb: {
                            installed: false,
                            loggedIn: false
                        }
                    });

                    clearInterval(timer);
                    return resolve();
                }

                tronWebState.installed = !!window.tronWeb;
                tronWebState.loggedIn = window.tronWeb && window.tronWeb.ready;

                if (!tronWebState.installed)
                    return tries++;

                this.setState({
                    tronWeb: tronWebState
                });

                resolve();
            }, 100);
        });

        if (!this.state.tronWeb.installed) {
            toast.error("Tron blockchain not supported, Try using Token Pocket/ Tron Wallet for Mobile and Tron Link chrome extension for PC");
        }
        if (!this.state.tronWeb.loggedIn) {
            // Set default address (foundation address) used for contract calls
            // Directly overwrites the address object as TronLink disabled the
            // function call
            // window.tronWeb.defaultAddress = {
            //     hex: window.tronWeb.address.toHex(FOUNDATION_ADDRESS),
            //     base58: FOUNDATION_ADDRESS
            // };

            window.tronWeb.on('addressChanged', () => {
                this.setState({
                    tronWeb: {
                        installed: true,
                        loggedIn: true
                    }
                });
            });
        }

        await Utils.setTronWeb(window.tronWeb);
    }


    loadBlockChainData = async () => {

        const sunny = 1e6;
        if (this.props.refid === undefined) {
            this.setState({ refid: OWNER });
            // console.log("inside undefined");
        } else {
            this.setState({ refid: this.props.refid });
            const refuser = await Utils.contract.users(this.state.refid).call();
            const deptime = Number(refuser.deposit_time);

            if (deptime === 0) {
                this.setState({ refid: OWNER });
            }
            // console.log("refid");  
        }
        this.setState({ refLoad: false });

        const accTemp = await Utils.tronWeb.defaultAddress.base58;
        this.setState({ account: accTemp });
        this.setState({ walletload: false });
        //   console.log(this.state.account);

        const balTemp = await Utils.tronWeb.trx.getBalance(accTemp);
        const ballTemp = balTemp / sunny;
        this.setState({ balance: ballTemp });
        this.setState({ balanceload: false });

        const user = await Utils.contract.users(this.state.account).call();

        const upline = window.tronWeb.address.fromHex(user.upline);
        this.setState({ upline });
        const deposit_amount = Number(user.deposit_amount) / sunny;
        this.setState({ deposit_amount });
        const deposit_time = Number(user.deposit_time);
        this.setState({ deposit_time });

        // console.log(deposit_time); 

        const userInfo = await Utils.contract.userInfo(this.state.account).call();
        console.log(userInfo);

        const userInfoTotals = await Utils.contract.userInfoTotals(this.state.account).call();
        console.log(userInfoTotals);

        const poolTopInfo = await Utils.contract.poolTopInfo().call();
        var addrs1, addrs2, addrs3, addrs4, addrs5, deps1, deps2, deps3, deps4, deps5;

        addrs1 = window.tronWeb.address.fromHex(poolTopInfo.addrs[0]);
        deps1 = Number(poolTopInfo.deps[0]) / sunny;
        console.log(addrs1 + '- dep ' + deps1);
        addrs2 = window.tronWeb.address.fromHex(poolTopInfo.addrs[1]);
        deps2 = Number(poolTopInfo.deps[1]) / sunny;
        console.log(addrs2 + '- dep ' + deps2);
        addrs3 = window.tronWeb.address.fromHex(poolTopInfo.addrs[2]);
        deps3 = Number(poolTopInfo.deps[2]) / sunny;
        console.log(addrs3 + '- dep ' + deps3);
        addrs4 = window.tronWeb.address.fromHex(poolTopInfo.addrs[3]);
        deps4 = Number(poolTopInfo.deps[3]) / sunny;
        console.log(addrs4 + '- dep ' + deps4);
        addrs5 = window.tronWeb.address.fromHex(poolTopInfo.addrs[4]);
        deps5 = Number(poolTopInfo.deps[4]) / sunny;
        console.log(addrs5 + '- dep ' + deps5);

        // console.log(poolTopInfo);

        console.log(this.state.refid);

    }


    async deposit(refid, amount) {

        await Utils.contract
            .deposit(refid)
            .send({
                from: this.state.account,
                callValue: Number(amount) * 1000000,
            }).then(res => {
                console.log(res);
                toast.success(amount + ' TRX Deposit processing', { position: toast.POSITION.TOP_RIGHT, autoClose: 10000 });

            }).catch(res => {
                //console.log(res);
                toast.error("Transaction rejected..")
            });
    }

    constructor(props) {
        super(props)

        this.state = {
            account: "",
            balance: 0,

            walletload: true,
            balanceload: true,
            refLoad: true,
        }
        this.deposit = this.deposit.bind(this);
    }

    render() {
        const numbers = [1, 2, 3, 4, 5];
        const listItems = numbers.map((number) =>
            <li>{number}</li>
        );
        return (
            <div>
                <h2>Main Page</h2>
                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        const deposit = this.depAmt.value;
                        this.deposit(this.state.refid, deposit);
                    }}
                >

                    <input className=" " type="text"
                        id="depAmt"
                        ref={(input) => {
                            this.depAmt = input;
                        }}

                        placeholder="Amount"

                        required />

                    <br />

                    <button type="submit">Invest</button>
                    <p>Sponsor : {this.state.refLoad ? null : this.state.refid}</p>
                    <p>account : {this.state.account}</p>
                    <p>deposit_amount : {this.state.deposit_amount}</p>
                    <div style={{ paddingBottom: "50px" }}></div>

                </form>
                <p></p>
                {/* {listItems} */}
                {/* <p>balance: {this.state.balance} ({this.state.account})</p> */}

            </div>
        )
    }
}

export default Main
