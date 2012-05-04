// Fischer timer implementation based on timer prototype

function FischerTimer(game, timer_settings) {
	this.init.call(this, game, timer_settings);
}

FischerTimer.prototype = (function() {
	function F() {};
	F.prototype = timer_prototype;
	return new F();
})();

FischerTimer.prototype.validate_settings = function(timer_settings) {
	if (timer_settings.main_time == undefined) {
		throw new Error("Invalid time: Fischer without main_time property.");
	}
	if (timer_settings.bonus == undefined) {
		throw new Error("Invalid time: Fischer without bonus property.");
	}
};

FischerTimer.prototype.configure_timer = function(timer_settings) {
	var remain = {};
	remain[BLACK] = {
		main_time: timer_settings.main_time,
	};
	remain[WHITE] = {
		main_time: timer_settings.main_time,
	};
	this.set_remain(remain);
};

FischerTimer.prototype.configure_system = function(timer_settings) {
	this.system.name = "Fischer";
	this.system.main_time = timer_settings.main_time;
	this.system.bonus = timer_settings.bonus;
	this.system.zero_time = {
		main_time: 0,
	};
};

FischerTimer.prototype.copy_time = function(time_ref) {
	return {
		main_time: time_ref.main_time,
	};
};

FischerTimer.prototype.substract_time = function(target, color, time_to_substract) {
	target[color].main_time -= time_to_substract;
};

FischerTimer.prototype.pause_adjustments = function(target) {
	target.main_time += this.system.bonus;
};

FischerTimer.prototype.is_time_up = function(time) {
	return time.main_time <= 0;
};
