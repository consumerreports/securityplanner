/**
 * A global temporary state (indexable by keys) for temporary states
 */
import SimpleSignal from "simplesignal";

export default class Transport {

	// ================================================================================================================
	// CONSTRUCTOR ----------------------------------------------------------------------------------------------------

	constructor(key) {
		this._key = key;
		this._state = {};
		this.onChanged = new SimpleSignal();
	}


	// ================================================================================================================
	// PUBLIC INTERFACE -----------------------------------------------------------------------------------------------

	static get(key) {
		if (!Transport.instances[key]) {
			Transport.set(key, new Transport(key));
		}

		return Transport.instances[key];
	}

	setState(state) {
		this._state = state;
		this.onChanged.dispatch(this._state);
	}

	getState() {
		return this._state;
	}


	// ================================================================================================================
	// PRIVATE INTERFACE ----------------------------------------------------------------------------------------------

	static set(key, instance) {
		Transport.instances[key] = instance;
	}
}

Transport.instances = {};