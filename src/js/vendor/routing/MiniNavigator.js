import SimpleSignal from "simplesignal";
import { clamp } from "moremath";

export class MiniNavigator {

	// ================================================================================================================
	// CONSTRUCTOR ----------------------------------------------------------------------------------------------------

	constructor() {
		// Variables
		this.position = -1;
		this.locations = []; // Array of LocationInfo
		this.locationsIndexedById = {};

		this.lastPositionTravelOffset = 0;
		this.lastPositionTravelType = undefined;
		this.treatNextPositionTravelAsExplicit = false;

		// Configuration parameters
		this.useHistoryAPI = true;
		this.locationHistory = []; // {id: locationId, info: locationInfo }
		this.locationHistoryPosition = -1;

		// Calculated
		this.displayedLocations = [];
		this.displayedPosition = -1;
		this.furthestPosition = -1;
		this.furthestDisplayedPosition = -1;
		this.currentTitle = "";
		this.currentBrowserTitle = "";
		this.currentParams = undefined;

		this.onLocationChanged = new SimpleSignal();

		if (this.useHistoryAPI) {
			window.addEventListener("popstate", this.onHistoryPopState.bind(this));

			// Disable browser's attempts to restore scroll
			// https://developers.google.com/web/updates/2015/09/history-api-scroll-restoration
			if ("scrollRestoration" in history) {
				history.scrollRestoration = "manual";
			}
		}
	}


	// ================================================================================================================
	// PUBLIC INTERFACE -----------------------------------------------------------------------------------------------

	addLocation(locationId, handler = undefined, display = false, title = undefined, browserTitle = undefined, params = undefined) {
		// Adds a path to the history (after the current history position)

		// Create the new one
		const newLocation = new LocationInfo(locationId, handler, display, title, browserTitle, params);

		this.locations.push(newLocation);
		this.locationsIndexedById[locationId] = newLocation;

		if (display) this.displayedLocations.push(newLocation);

		if (newLocation.handler) newLocation.handler.onCreated.dispatch(newLocation.id, newLocation.params);
	}

	removeLocation(index) {
		if (index < this.locations.length) {
			const deletedLocation = this.locations[index];

			if (deletedLocation.display) {
				const displayedLocationIndex = this.displayedLocations.indexOf(deletedLocation);
				if (displayedLocationIndex <= this.displayedPosition) this.displayedPosition--;
				this.displayedLocations.splice(displayedLocationIndex, 1);
			}
			if (deletedLocation.handler) deletedLocation.handler.onDestroyed.dispatch(deletedLocation.id, deletedLocation.params);

			delete this.locationsIndexedById[deletedLocation.id];
			this.locations.splice(index, 1);

			if (this.useHistoryAPI) {
				const historyIndex = this.locationHistory.findIndex(location => location.id === deletedLocation.id);
				if (historyIndex > -1) this.locationHistory.splice(historyIndex, 1);
			}
		}
	}

	removeLocationsAfterCurrent() {
		while (this.locations.length > this.position + 1) {
			this.removeLocation(this.locations.length - 1);
		}

		// We can't clear the browser history stack, so instead we handle invalid history navigations inside onHistoryPopState()

		this.furthestPosition = this.position;
		this.furthestDisplayedPosition = this.displayedPosition;
	}

	hasLocation(locationId) {
		return this.locations.indexOf(this.locationsIndexedById[locationId]) > -1;
	}

	getDisplayedLocationAt(index) {
		return index < this.displayedLocations.length && index >= 0 ? this.displayedLocations[index].id : undefined;
	}

	goToLocation(locationId, treatAsExplicit = false) {
		// console.log("[NAV] Going to", locationId, ", explicit = ", treatAsExplicit);
		// If it's "explicit", it may use the history API but will pretend it didn't

		// If it's using the history API and the location is in the history, just go there
		if (this.useHistoryAPI && !treatAsExplicit) {
			const historyIndex = this.locationHistory.findIndex(location => location.id === locationId);
			if (historyIndex > -1) {
				// The location exists in the history, goes there using the history API
				// console.log("can change via history API: " + (historyIndex - this.locationHistoryPosition));
				this.treatNextPositionTravelAsExplicit = treatAsExplicit;
				if (historyIndex != this.locationHistoryPosition) window.history.go(historyIndex - this.locationHistoryPosition);
				return;
			}
		}

		// Go to the new location more manually (assumes it's a new location)
		this.setLocation(locationId, false);
	}

