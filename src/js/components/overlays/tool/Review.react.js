import PropTypes from 'prop-types';
import React from "react";

import ADAUtils from "./../../../vendor/utils/ADAUtils";
import MiniTracker from "./../../../vendor/tracking/MiniTracker";
import MarkdownUtils from "./../../../vendor/utils/MarkdownUtils";

import CircularBar from "./CircularBar.react";

class Review extends React.Component {
    static propTypes = {
		className: PropTypes.string,
		stringList: PropTypes.object, // StringList
		routes: PropTypes.object.isRequired, // SecurityPlannerRoutes
		goToPage: PropTypes.func.isRequired,
		tool: PropTypes.object, // Tool
		review: PropTypes.object, // Review
	};

    state = {
        isExpanded: false,
    };

    render() {
		// Create the "read more..." blurb
		let reviewBlurb = this.props.review.review;

		// Cut by char count, ugh
		const maxLength = 300;
		let needsBlur = true;
		if (reviewBlurb.length > maxLength) {
			// Cut before the last space
			reviewBlurb = reviewBlurb.substr(0, maxLength);
			reviewBlurb = reviewBlurb.substr(0, reviewBlurb.lastIndexOf(" "));
			reviewBlurb += "... ";
		} else {
			// Can show the full review
			needsBlur = false;
			reviewBlurb += " ";
		}

		const showFullReview = !needsBlur || this.state.isExpanded;

		return (
			<div
				className={ "review" + (this.props.className ? " " + this.props.className : "") }>
				<div className="main-column">
					<div className="review-title">{ this.props.review.reviewTitle }</div>
					<div
						className={ "blurb" + (showFullReview ? " hidden" : " visible") }
						tabIndex={ this.props.allowFocus ? 0 : -1 }
						role="button"
						onKeyDown={ ADAUtils.handleKeyboard(this.onClickExpand) }
						onClick={ this.onClickExpand }>
						<p>
							{ reviewBlurb }
							<em>{ this.props.stringList.get("overlay-tool-reviews-read-more") }</em>
						</p>
					</div>
					<div
						className={ "body" + (showFullReview ? " visible" : " hidden") }
						tabIndex={ needsBlur && this.props.allowFocus ? 0 : -1 }
						role="button"
						onKeyDown={ ADAUtils.handleKeyboard(this.onClickExpand) }
						onClick={ needsBlur ? this.onClickExpand : null }>
						{ MarkdownUtils.renderMarkdown(this.props.review.review) }
					</div>
					<div className="footer">
						<div className="date">
							{ this.renderDate(this.props.review.date) }
						</div>
					</div>
				</div>
			</div>
		);
	}

    renderDate = (date) => {
		if (date) {
			const d = parseInt(date.match(/-([0-9]+)$/)[1], 10);
			const m = parseInt(date.match(/-([0-9]+)-/)[1], 10) - 1;
			const y = parseInt(date.match(/^([0-9]+?)-/)[1], 10);
			const template = this.props.stringList.get("common-formatting-datetime-my");
			const months = this.props.stringList.getArray("common-formatting-datetime-months-long");
			return template
				.replace("d", d)
				.replace("y", y)
				// We have to replace `m` last, because `m` may insert a `y` (think `May`), which causes previous replacement to be borked.
				.replace("m", months[m]);
		} else {
			return null;
		}
	};

    onClickExpand = () => {
		this.setState({ isExpanded: !this.state.isExpanded });
		MiniTracker.trackEvent("tool", "expanded-review-"  + this.props.review.author.slug, this.props.tool.slug, this.props.tool.reviews.length);
	};
}

export default Review;
