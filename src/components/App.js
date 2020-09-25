import React, { Component } from 'react'
import Main from "./Main";
import Param from "./Param";

import { Route, BrowserRouter } from "react-router-dom";

export class App extends Component {
    render() {
        return (
            <div className="container">
                <BrowserRouter>
                    <Route exact path='/' component={Main} />
                    <Route path='/referredby/:id' component={Param} />
                </BrowserRouter>
            </div>
        )
    }
}

export default App
