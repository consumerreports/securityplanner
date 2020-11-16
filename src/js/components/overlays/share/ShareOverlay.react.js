import PropTypes from 'prop-types';
import React, { Component } from "react";

import ADAUtils from "./../../../vendor/utils/ADAUtils";
import MiniTracker from "./../../../vendor/tracking/MiniTracker";
import MultiSharer from "./../../../vendor/sharing/MultiSharer";
import DirectionUtils from "./../../../vendor/utils/DirectionUtils";

import ResizeUtils from "./../../../vendor/utils/ResizeUtils";

export default class ShareOverlay extends Component {
	constructor(props) {
		super(props)

		this.state = {
			visible: false,
			showing: false,
			hiding: false,
			windowHeight: window.innerHeight,
			isActive: false,
		}
	}

    displayName = 'ShareOverlay';
    shareURL = "";
    shareMessage = "";
	shareSubject = "";

    static propTypes ={
		scrollPosition: PropTypes.number,
		stringList: PropTypes.object, // StringList
		onClickClose: PropTypes.func,
	}

	componentDidMount() {
		ResizeUtils.onResize.add(this.onResize);
		ADAUtils.addFocusTrap(this.tabSequence);

		// Hack with timeout to focus element in IE
		this.focusTimeout = setTimeout(() => {
			this.shareGroupElement.focus();
		}, 0);
	}

	componentWillUnmount() {
		ResizeUtils.onResize.remove(this.onResize);
		ADAUtils.destroyFocusTrap();

		clearTimeout(this.focusTimeout);
		this.focusTimeout = null;
	}

	render() {
		this.shareURL = this.props.stringList.get("sharing-url");
		this.shareMessage = this.props.stringList.get("sharing-message").replace("[[url]]", this.shareURL);
		this.shareSubject = this.props.stringList.get("sharing-subject");

		const linkEmail = MultiSharer.getShareURL(MultiSharer.EMAIL, this.shareURL, this.shareMessage, this.shareSubject);
		const linkFacebook = MultiSharer.getShareURL(MultiSharer.FACEBOOK, this.shareURL, this.shareMessage, this.shareSubject);
		const linkGoogle = MultiSharer.getShareURL(MultiSharer.GOOGLE_PLUS, this.shareURL, this.shareMessage, this.shareSubject);
		const linkTwitter = MultiSharer.getShareURL(MultiSharer.TWITTER, this.shareURL, this.shareMessage, this.shareSubject);

		let className = "";
		if (!this.state.visible) className += " hidden";
		if (this.state.showing) className += " showing";
		if (this.state.hiding) className += " hiding";

		this.tabSequence = []

		const overlayTitle = this.props.stringList.get("sharing-message").replace(": [[url]]", "");

	return (
			<div
				className={ "overlayShare overlay" + className + " " + DirectionUtils.getClass(this.props.stringList) }
				aria-hidden={ !this.state.isActive }
				role="dialog"
				style={ { height: this.state.windowHeight } }
				aria-label={overlayTitle}
				onKeyDown={ ADAUtils.handleOverlay(this.close) }
				tabIndex={this.state.isActive ? 0 : -1}>
				<div className="background" onClick={ this.close } data-testid="share-overlay-background"/>	
				<div
					className="share"
					role="group"
					aria-label="Share options"
					ref={ e => {
						this.shareGroupElement = e
						this.tabSequence[0] = e
					} }
					tabIndex={ this.stateisActive ? 0 : -1 }
					onKeyDown={ ADAUtils.handleFocusTrap(null, 0) }>
					<div className="item" ref={ MultiSharer.EMAIL }>
						<a
							role="listitem"
							tabIndex={ 0 }
							onClick={ this.onClickShareEmail }
							ref={e => this.tabSequence[1] = e}
							onKeyDown={ ADAUtils.handleFocusTrap(this.onClickShareEmail, 1, true) }
							target="_blank"
							href={ linkEmail }>
							<img src={ require("./../../../../images/overlay-share/icon-share-email.svg") }  alt="Share via Email"/>
						</a>
					</div>
					<div className="item" ref={ MultiSharer.TWITTER }>
						<a
							role="listitem"
							tabIndex={ 0 }
							onClick={ this.onClickShareTwitter }
							ref={e => this.tabSequence[2] = e}
							onKeyDown={ ADAUtils.handleFocusTrap(this.onClickShareTwitter, 2) }
							href={ linkTwitter }>
							<img src={ require("./../../../../images/overlay-share/icon-share-twitter.svg") }  alt="Share via Twitter"/>
						</a>
					</div>
					<div className="item" ref={ MultiSharer.GOOGLE_PLUS }>
						<a
							role="listitem"
							tabIndex={ 0 }
							onClick={ this.onClickShareGoogle }
							ref={e => this.tabSequence[3] = e}
							onKeyDown={ ADAUtils.handleFocusTrap(this.onClickShareGoogle, 3) }
							href={ linkGoogle }>
							<img src={ require("./../../../../images/overlay-share/icon-share-google.svg") }  alt="Share via Google Plus"/>
						</a>
					</div>
					<div className="item" ref={ MultiSharer.FACEBOOK }>
						<a
							role="listitem"
							tabIndex={ 0 }
							onClick={ this.onClickShareFacebook }
							ref={e => this.tabSequence[4] = e}
							onKeyDown={ ADAUtils.handleFocusTrap(this.onClickShareFacebook, 4) }
							href={ linkFacebook }>
							<img src={ require("./../../../../images/overlay-share/icon-share-facebook.svg") } alt="Share via Facebook"/>
						</a>
					</div>
				</div>
			</div>
		)
	}

