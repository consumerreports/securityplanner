import PropTypes from 'prop-types';
import React from "react";

import ADAUtils from "./../../../vendor/utils/ADAUtils";
import MiniTracker from "./../../../vendor/tracking/MiniTracker";
import ReactUtils from "./../../../vendor/utils/ReactUtils";

import Review from "./Review.react";

class ReviewList extends React.Component {
    static propTypes = {
		stringList: PropTypes.object, // StringList
		routes: PropTypes.object.isRequired, // SecurityPlannerRoutes
		goToPage: PropTypes.func.isRequired,
		tool: PropTypes.object, // Tool
		allowFocus: PropTypes.bool,
	};

    state = {
        expandedList: false,
    };

    render() {
		if (this.props.tool.reviews.length === 0) return null;

		// Actual reviews
		const reviewsToUse = this.props.tool.reviews.concat();
		reviewsToUse.sort(function(a, b) {
			if (a.score > b.score) return -1;
			if (a.score < b.score) return 1;
			return 0;
		});
		const reviewComponents = [];
		const authorComponents = [];
		for (let i = 0; i < reviewsToUse.length; i++) {
			const isExpanded = i == 0 || i == reviewsToUse.length - 1 || this.state.expandedList;
			const review = reviewsToUse[i];

			reviewComponents.push(
				<Review
					key={ i }
					className={ isExpanded ? "" : "hidden" }
					stringList={ this.props.stringList }
					routes={ this.props.routes }
					goToPage={ this.props.goToPage }
					tool={ this.props.tool }
					review={ review }
					allowFocus={ isExpanded && this.props.allowFocus }/>
			);

			authorComponents.push(
				<a
					href="#"
					tabIndex={ this.props.allowFocus ? 0 : -1 }
					role="button"
					onKeyDown={ ADAUtils.handleKeyboard((e) => this.onClickAuthor(review.author, e)) }
					onClick={ (e) => this.onClickAuthor(review.author, e) }>
					{ review.author.name }
				</a>
			);

			if (i == 0 && reviewsToUse.length > 2 && !this.state.expandedList) {
				// Also show the expand button
				const numReviews = reviewsToUse.length - 2;
				const reviewCallout = this.props.stringList.get(numReviews == 1 ?
					"overlay-tool-reviews-more-single" : "overlay-tool-reviews-more-multiple").replace("[[reviews]]", numReviews);

				reviewComponents.push(
					<div
						key="more-reviews"
						className="more-reviews"
						tabIndex={ this.props.allowFocus ? 0 : -1 }
						role="button"
						onKeyDown={ ADAUtils.handleKeyboard(this.expandList) }
						onClick={ this.expandList }>
						<div className="line"/>
						<div className="text">{reviewCallout}</div>
						<img src={ require("./../../../../images/ui/icon-arrow-down-blue.svg") } alt="Down arrow icon"/>
						<div className="line"/>
					</div>
				);
			}
		}

		const formattedAuthors = [];
		const shuffledAuthors = authorComponents.reverse(); // TODO make random?
		for (let index = 0; index < authorComponents.length; index++) {
			const authorComponent = shuffledAuthors[index];
			if (index === shuffledAuthors.length - 1) {
				formattedAuthors.push(
					<div className="author">
						<div className="name">
							{authorComponent}
						</div>
					</div>);
			} else {
				formattedAuthors.push(
					<div className="author">
						<div className="name">
							{authorComponent},&nbsp;
						</div>
					</div>);
			}
		}

		return (
			<div className="reviews">
				<div className="subtitle">{ this.props.stringList.get("overlay-tool-reviews-opinion-description") }</div>
				{ reviewComponents }
				<div className="subtitle">{ this.props.stringList.get("overlay-tool-reviews-reviewers") }</div>
				<div className="footer">
					These reviews were written by:&nbsp;
            { formattedAuthors }
        </div>
			</div>
		);
	}

    expandList = () => {
		// Allows other reviews to be displayed
		this.setState({ expandedList:true });
		MiniTracker.trackEvent("tool", "expanded-review-list", this.props.tool.slug, this.props.tool.reviews.length);
	};

    onClickAuthor = (bio, e) => {
		this.props.goToPage(this.props.routes.getUriOverlayBio(bio.slug), true, true);
		e.preventDefault();
	};
}

export default ReviewList;
