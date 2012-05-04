// Absolute timer implementation based on timer prototype

function AbsoluteTimer(game, timer_settings) {
	this.init.call(this, game, timer_settings);
}

AbsoluteTimer.prototype = (function() {
	function F() {};
	F.prototype = timer_prototype;
	return new F();
})();

AbsoluteTimer.prototype.validate_settings = function(timer_settings) {
	if (timer_settings.main_time == undefined) {
		throw new Error("Invalid time: Absolute without main_time property.");
	}
};

AbsoluteTimer.prototype.configure_timer = function(timer_settings) {
	var remain = {};
	remain[BLACK] = timer_settings;
	remain[WHITE] = timer_settings;
	this.set_remain(remain);
};

AbsoluteTimer.prototype.configure_system = function(timer_settings) {
	this.system.name = "Absolute";
	this.system.main_time = timer_settings.main_time;
	this.system.zero_time = {
		main_time: 0,
	};
};

AbsoluteTimer.prototype.copy_time = function(time_ref) {
	return {
		main_time: time_ref.main_time,
	};
};

AbsoluteTimer.prototype.substract_time = function(target, color, time_to_substract) {
	target[color].main_time -= time_to_substract;
};

AbsoluteTimer.prototype.is_time_up = function(time) {
	return time.main_time <= 0;
};