	onResize = dimensions => {
		this.setState({
			windowHeight: dimensions.height,
		});
	}

    /**
	 * Ran when the section becomes the focused section
	 */
    onActivate = (travelOffset, viaHistoryAPI, fromOverlay) => { // eslint-disable-line no-unused-vars
		this.setState({
			isActive: true,
		});
	}

    /**
	 * Ran when the section is about to lose focus
	 */
    onDeactivate = (travelOffset, viaHistoryAPI, toOverlay) => { // eslint-disable-line no-unused-vars
		this.setState({
			isActive: false,
		});
	}

    startTransitionShow = (callback) => {
		this.setState({ visible:false, showing:true, hiding:false });

		requestAnimationFrame(callback);

		setTimeout(() => {
			if (this.state.showing) {
				this.setState({ visible:true, showing:false, hiding:false });

				document.body.style.top = `-${this.props.scrollPosition}px`;
				document.body.style.marginTop = `${this.props.scrollPosition}px`;
				document.body.style.height = `${window.innerHeight}px`;
				document.body.style.overflow = "hidden";
			}
		}, 630);
	}

    startTransitionHide = (callback) => {
		this.setState({ visible:true, showing:false, hiding:true });

		document.body.style.top = "";
		document.body.style.marginTop = "";
		document.body.style.height = "";
		document.body.style.overflow = "";

		setTimeout(() => {
			callback();
		}, 330);
	}

    close = () => {
		if (this.props.onClickClose) this.props.onClickClose();
	}

    onClickShareEmail = () => {
		MiniTracker.trackEvent("social", "share", MultiSharer.EMAIL);
	}

    onClickShareTwitter = (e) => {
		this.performShare(MultiSharer.TWITTER);
		return this.preventDefaultBehavior(e);
	}

    onClickShareGoogle = (e) => {
		this.performShare(MultiSharer.GOOGLE_PLUS);
		return this.preventDefaultBehavior(e);
	}

    onClickShareFacebook = (e) => {
		this.performShare(MultiSharer.FACEBOOK);
		return this.preventDefaultBehavior(e);
	}

    performShare = (type) => {
		MiniTracker.trackEvent("social", "share", type);
		MultiSharer.share(type, this.shareURL, this.shareMessage, this.shareSubject);
	}

    preventDefaultBehavior = (e) => {
		e.stopPropagation();
		e.preventDefault();
		return false;
	}
}