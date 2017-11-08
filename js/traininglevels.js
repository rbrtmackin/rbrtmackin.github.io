function TrainingLevels() {
	this.averagePower = 0.0;
	this.functThresholdPower = 0.0;
	this.thresholds = [0.0, 0.0, 0.0, 0.0,
		               0.0, 0.0, 0.0];
	this.factors = [0.0, 0.55, 0.75, 0.90,
					1.05, 1.2, 1.5];
	this.updateCallback = null;
	
	this.setUpdatecallback = function(fn) {
		this.updateCallback = fn;
	};
	
	this.calc = function() {
		for (var i = 0; i < this.factors.length; i++) {
			this.thresholds[i] = Math.round(this.functThresholdPower * this.factors[i]);
		}
		if (this.updateCallback) {
			this.updateCallback(this);
		}
	}
	
	this.setAveragePower = function(power) {
		this.averagePower = power;
		this.functThresholdPower = Math.round(power*0.95);
		this.calc();
	}
	
	this.setFunctThreshPower = function(power) {
		this.functThresholdPower = power;
		this.averagePower = Math.round(power/0.95);
		this.calc();
	}
}

function updateView() {
	$("#avgpower").val(window.gTrainingLevels.averagePower);
	$("#ftpower").val(window.gTrainingLevels.functThresholdPower);

	for (var i = 0; i < window.gTrainingLevels.thresholds.length; i++) {
		var id = "#level"+(i+1)+"valL";
		$(id).html(window.gTrainingLevels.thresholds[i]);
		if (i < window.gTrainingLevels.thresholds.length-1) {
			id = "#level"+(i+1)+"valH";
			$(id).html(window.gTrainingLevels.thresholds[i+1]);
		}
	}
}

function init() {
	window.gTrainingLevels = new TrainingLevels();
	window.gTrainingLevels.setUpdatecallback(updateView);
	$("#avgpower").val("0");
	$("#ftpower").val("0");

	$(".numberEntry").numeric();
	 $('#avgpower').keyup(function() {
	    var val = parseFloat($("#avgpower").val());
		if (isNaN(val)) {val=0.0;}
		window.gTrainingLevels.setAveragePower(val);
	});
	 $('#ftpower').keyup(function() {
		var val = parseFloat($("#ftpower").val());
		if (isNaN(val)) {val=0.0;}
		window.gTrainingLevels.setFunctThreshPower(val);
	});
	
	 $('#helpavgpwr').qtip({
            content: 'Enter your average power for a steady 20 minute time trial',
            show: 'mouseover',
            hide: 'mouseout'
    });
	 $('#helpftp').qtip({
            content: 'Enter your Functional Threshold Power (your best 1 hour steady state effort - or Best 1hr Normalized power.) ',
            show: 'mouseover',
            hide: 'mouseout'
    });
	$("#printbtn").click(function() {window.print();});

}

$(document).ready(function(){init();});
