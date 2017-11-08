/**
 * @author rmackin
 */

    
onClickDelete = function(id) {
	var idx = gRacePlan.findSegment(id);
    var origSeg = gRacePlan.segments[idx];
	gRacePlan.deleteSegment(id);
	for (var i = 0; i < gRacePlan.segments.length; i++) {
		if (origSeg.from == 0 && gRacePlan.segments[i].from == origSeg.to) {
			gRacePlan.segments[i].from = 0;
			break;
		} else if (origSeg.from == gRacePlan.segments[i].to) {
			gRacePlan.segments[i].to = origSeg.to;
		}
	}
	gRacePlan.sortSegements();
	gRacePlan.renderTable();
}
    
onClickEdit = function(id) {
	$('#message').removeClass('show');
	if (!$('#message').hasClass('hide'))
        $('#message').addClass('hide');
	var idx = gRacePlan.findSegment(id);
	var segment = null;
	var oldFrom = -1;
	var oldTo = -1;
	if (idx >= 0) {
		segment = gRacePlan.segments[idx];
		oldFrom = segment.from;
		oldTo = segment.to;
		$('#editboxtitle').html('Edit');
	} else {
		segment = new Segment(gRacePlan, -1, gRacePlan.lastAdded, gRacePlan.distance, gRacePlan.desiredif, "");
		$('#editboxtitle').html('Add');
	}
	$('#editFrom').val(segment.from);
	$('#editTo').val(segment.to);
    $('#editIf').val(segment.segmentif);
    $('#editDesc').val(segment.description);

	$('#edit').removeClass('hide');
	$('#edit').addClass('show');
	
	$('#editSave').unbind();
	$('#editCancel').unbind();
	$('#editSave').click(function(){
		      var errorString = "";
			  
			  var fromVal = parseFloat($('#editFrom').val());
			  if (isNaN(fromVal) || fromVal < 0.0 || fromVal >= gRacePlan.distance){
			  	errorString = errorString+"<br/>From must be between 0.0 and "+gRacePlan.distance;
			  }
			  
			  var toVal = parseFloat($('#editTo').val());
              if (isNaN(toVal) || toVal <= 0.0 || toVal > gRacePlan.distance){
                errorString = errorString+"<br/>To must be between 0.0 and "+gRacePlan.distance;
              }
			  
			  var ifVal = parseFloat($('#editIf').val());
              if (isNaN(ifVal) || toVal <= 0.0){
                errorString = errorString+"<br/>Intensity Factor must be greater than 0.0";
              }
			  
			  if (errorString.length > 0) {
			     $('#message').removeClass('hide');
                 $('#message').addClass('show');
				 $('#message').html(errorString);
			  } else {
			  	segment.from = parseFloat($('#editFrom').val());
			  	segment.to = parseFloat($('#editTo').val());
				gRacePlan.lastAdded = segment.to;  
			  	segment.segmentif = parseFloat($('#editIf').val());
			  	segment.description = $('#editDesc').val();
			  	if (idx >= 0 && oldFrom == segment.from && oldTo == segment.to) {
					gRacePlan.segments[idx] = segment;
				} else {
					// Treat a changed to or from limit as a new segment
			  		gRacePlan.addSegment(segment.from, segment.to, segment.segmentif, segment.description);
				}
			  	gRacePlan.renderTable();
			  }
			  $('#edit').removeClass('show');
              $('#edit').addClass('hide');
	});
	$('#editCancel').click(function(){
		      $('#edit').removeClass('show');
              $('#edit').addClass('hide');
	});
}

