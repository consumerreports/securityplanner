import Easing from "./Easing";
import { map } from "moremath";

export default class Fween {
	static use(object1, object2) {
		if (typeof (object1) === "object") {
			// Object
			return new FweenObjectSequence(object1);
		} else if (typeof (object1) === "function" && typeof (object2) === "function") {
			// Getter/setter
			return new FweenGetterSetterSequence(object1, object2);
		}
		console.error("Tweening parameters were not understood."); // eslint-disable-line
		return null;
	}
	static getTicker() {
		if (!this.ticker)
			this.ticker = new FweenTicker();
		return this.ticker;
	}
}
// Main class - just a starting point
Fween.ticker = null;
// ================================================================================================================
// INTERNAL CLASSES -----------------------------------------------------------------------------------------------
// Aux classes
class FweenStepMetadata {
	// ================================================================================================================
	// CONSTRUCTOR ----------------------------------------------------------------------------------------------------
	constructor() {
		// Class to maintain metadata related to each step of a Fween sequence
		// Properties
		this.hasStarted = false;
		this.hasCompleted = false;
		this.timeStart = 0.0;
		this.timeEnd = 0.0;
	}
}
export class FweenSequence {
	// ================================================================================================================
	// CONSTRUCTOR ----------------------------------------------------------------------------------------------------
	constructor() {
		// One sequence of steps
		// Properties
		this._steps = [];
		this._stepsMetadatas = [];
		this._isPlaying = false;
		this._currentStep = 0;
		this._startTime = 0.0; // Absolute time it was started
		this._time = 0.0; // Current time, relative to start
		this._duration = 0.0; // Full interval duration of the sequence
		// Create a new Fween
	}
	// ================================================================================================================
	// PUBLIC INTERFACE -----------------------------------------------------------------------------------------------
	// Play control methods
	/**
	 * Play (or resume) the sequence
	 */
	play() {
		if (!this._isPlaying) {
			this._isPlaying = true;
			this._startTime = Fween.getTicker().getTime() - this._time;
			Fween.getTicker().add(this);
		}
		return this;
	}
	/**
	 * Pause the sequence at the current position
	 */
	pause() {
		if (this._isPlaying) {
			this._isPlaying = false;
			Fween.getTicker().remove(this);
		}
		return this;
	}
	/**
	 * Stop the sequence completely
	 */
	stop() {
		if (this._isPlaying) {
			this.pause();
			this.seek(0);
		}
		return this;
	}
	/**
	 * Set the current time for this sequence, in seconds
	 */
	seek(time) {
		this._time = time;
		this._startTime = Fween.getTicker().getTime() - this._time;
		const newStep = this.getStepForTime(this._time);
		// console.log("seeking to time " + time + ", step is " + newStep + " of " + this._stepsMetadatas.length + ", was " + this._currentStep);
		if (newStep !== this._currentStep) {
			// TODO: better treatment of .start/.end/.hasStarted/.hasCompleted when switching.. when going forward and backward....
			if (newStep < this._currentStep) {
				// Going back
				for (let i = newStep; i <= this._currentStep && i < this._stepsMetadatas.length; i++) {
					this._stepsMetadatas[i].hasCompleted = false;
					this._stepsMetadatas[i].hasStarted = false;
				}
			} else {
				// Going forward
				for (let i = this._currentStep; i < newStep; i++) {
					this._stepsMetadatas[i].hasCompleted = true;
					this._stepsMetadatas[i].hasStarted = true;
				}
			}
		}
		this._currentStep = newStep;
		this.update(true);
	}
	/**
	 * Return whether this sequence is playing or not
	 */
	isPlaying() {
		return this._isPlaying;
	}
	/**
	 * Returns the current time for this sequence, in seconds
	 */
	getTime() {
		return this._time;
	}
	/**
	 * Returns the duration of sequence, in seconds
	 */
	getDuration() {
		return this._duration;
	}
	// Utility methods
	/**
	 * Call a function
	 */
	call(func) {
		this.addStep(new FweenStepCall(func));
		return this;
	}
	/**
	 * Wait a number of seconds
	 */
	wait(duration) {
		this._duration += duration;
		return this;
	}
	// ================================================================================================================
	// PRIVATE INTERFACE ----------------------------------------------------------------------------------------------
	// Core tween step control methods; reused by subclasses
	addStep(step) {
		this._steps.push(step);
		const tweenMetadata = new FweenStepMetadata();
		tweenMetadata.timeStart = this._duration;
		this._duration += step.getDuration();
		tweenMetadata.timeEnd = this._duration;
		this._stepsMetadatas.push(tweenMetadata);
	}
	getStepForTime(time) {
		// Finds best step index for a tween at a specific time
		for (let i = 0; i < this._stepsMetadatas.length; i++) {
			if (this._stepsMetadatas[i].timeStart <= time && this._stepsMetadatas[i].timeEnd >= time) {
				return i;
			}
		}
		return 0;
	}
	update(force = false) {
		// Update current step(s) based on the time
		// Check if finished
		if (this._currentStep >= this._steps.length) {
			this.pause();
		} else {
			let shouldUpdateOnce = this._isPlaying || force;
			this._time = Fween.getTicker().getTime() - this._startTime;
			while (shouldUpdateOnce && this._currentStep < this._steps.length) {
				shouldUpdateOnce = false;
				if (this._time >= this._stepsMetadatas[this._currentStep].timeStart) {
					// Start the current tween step if necessary
					if (!this._stepsMetadatas[this._currentStep].hasStarted) {
						this._steps[this._currentStep].start();
						this._stepsMetadatas[this._currentStep].hasStarted = true;
					}
					// Update the current tween step
					this._steps[this._currentStep].update(map(this._time, this._stepsMetadatas[this._currentStep].timeStart, this._stepsMetadatas[this._currentStep].timeEnd, 0, 1, true));
					// Check if it's finished
					if (this._time >= this._stepsMetadatas[this._currentStep].timeEnd) {
						if (!this._stepsMetadatas[this._currentStep].hasCompleted) {
							this._steps[this._currentStep].end();
							this._stepsMetadatas[this._currentStep].hasCompleted = true;
							shouldUpdateOnce = true;
							this._currentStep++;
						}
					}
				}
			}
		}
	}
	getTransition(transition) {
		return transition == null ? Easing.none : transition;
	}
}
export class FweenGetterSetterSequence extends FweenSequence {
	// ================================================================================================================
	// CONSTRUCTOR ----------------------------------------------------------------------------------------------------
	constructor(targetGet, targetSet) {
		super();
		this._targetGet = targetGet;
		this._targetSet = targetSet;
	}
	// ================================================================================================================
	// PUBLIC INTERFACE -----------------------------------------------------------------------------------------------
	from(value) {
		this.addStep(new FweenStepValueFrom(this._targetSet, value));
		return this;
	}
	to(value, duration = 0, transition = null) {
		this.addStep(new FweenStepValueTo(this._targetGet, this._targetSet, value, duration, this.getTransition(transition)));
		return this;
	}
}
export class FweenObjectSequence extends FweenSequence {
	// ================================================================================================================
	// CONSTRUCTOR ----------------------------------------------------------------------------------------------------
	constructor(object) {
		super();
		this._targetObject = object;
	}
}
// Common steps
class FweenStepCall {
	// ================================================================================================================
	// CONSTRUCTOR ----------------------------------------------------------------------------------------------------
	constructor(func) {
		this._action = func;
	}
	// ================================================================================================================
	// PUBLIC INTERFACE -----------------------------------------------------------------------------------------------
	start() { }
	update(t) { } //eslint-disable-line
	end() {
		this._action();
	}
	getDuration() {
		return 0;
	}
}
// Steps for specific sequences: GetterSetter
class FweenStepValueFrom {
	// ================================================================================================================
	// CONSTRUCTOR ----------------------------------------------------------------------------------------------------
	constructor(targetSet, targetValue) {
		this._targetSet = targetSet;
		this._targetValue = targetValue;
	}
	// ================================================================================================================
	// PUBLIC INTERFACE -----------------------------------------------------------------------------------------------
	start() { }
	update(t) { } //eslint-disable-line
	end() {
		this._targetSet(this._targetValue);
	}
	getDuration() {
		return 0;
	}
}
class FweenStepValueTo {
	constructor(targetGet, targetSet, targetValue, duration, transition) {
		this._targetGet = targetGet;
		this._targetSet = targetSet;
		this._duration = duration;
		this._targetValue = targetValue;
		this._transition = transition;
	}
	// ================================================================================================================
	// PUBLIC INTERFACE -----------------------------------------------------------------------------------------------
	start() {
		this._startValue = this._targetGet();
	}
	update(t) {
		this._targetSet(map(this._transition(t), 0, 1, this._startValue, this._targetValue));
	}
	end() {
		this._targetSet(this._targetValue);
	}
	getDuration() {
		return this._duration;
	}
}
export class FweenTicker {
	// ================================================================================================================
	// CONSTRUCTOR ----------------------------------------------------------------------------------------------------
	constructor() {
		// Ticker class to control updates
		// Properties
		this.sequences = [];
		this.time = 0.0;
		this.updateBound = this.update.bind(this);
		this.updateBound();
	}
	// ================================================================================================================
	// PUBLIC INTERFACE -----------------------------------------------------------------------------------------------
	update() {
		window.requestAnimationFrame(this.updateBound);
		this.time = Date.now() / 1000;
		for (let i = 0; i < this.sequences.length; i++) {
			if (this.sequences[i] != null) {
				this.sequences[i].update();
			} else {
				this.sequences.splice(i, 1);
				i--;
			}
		}
	}
	getTime() {
		return this.time;
	}
	add(sequence) {
		this.sequences.push(sequence);
	}
	remove(sequence) {
		// Nullify first, remove later - otherwise it gets remove while doing Update(), which can cause the list to trip on itself
		const idx = this.sequences.indexOf(sequence);
		if (idx > -1)
			this.sequences[idx] = null;
	}
}
