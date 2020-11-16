import PropTypes from 'prop-types'
import React, { Component } from 'react'
import Bowser from 'bowser'
import cx from "classnames"

import PageSectionHelper from "./../../../vendor/utils/PageSectionHelper";
import DirectionUtils from "./../../../vendor/utils/DirectionUtils";
import iOSUtils from "./../../../vendor/utils/iOSUtils";

import SecurityPlannerActions from "../../../actions/SecurityPlannerActions";

import SecondaryMenu from "../../common/SecondaryMenu.react";
import FooterMenu from "../../common/FooterMenu.react";

import Body from "./Body.react";

class NoMatchPage extends Component {
    constructor(props) {
        super(props)
        this.helper = new PageSectionHelper(this)
    }

    static propTypes = {
		stringList: PropTypes.object, // StringList
		selectedLanguage: PropTypes.object, // Language
		availableLanguages: PropTypes.arrayOf(PropTypes.object), // Language[]
		routes: PropTypes.object.isRequired, // SecurityPlannerRoutes
		goToPage: PropTypes.func.isRequired,
    }

    componentDidMount() {
        this.helper.setComponent(this.refs.scroller)
    }

    shouldComponentUpdate(nextProps) {
		return nextProps.stringList != this.props.stringList ||
			nextProps.selectedLanguage != this.props.selectedLanguage ||
			nextProps.availableLanguages != this.props.availableLanguages ||
			nextProps.routes != this.props.routes ||
			nextProps.goToPage != this.props.goToPage;
    }

    componentDidUpdate() {
        this.helper.setComponent(this.refs.scroller);
    }

    componentWillUnmount() {
        this.helper.destroy()
    }

    render() {

        const headImgStyle = {
            backgroundImage: `url("${require("./../../../../images/page-cover/main.png")}")`,
            backgroundRepeat: "no-repeat",
        }

        return (
            <div
                className={ cx("sectionPageHolder", "pageCover", "pageCover--404", DirectionUtils.getClass(this.props.stringList)) }
                aria-hidden={ !this.helper.isActive() }
                style={ { height: this.helper.getWindowHeight() } }>
                <div 
                    className="content"
                    ref="scroller">
                    <div className="inner">
                        <SecondaryMenu
                            stringList={ this.props.stringList }
                            currentLocation={ SecondaryMenu.LOCATION_NOMATCH }
                            availableLanguages={ this.props.availableLanguages }
                            selectedLanguage={ this.props.selectedLanguage }
                            routes={ this.props.routes }
                            goToPage={ this.props.goToPage }
                            allowFocus={ this.helper.isActive() }
                            useLightStyle={ true }
                            className="header"
                            ref="menu" />
                        <div className="middle" id={ SecondaryMenu.LOCATION_NOMATCH }>
                            <div className="common-image-container head" style={ headImgStyle }/>
                            <Body
                                ref={ (r) => { this.body = r; } }
                                stringList={ this.props.stringList }
                                allowFocus={ this.helper.isActive() }/>
                        </div>
                        <FooterMenu
                            stringList={ this.props.stringList }
                            currentLocation={ SecondaryMenu.LOCATION_NOMATCH }
                            routes={ this.props.routes }
                            goToPage={ this.props.goToPage }
                            style={ FooterMenu.STYLE_LIGHT }
                            allowFocus={ this.helper.isActive() }/>
                    </div>
                </div>
            </div>
        )
    }

    // Common events for navigation
    onActivate = (travelOffset, viaHistoryAPI) => {
		// Ran when the section becomes active
		this.helper.onActivate(travelOffset, viaHistoryAPI);
	};

    onDeactivate = (travelOffset, viaHistoryAPI) => {
		// Ran when the section becomes inactive
		this.helper.onDeactivate(travelOffset, viaHistoryAPI);
	};
}

export default NoMatchPage;