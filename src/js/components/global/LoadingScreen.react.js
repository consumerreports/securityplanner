import React from "react";

class ToastMessages extends React.Component {
    render() {
		return (
			<div className="common-loading-screen">
				<div className="loading">
					<img
						src={ require("./../../../images/ui/loading.gif") }
						alt=""
						width="25"
						height="25"/>
				</div>
			</div>
		);
	}
}

export default ToastMessages;