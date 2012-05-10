// Byoyomi timer implementation based on timer prototype

function ByoyomiTimer(game, timer_settings) {
	this.init.call(this, game, timer_settings);
}

ByoyomiTimer.prototype = (function() {
	function F() {};
	F.prototype = timer_prototype;
	return new F();
})();

ByoyomiTimer.prototype.validate_settings = function(timer_settings) {
	if (timer_settings.main_time == undefined) {
		throw new Error("Invalid time: Byoyomi without main_time property.");
	}
	if (timer_settings.periods == undefined) {
		throw new Error("Invalid time: Byoyomi without periods.");
	}
	if (timer_settings.period_time == undefined) {
		throw new Error("Invalid time: Byoyomi without period time.");
	}
};

ByoyomiTimer.prototype.configure_timer = function(timer_settings) {
	var remain = {};
	remain[BLACK] = {
		main_time: timer_settings.main_time,
		periods: timer_settings.periods,
		period_time: timer_settings.period_time,
	};
	remain[WHITE] = {
		main_time: timer_settings.main_time,
		periods: timer_settings.periods,
		period_time: timer_settings.period_time,
	};
	this.set_remain(remain);
};

ByoyomiTimer.prototype.configure_system = function(timer_settings) {
	this.system.name = "Byoyomi";
	this.system.main_time = timer_settings.main_time;
	this.system.periods = timer_settings.periods;
	this.system.period_time = timer_settings.period_time;
	this.system.zero_time = {
		main_time: 0,
		periods: 0,
		period_time: 0,
	};
};

ByoyomiTimer.prototype.copy_time = function(time_ref) {
	return {
		main_time: time_ref.main_time,
		periods: time_ref.periods,
		period_time: time_ref.period_time,
	};
};

ByoyomiTimer.prototype.substract_time = function(target, color, time_to_substract) {
	// Always remove time from main_time, even if it would be negative afterwards
	target[color].main_time -= time_to_substract;

	// Delegate extra removed time from main_time to period_time.
	if (target[color].main_time < 0) {
		target[color].period_time += target[color].main_time;
		target[color].main_time = 0;
	}

	// If the time is less than zeor, attempt to add periods
	while(target[color].period_time <= 0 && target[color].periods > 1) {
		target[color].periods--;
		target[color].period_time += this.system.period_time;
	}
};

ByoyomiTimer.prototype.pause_adjustments = function(target) {
	// If remain time is greater than zero, but we've used periods, force to the period time.
	if (target.period_time > 0 && target.periods <= this.system.periods) {
		target.period_time = this.system.period_time;
	}
};

ByoyomiTimer.prototype.is_time_up = function(time) {
	return time.period_time <= 0;
};