	get currentLocationId() {
		return (this.locations.length > 0 && !isNaN(this.position) && !!this.locations[this.position]) ? this.locations[this.position].id : undefined;
	}

	getLocationInfo(locationId) {
		return this.locationsIndexedById[locationId];
	}

	// Prevent the history API from being called twice on the same interaction
	canGoBack = true; 
	goBack() {
		if (this.useHistoryAPI) {
			if (this.canGoBack) {
				history.go(-1);
				this.canGoBack = false;
				setTimeout(() => this.canGoBack = true, 400)
			} else {
				return;
			}
		} else {
			this.setPosition(this.position - 1, false);
		}
	}


	// ================================================================================================================
	// PRIVATE INTERFACE ----------------------------------------------------------------------------------------------

	setLocation(locationId, isFromHistoryAPI) {
		// console.log("...setting location as [" + locationId + "], from history API = " + isFromHistoryAPI);
		const localIndex = this.locations.indexOf(this.locationsIndexedById[locationId]);

		if (localIndex > -1) {
			this.setPosition(localIndex, isFromHistoryAPI);
		} else {
			console.error("Location [" + locationId + "] not found on scrollable navigator list!"); // eslint-disable-line
		}
	}

	setPosition(newPosition, isFromHistoryAPI) {
		// Set the current position in the linear navigation route

		newPosition = clamp(newPosition, 0, this.locations.length - 1);

		if (newPosition != this.position) {
			this.lastPositionTravelOffset = newPosition - this.position;
			this.lastPositionTravelType = MiniNavigator.TRAVEL_TYPE_EXPLICIT;

			// Deactivate current
			let oldLocation = undefined;
			if (this.position >= 0) {
				oldLocation = this.locations[this.position];
			}
			const newLocation = this.locations[newPosition];

			if (oldLocation && oldLocation.handler) {
				if (newLocation) {
					oldLocation.handler.onDeactivated.dispatch(oldLocation.id, oldLocation.params, newLocation.id, newLocation.params);
				} else {
					oldLocation.handler.onDeactivated.dispatch(oldLocation.id, oldLocation.params);
				}
			}

			// Change current
			this.position = newPosition;

			if (this.position > this.furthestPosition) {
				this.furthestPosition = this.position;
			}

			// Calculate earliest displayed position
			this.displayedPosition = -1;
			for (let i = 0; i <= this.position; i++) {
				if (this.locations[i].display) this.displayedPosition++;
			}
			this.furthestDisplayedPosition = this.furthestPosition;
			for (let i = 0; i <= this.furthestPosition; i++) {
				if (!this.locations[i].display) this.furthestDisplayedPosition--;
			}

			// Set title
			this.currentTitle = newLocation.title;
			this.currentBrowserTitle = newLocation.browserTitle;
			this.currentParams = newLocation.params;

			// Change path
			if (oldLocation) {
				this.onLocationChanged.dispatch(newLocation.id, newLocation.params, oldLocation.id, oldLocation.params);
			} else {
				this.onLocationChanged.dispatch(newLocation.id, newLocation.params);
			}

			if (this.useHistoryAPI) {
				if (!isFromHistoryAPI) {
					// If it's not going back in the history, push the new state to the history
					if (this.locationHistoryPosition < 0) {
						// First state
						history.replaceState({ index: this.position, id: newLocation.id }, newLocation.title, this.getBrowserFriendlyLocation(newLocation.id));
					} else {
						// Additional states
						history.pushState({ index: this.position, id: newLocation.id }, newLocation.title, this.getBrowserFriendlyLocation(newLocation.id));
					}
					if (this.locationHistory.length > this.locationHistoryPosition + 1) {
						this.locationHistory.splice(this.locationHistoryPosition + 1, this.locationHistory.length - this.locationHistoryPosition - 1);
					}
					this.locationHistory.push({ id: newLocation.id, info: newLocation });
					this.locationHistoryPosition = this.locationHistory.findIndex(location => location.info === newLocation);
					// console.log("   Pushing [" + newLocation.id + "] to history, new = " + this.locationHistoryPosition + " @ [" + this.locationHistory + "]");
				} else {
					if (!this.treatNextPositionTravelAsExplicit) {
						this.lastPositionTravelType = MiniNavigator.TRAVEL_TYPE_BROWSER_HISTORY_API;
					} else {
						this.treatNextPositionTravelAsExplicit = false;
					}
					this.locationHistoryPosition = this.locationHistory.findIndex(location => location.info === newLocation);
					// console.log("   Popping [" + newLocation.id + "] from history, new = " + this.locationHistoryPosition + " @ [" + this.locationHistory + "]");
				}
			}

			// Activate current
			if (newLocation.handler) {
				if (oldLocation) {
					newLocation.handler.onActivated.dispatch(newLocation.id, newLocation.params, oldLocation.id, oldLocation.params);
				} else {
					newLocation.handler.onActivated.dispatch(newLocation.id, newLocation.params);
				}
			}

			// console.log("%c[!] Navigator changed!", "font-weight:bold;");
			// console.log("  Locations: ", this.locations.map((location, index) => index === this.position ? `[[[${location.id}]]]` : location.id).join(" -> "));
			// console.log("    History: ", this.locationHistory.map((location, index) => index === this.locationHistoryPosition ? `[[[${location.id}]]]` : location.id).join(" -> "));
			// console.log("  Locations: ", this.locations.map((location, index) => index === this.position ? `[[[${location.browserTitle}]]]` : location.browserTitle).join(" -> "));
		}
	}

