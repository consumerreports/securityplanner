import AppDispatcher from "../dispatcher/AppDispatcher";
import SecurityPlannerConstants from "../constants/SecurityPlannerConstants";
import SecurityPlannerStore from "../stores/SecurityPlannerStore";

import MiniTracker from "../vendor/tracking/MiniTracker";

const SecurityPlannerActions = {

	/**
	 * Toggles the selected state of a statement.
	 *
	 * @param  {string} The id of the statement
	 */
	toggleStatementSelected: function(statementId, statementSlug = undefined) {
		if (statementSlug) {
			if (SecurityPlannerStore.isStatementSelected(statementId)) {
				MiniTracker.trackEvent("statement-card", "deselected", statementSlug);
			} else {
				MiniTracker.trackEvent("statement-card", "selected", statementSlug);
			}
		}
		AppDispatcher.dispatch({
			actionType: SecurityPlannerConstants.Actions.SECURITY_PLANNER_TOGGLE_STATEMENT_SELECTED,
			text: statementId,
		});
	},

	deselectAllStatements: function() {
		AppDispatcher.dispatch({
			actionType: SecurityPlannerConstants.Actions.SECURITY_PLANNER_DESELECT_ALL_STATEMENTS,
		});
	},

	showToastNotification: function(text, success, icon) {
		AppDispatcher.dispatch({
			actionType: SecurityPlannerConstants.Actions.SECURITY_PLANNER_SHOW_TOAST_NOTIFICATION,
			text: text,
			success: success,
			icon: icon,
		});
	},

	cleanupToastNotifications: function() {
		AppDispatcher.dispatch({
			actionType: SecurityPlannerConstants.Actions.SECURITY_PLANNER_CLEANUP_TOAST_NOTIFICATIONS,
		});
	},
};

SecurityPlannerActions.TOAST_ICON_CHECK = "check";

export default SecurityPlannerActions;