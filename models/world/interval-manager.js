/**
 * Lightweight wrapper around `setInterval` that tracks IDs for bulk cleanup.
 */
class IntervalManager {
	constructor() {
		this.intervals = new Map();
		this.nextId = 1;
	}

	/**
	 * Starts a tracked interval and returns its internal ID.
	 *
	 * @param {Function} callback
	 * @param {number} delay
	 * @returns {number}
	 */
	start(callback, delay) {
		const id = this.nextId++;
		const timer = setInterval(callback, delay);
		this.intervals.set(id, timer);
		return id;
	}

	/**
	 * Clears a previously started interval.
	 *
	 * @param {number} id
	 */
	clear(id) {
		const timer = this.intervals.get(id);
		if (timer) {
			clearInterval(timer);
			this.intervals.delete(id);
		}
	}

	/**
	 * Stops every tracked interval at once.
	 */
	stopAll() {
		this.intervals.forEach(clearInterval);
		this.intervals.clear();
	}
}