	getBrowserFriendlyLocation(location) {
		// Returns a browser-friendly URL for the history API: one that doesn't try to change the perceived folder location
		// Normally we'd actually rewrite the location using a pseudo-URL, but that requires server support and it is not guaranteed so we use hashes
		return "#" + location;
	}

	onHistoryPopState(e) {
		// The state has changed because of a user action, try to revert back
		const newLocation = e.state ? e.state.id : undefined;
		const travelOffset = e.state ? e.state.index - this.locationHistoryPosition : undefined;

		// console.log("===> Location changed via history to [" + newLocation + "], offset " + travelOffset, e);

		if (travelOffset > 0 && e.state.index > this.furthestPosition) {
			// Not allowed (likely locations that were removed but could not be deleted from the browser history), so just force back
			history.go(-travelOffset);
		} else if (newLocation) {
			// Allowed, goes to the location
			this.setLocation(newLocation, true);
		}
	}
}

MiniNavigator.TRAVEL_TYPE_EXPLICIT = "explicit";
MiniNavigator.TRAVEL_TYPE_BROWSER_HISTORY_API = "browser-history-api";

export class LocationHandler {

	// ================================================================================================================
	// CONSTRUCTOR ----------------------------------------------------------------------------------------------------

	constructor() {
		this.onCreated = new SimpleSignal(); // When first created, params = locationId, locationParams
		this.onActivated = new SimpleSignal(); // When it becomes active, params = locationId, locationParams
		this.onDeactivated = new SimpleSignal(); // When it is not active anymore, params = locationId, locationParams
		this.onDestroyed = new SimpleSignal(); // When destroyed, params = locationId, locationParams
	}

}

class LocationInfo {

	// ================================================================================================================
	// CONSTRUCTOR ----------------------------------------------------------------------------------------------------

	constructor(locationId, handler, display, title, browserTitle, params) {
		this.id = locationId;
		this.handler = handler;
		this.display = display;
		this.title = title;
		this.browserTitle = browserTitle;
		this.params = params;
	}
}