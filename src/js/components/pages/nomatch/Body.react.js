import PropTypes from 'prop-types'
import React from 'react'

class Body extends React.Component {
    static propTypes = {
        stringList: PropTypes.object, // StringList
        allowFocus: PropTypes.bool,
    }

    render() {
        // Hardcoded 404 text content. To be replaced by Contentful data
        return(
			<div className="body">
				<div className="title">
					{ "404" }
				</div>
				<div className="subtitle">
                    { this.props.stringList.get("page-not-found") }
				</div>
			</div>
        )
    }
}

export default Body;