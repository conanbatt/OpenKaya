var ST_STOPED = 0;
var ST_PAUSED = 1;
var ST_COUNTING = 2;
var BLACK = "B";
var WHITE = "W";

var timer_prototype = {
	init: function(time_manager, timer_settings) {
		// Validation
		if (!this.validate(timer_settings)) {
			return false;
		}

		// Initialization
		this.time_manager = time_manager;
		this.status = ST_PAUSED;

		// Configuration
		this.remain = {};
		this.configure_timer(timer_settings);

		this.system = {};
		this.configure_system(timer_settings);
	},

	// Validation
	validate: function(timer_settings) {
		if (timer_settings == undefined) {
			throw new Error('Must provide settings.');
		}
		if (typeof this.validate_settings === 'function') {
			this.validate_settings(timer_settings);
		}
		return true;
	},

	// Force a remaining time for a player.
	set_remain: function(remain) {
		if (remain != undefined) {
			if (remain[BLACK] != undefined) {
				this.remain[BLACK] = this.copy_time(remain[BLACK]);
			}
			if (remain[WHITE] != undefined) {
				this.remain[WHITE] = this.copy_time(remain[WHITE]);
			}
		}
	},

	// If it's not counting: update remain, color, last_resume and status, register interval, start!
	resume: function(color, remain) {
		if (this.status == ST_PAUSED) {
			this.set_remain(remain);
			this.actual_color = color;
			this.status = ST_COUNTING;
			this.last_resume = new Date();
			this.clock = window.setInterval(this.binder(this.tick, this), 100);
			this.tick(true);
		}
	},

	// If it's counting: update last_pause, status and remain. Clear interval.
	pause: function(do_adjustment) {
		if (this.status == ST_COUNTING) {
			this.last_pause = new Date();
			window.clearInterval(this.clock);
			this.status = ST_PAUSED;

			// Reference the player remaining time
			var remain_color = this.remain[this.actual_color];

			// Substract corresponding time
			var time_to_substract = (this.last_pause - this.last_resume) / 1000;
			this.substract_time(this.remain, this.actual_color, time_to_substract);

			// Do pause adjustments
			if (do_adjustment) {
				this.pause_adjustments(remain_color);
			}

			return this.remain;
		}
		return false;
	},

	// Stop, clear everything up, update remain from arguments.
	stop: function(remain) {
		window.clearInterval(this.clock);
		this.set_remain(remain);
		this.actual_color = null;
		this.last_resume = null;
		this.last_pause = null;
		this.status = ST_STOPED;
	},

	adjust: function(adjustment) {
		if (this.status != ST_STOPED) {
			// Substract corresponding time
			this.substract_time(this.remain, this.actual_color, Number(adjustment));
		}
	},

	// This handles the interval callback, creates a remain estimation and updates the clocks.
	// if remaining time reaches 0, client announces loss to server.
	tick: function(no_draw) {
		// Copy remaining time
		var remain_copy = {};
		remain_copy[BLACK] = this.copy_time(this.remain[BLACK]);
		remain_copy[WHITE] = this.copy_time(this.remain[WHITE]);

		// Reference actual color from copy
		var actual_color_remain_copy = remain_copy[this.actual_color];

		// Substract time to the copy
		var time_to_substract = (new Date() - this.last_resume) / 1000;
		this.substract_time(remain_copy, this.actual_color, time_to_substract);

		// Draw the clocks with info from the copy
		if (!no_draw) {
			this.time_manager.draw(remain_copy);
		}

		// If the copy says that time is up, announce
		if (this.is_time_up(actual_color_remain_copy)) {
			this.pause();
			this.time_loss();
		}
	},

	// Time is up, reset clock to Zero and announce time loss.
	time_loss: function() {
		// Configure zero time remain to actual player
		var remain = {}
		remain[this.actual_color] = this.system.zero_time;

		// Set it
		this.set_remain(remain);

		// Announce time loss
		this.time_manager.announce_time_loss(this.remain);
	},

	// Binding helper
	binder: function (method, object, args) {
		return function(orig_args) { method.apply(object, [orig_args].concat(args)); };
	},

	// System specific methods: OVERRIDE!
	        configure_timer: function(timer_settings) {},
	       configure_system: function(timer_settings) {},
	      validate_settings: function(timer_settings) {},
	          validate_time: function(time) {},
	              copy_time: function(time_ref) {},
	         substract_time: function(target, color, time_to_substract) {},
          pause_adjustments: function(target) {},
	             is_time_up: function(time) {},
};
