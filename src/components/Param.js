import React, { Component } from 'react'
import Top from "./Main";
export class Param extends Component {
    render() {
        return (
            <div>
                <Top
                    refid={this.props.match.params.id}
                />
            </div>
        )
    }
}

export default Param
