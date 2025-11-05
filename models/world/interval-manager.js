class IntervalManager {
	constructor() {
		this.intervals = new Map();
		this.nextId = 1;
	}

	start(callback, delay) {
		const id = this.nextId++;
		const timer = setInterval(callback, delay);
		this.intervals.set(id, timer);
		return id;
	}

	clear(id) {
		const timer = this.intervals.get(id);
		if (timer) {
			clearInterval(timer);
			this.intervals.delete(id);
		}
	}

	stopAll() {
		this.intervals.forEach(clearInterval);
		this.intervals.clear();
	}
}