onclickSetGlobals =function() {
	if (!$('#message').hasClass('hide'))
         $('#message').addClass('hide');

	var oldDist = gRacePlan.distance;
	var newDist = parseFloat($('#globaldist').val());
	var desiredIf = parseFloat($('#globalif').val());
	
	
	 var errorString = "";
     if (isNaN(newDist) || newDist < 0.0){
        errorString = errorString+"<br/>Distance must be greater than 0.0";
     }
      
     if (isNaN(desiredIf) || desiredIf < 0.0){
        errorString = errorString+"<br/>Intensity Factor must be greater than 0.0";
     }      
     
     if (errorString.length > 0) {
         $('#message').removeClass('hide');
		 if (!$('#message').hasClass('show'))
            $('#message').addClass('show');
         $('#message').html(errorString);
		 return;
     }
	
	gRacePlan.setVi(parseFloat($('#globalvi').val()));
	gRacePlan.setDesiredif(desiredIf);
    gRacePlan.setFtp(parseFloat($('#globalftp').val()));
	gRacePlan.setDistance(newDist);

     
	// Reset all  on new race distance
	if (oldDist != newDist) {
		gRacePlan.segments = [];
		gRacePlan.addSegment(0.0, newDist, desiredIf, "");
	}
    gRacePlan.renderEventNp();
	gRacePlan.renderTable();
};
	
function Segment(parent, id, from, to, segmentif, description) {
	this.parent = parent;
	this.id = id;
	this.from = from;
	this.to = to;
	this.segmentif = segmentif;
	this.description = description;
	
	this.toHtml = function() {
		var self = this;
		var segmentDist = this.to - this.from;
		var segmentNp = (this.segmentif*this.parent.ftp);
		var segmentAveP;
		if (this.parent.vi == 0)
			segmentAveP = 0.0;
		else 
			segmentAveP = (segmentNp/this.parent.vi);
			
		var content = "<td>"+this.from+"</td>"+
					  "<td>"+this.to+"</td>"+
                      "<td>"+this.description+"</td>"+
                      "<td>"+(100*(segmentDist/this.parent.distance)).toFixed(2)+"</td>"+
					  "<td>"+this.segmentif+"</td>"+
					  "<td>"+segmentNp.toFixed(0)+"</td>"+
					  "<td>"+segmentAveP.toFixed(0)+"</td>";
					  
		/*
		var deleteButton = "<button id='delete" + id + "'>Delete</button>";
        var editButton =   "<button id='edit" + id + "'>Edit</button>";
        */
		
		var deleteButton = "<img src='img/Delete.png' id='delete" + id + "' alt='delete' title='delete'/>";
        var editButton =   "<img src='img/Modify.png' id='edit" + id + "' alt='edit' title='edit'/>";
		content = content+"<td>"+editButton+deleteButton+"</td>";

		return content;
	};

}

