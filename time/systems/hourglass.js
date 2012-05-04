// Hourglass timer implementation based on timer prototype

function HourglassTimer(game, timer_settings) {
	this.init.call(this, game, timer_settings);
}

HourglassTimer.prototype = (function() {
	function F() {};
	F.prototype = timer_prototype;
	return new F();
})();

HourglassTimer.prototype.validate_settings = function(timer_settings) {
	if (timer_settings.main_time == undefined) {
		throw new Error("Invalid time: Hourglass without main_time property.");
	}
	if (typeof timer_settings.main_time !== "number" || parseInt(timer_settings.main_time, 10) != timer_settings.main_time) {
		throw new Error("Main time parameter must be an integer indicating seconds.");
	}
};

HourglassTimer.prototype.configure_timer = function(timer_settings) {
	var remain = {};
	remain[BLACK] = timer_settings;
	remain[WHITE] = timer_settings;
	this.set_remain(remain);
};

HourglassTimer.prototype.configure_system = function(timer_settings) {
	this.system.name = "Hourglass";
	this.system.main_time = timer_settings.main_time;
	this.system.zero_time = {
		main_time: 0,
	};
};

HourglassTimer.prototype.copy_time = function(time_ref) {
	return {
		main_time: time_ref.main_time,
	};
};

HourglassTimer.prototype.substract_time = function(target, color, time_to_substract) {
	target[color].main_time -= time_to_substract;
	target[this.opposite_color(color)].main_time += time_to_substract;
};

HourglassTimer.prototype.pause_adjustments = function(target) {
	var adj = 0;
	if (target.main_time < 10 && target.main_time > 0) {
		adj = 10 - target.main_time;
	}
	this.remain[this.actual_color].main_time += adj;
	this.remain[this.opposite_color(this.actual_color)].main_time -= adj;
};

HourglassTimer.prototype.is_time_up = function(time) {
	return time.main_time <= 0;
};

HourglassTimer.prototype.opposite_color = function(color) {
	return (color == WHITE ? BLACK : WHITE);
};
