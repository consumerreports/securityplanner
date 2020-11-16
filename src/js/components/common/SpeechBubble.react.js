import PropTypes from 'prop-types';
import React, { Component } from 'react'
import ImageContainer from "./ImageContainer.react";

import ADAUtils from '../../vendor/utils/ADAUtils';

export default class SpeechBubble extends Component {
    constructor(props) {
        super(props);

        this.currentThreatId = this.props.currentActiveThreatId;
        this.nextThreatId, this.nextTool, this.previousTool = undefined ;
    }

    static propTypes = {
        toolList: PropTypes.object,
        link: PropTypes.string,
        onWheel: PropTypes.func,
        tabIndex: PropTypes.number,
        subtitle: PropTypes.string,
        currentActiveThreatId: PropTypes.string,
        threats: PropTypes.array,
        classNameStats: PropTypes.string,
        statsName: PropTypes.string,
    }

    render() {
        const { link, tabIndex, onWheel, subtitle, classNameStats, statsName } = this.props;

        if ( link ) {
            return (
                <a className="subtitle has-link"
                    tabIndex={ tabIndex }
                    href={ link }
                    target="_blank"
                    onWheel={ onWheel } 
                    ref="speech-bubble" 
                    onKeyDown={ ADAUtils.handleKeyboard(null, false, this.changeFocus) } >
                    <p>{ subtitle }</p>
                    { statsName ?
                        <div className={ "stats-name " + classNameStats }>
                            <div>&mdash; { statsName }</div>
                            <ImageContainer className="icon" src={ require("./../../../images/ui/external-link-white.png") }/>
                        </div>
                    : null }
                </a>
            )
        } else {
            return (
                <div className="subtitle"
                    style={ { pointerEvents: "none" } }
                    tabIndex={ tabIndex } 
                    ref="speech-bubble"
                    onKeyDown={ ADAUtils.handleKeyboard(null, false, this.changeFocus) } >
                    { subtitle }
                </div>
            )
        }
    }

    // Find the next element to focus on in the tab sequence
    changeFocus = e => {
        if (this.nextThreatId !== this.props.currentActiveThreatId) {
            const currentThreatIndex = this.props.threats.findIndex(threat => threat.id === this.props.currentActiveThreatId);
            const previousThreatIndex = currentThreatIndex - 1 >= 0 ? currentThreatIndex - 1 : 0;
            const previousThreatId = this.props.threats[previousThreatIndex].id;

            this.previousTool = this.props.toolList.refs[previousThreatId];
            this.nextTool = this.props.toolList.refs[this.props.currentActiveThreatId];
        }

        if (e.shiftKey) {
            if (this.props.threats.findIndex(threat => threat.id === this.props.currentActiveThreatId) === 0) {
                return;
            }
            this.previousTool.refs ? this.previousTool.refs["button"].focus() : this.previousTool.children[this.previousTool.children.length - 1].focus();
        } else {
            this.nextTool.children[1].getElementsByClassName("common-button-details")[0].focus();
        }
        e.preventDefault();
    }

    // When this element is focused through tab navigation, save the previous element in the tab sequence and figure out the next step
    setFocus = (previousTool, nextThreatId) => {
        this.nextThreatId = nextThreatId;
        this.previousTool = this.props.toolList.refs[previousTool.id];
        this.nextTool = this.props.toolList.refs[nextThreatId];
        this.refs["speech-bubble"].focus();
    }
}