function RacePlan() {
	this.distance = 10;
	this.desiredif = 1.0;
	this.ftp  = 1.0;
	this.vi = 1.0;
	this.units = 'Km';
	this.maxId = 0;
    this.np = 0;
	this.lastAdded = 0.0;
	
	this.segments = [];
	
	this.setDistance = function(dist) {
		this.distance = dist;
	};
	
	this.setFtp = function(ftp) {
        this.ftp = ftp;
        this.np = this.ftp*this.desiredif;
    };
	
	this.setVi = function(vi) {
        this.vi = vi;
    };
	
	this.setUnits = function(units) {
        this.units = units;
    };
	
	this.setDesiredif = function(desiredif) {
		this.desiredif = desiredif;
        this.np = this.ftp*this.desiredif;
	};

	
	this.toHtml = function() {
		var html = "";
		for (var i=0; i < this.segments.length; i++) {
			html = html+"<tr>"+this.segments[i].toHtml()+"</tr>";
		}
		return html;
	};
	
	this.findSegment = function(id) {
		segIdx = -1;
		if (id < 0)
		  return segIdx;
		  
		for (var i = 0; i < this.segments.length; i++) {
            if (id == this.segments[i].id) {
				segIdx = i;
				break;
			}
        }
		return segIdx;
	};
	
	this.deleteSegment = function(id) {
		var idx = this.findSegment(id);
		if (0 == idx) {
			if (1 == this.segments.length)
			     this.segments = [];
			else
			     this.segments = this.segments.slice(1)
		} else if (idx > 0) {
			this.segments = this.segments.slice(0,idx).concat(this.segments.slice(idx+1, this.segments.length));
		}
	};
	
	/*        
	 * This splits up segments to prepare for an addition. Should be done on a copy of the original list
	 * Note: after this method, we still need to insert the new segment
    */
	this.splitSegment = function(newSeg, origSeg) {
		var idx = this.findSegment(origSeg.id);
		var start = newSeg.from;
		var end = newSeg.to;
		
		// quick exit if no overlap
		if (start > origSeg.to || end < origSeg.from) {
			return;
		} 
		
        var toAdd;
		if (start == origSeg.from && end == origSeg.to) {
			// exact match. Delete whole segment
			this.deleteSegment(origSeg.id);
		} else if (start >= origSeg.from && end <= origSeg.to) {
			  // Entirely contained in segment. Create slot depending on split points
			  this.deleteSegment(origSeg.id);
              if (start > origSeg.from) {
			  	    toAdd = new Segment(this, this.maxId++, origSeg.from, start, 
					                           origSeg.segmentif, origSeg.description);
                    this.segments.push(toAdd);
              }
              if (end < origSeg.to) {
			  	    toAdd = new Segment(this, this.maxId++, end, origSeg.to, 
                                               origSeg.segmentif, origSeg.description);
                    this.segments.push(toAdd);
              }
		} else if (start > origSeg.from) {
			toAdd = new Segment(this, this.maxId++, origSeg.from, start, 
			                            origSeg.segmentif, origSeg.description);
		    this.segments.push(toAdd);
			origSeg.from = start;
		} else if (end < origSeg.to) {
			toAdd = new Segment(this, this.maxId++, end, origSeg.to,  
                                        origSeg.segmentif, origSeg.description);
            this.segments.push(toAdd);
            origSeg.to = end;
		}
		
		return;
	};
	
	this.addSegment = function(from, to, segmentif, description) {
		// Keep within race bounds ... don't bother with errors
		if (from < 0.0)
		  from = 0.0;
		if (to > this.distance)
		  to = this.distance;
		var segId = this.maxId++;
		var newSegment = new Segment(this, segId, from, to, segmentif, description);
		
		// Need to work on a copy of the array, since we'll modify in place
		var copyArray = this.segments.slice(0);
		for (var i = 0; i < copyArray.length; i++) {
			this.splitSegment(newSegment, copyArray[i]);
		}
		
		// delete any segments entirely within this 
		var todelete = [];
		for (var i = 0; i < this.segments.length; i++) {
			var seg = this.segments[i];
			if (seg.from >= from && seg.to <= to) {
			    todelete.push(seg.id);
			}
		}
		
		for (var i = 0; i < todelete.length; i++) {
			this.deleteSegment(todelete[i]);
		}
		
		this.segments.push(newSegment);
		this.sortSegements();
	};
	
	this.renderTable = function() {
		tableHtml =  "<table id='segments'>"+
                "<thead><tr><th>From</th><th>To</th><th>Description</th>"+
                "<th>% of Race</th><th>Segment IF</th><th>NP</th>"+
                "<th>AveP</th><th></th></tr></thead><tbody>"+this.toHtml()+
				"</tbody></table>";
		$("#plan").html(tableHtml);
		$("tr:nth-child(odd)").addClass("odd");
		$("thead tr").removeClass("odd");

		// Bind click handlers
		for (var i=0; i < this.segments.length; i++) {
			var segment = this.segments[i];
			var segId = segment.id;
			$("#edit"+segId).unbind();
			$("#delete"+segId).unbind();
			$("#edit"+segId).click(this.clickEditHandler(segId));
			$("#delete"+segId).click(this.clickDeleteHandler(segId));
		}
		
		var eventIF = this.calcEventIF();
		var eventAveP;
		if (this.vi == 0.0)
			eventAveP = 0.0;
		else
			eventAveP = eventIF*this.ftp/this.vi;
		$("#eventIF").html("Event Intensity Factor(IF) is "+eventIF.toFixed(2));
        $("#eventNP").html("Event Normalized Power (NP) is "+(eventIF*this.ftp).toFixed(0));
        $("#eventAveP").html("Event Average Power (AveP) is "+eventAveP.toFixed(0));
	};
	
    this.renderEventNp = function() {
     $('#globalnp').val(this.np.toFixed(2));
    };
    
	this.calcEventIF = function() {
		var eventIF =0.0;
		for (var i = 0; i < this.segments.length; i++) {
			eventIF = eventIF + this.segments[i].segmentif*((this.segments[i].to-this.segments[i].from)/this.distance);
		}
		
		return eventIF;
	};
	
	this.clickEditHandler = function(id) {
		var segId = id;
		return function(){onClickEdit(segId);}
	};
	
	this.clickDeleteHandler = function(id) {
        var segId = id;
        return function(){onClickDelete(segId);}
    };
	
	this.sortSegements = function() {
		 this.segments.sort(function sortfunction(a, b){
            if (a.from == b.from) 
                return 0;
            else if (a.from > b.from)
                return 1;
            else 
                return -1;
            });
	};
}


function init(){
	window.gRacePlan = new RacePlan();
	gRacePlan.setDistance(100.0);
	$('#globaldist').val(100.0);
	gRacePlan.setFtp(200);
	$('#globalftp').val(200.0);
	gRacePlan.setDesiredif(0.95);
	$('#globalif').val(0.95);
	gRacePlan.setVi(1.1);
	$('#globalvi').val(1.1);

	gRacePlan.addSegment(0.0, gRacePlan.distance, gRacePlan.desiredif, "");
    gRacePlan.renderEventNp();
	gRacePlan.renderTable();
	
	$('#edit').addClass('hide');
	$("#globalUpdate").click(onclickSetGlobals);
    
    $("#printbtn").click(function() {window.print();});
	
    $('#helptitle').qtip({
            content: 'This Power Pacing tool is useful for planning long Time Trial type cycling events (e.g. The bike segment in Half or Full Iron distance events). It allows you to segment the ride into different parts with different intensity goals for each, while showing you the impact of these segments on your final Intensity and Power numbers.',
            show: 'mouseover',
            hide: 'mouseout'
    });
    
    
	$('#helpftp').qtip({
            content: 'Enter your Functional Threshold Power (your best 1 hour steady state effort - or Best 1hr Normalized power.) ',
            show: 'mouseover',
            hide: 'mouseout'
    });
	
	$('#helpgif').qtip({
            content: 'Enter your Target intensity factor for the event based on how agressively/conservatively you would like to do the race/event. Goal Ironman Bike IF generally ranges from .68 to .76 (8-10hr IM racing for this upper IF of .76) Goal Half Ironman Bike IF ranges from .80-.86 ',
            show: 'mouseover',
            hide: 'mouseout'
    });

    $('#helpgnp').qtip({
            content: 'Computed Target Normalized Power',
            show: 'mouseover',
            hide: 'mouseout'
    });
    
    $('#helpvi').qtip({
            content: 'Enter what you believe your Variability Index (VI) will be during this event.  This should be a realistic estimation - not a goal VI.   The best way to get a realistic estimate is for you (or your coach) to look at your VI (in WKO+ software) of many solo steady effort rides that you have done on terrain similar to the terrain of your event.  The lower this number, the closer your normalized power will be to your Average power (VI = NP/AveP).',
            show: 'mouseover',
            hide: 'mouseout'
    });
	
	$('#helpsegments').qtip({
            content: 'Click on Add to add a new segment to this ride. To determine how you would like to segment this ride consider: 1. how agressively/conservatively you would like to ride/race at various parts (begginning, middle, end, or other).  2. What is the course like - are there significant hill climbs, Flats, headwind sections that warrent different power outputs?',
            show: 'mouseover',
            hide: 'mouseout'
    });
    
    $('#helpdist').qtip({
            content: 'Enter the event distance in miles or kilometers',
            show: 'mouseover',
            hide: 'mouseout'
    });
	
	$('#helpfrom').qtip({
            content: 'Enter the start point of this segment of the event',
            show: 'mouseover',
            hide: 'mouseout'
    });
	
    $('#helpto').qtip({
            content: 'Enter the end point of this segment of the event',
            show: 'mouseover',
            hide: 'mouseout'
    });	
	
	$('#helpsegif').qtip({
            content: 'Enter the Intensity Factor for this segment of the event',
            show: 'mouseover',
            hide: 'mouseout'
    }); 
	
	$('#helpdesc').qtip({
            content: 'Enter a description for this segment of the event',
            show: 'mouseover',
            hide: 'mouseout'
    });    
}

$(document).ready(function(){init();});

