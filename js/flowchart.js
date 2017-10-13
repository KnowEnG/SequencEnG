$(document).ready(function() {
    
	$("#chart").hide();

	var show_chart_one = true;
	$("#chart-button").click(function(){
		$("#chart").toggle('slow',function(){
			if(show_chart_one){
				$("#chart-button").text("hide chart");
				$("#chart-button").removeClass("btn-outline-success");
				$("#chart-button").addClass("btn-success");
				
				show_chart_one= false;
			}
			else{
				$("#chart-button").text("show chart");
				$("#chart-button").removeClass("btn-success");
				$("#chart-button").addClass("btn-outline-success");
          $(".block-button").removeClass("btn-primary");
            $(".block-button").addClass("btn-outline-primary");
				 $(".table-row").hide();
				show_chart_one = true;
			}
		});
		
	});

  $("#tree-button").click(function(){
       $("#main").slideUp('slow');
      $(".tree-field").delay('850').slideDown('slow');
  });

	var step = ['quality control of reads','read mapping', 'quality control after mapping','differential binding', 'peak calling','peak annotation','motif analysis',  'gene ontology analysis']

	var data = [];
	$.getJSON("./data/data.json")
    .done(function( data ) {

    	var Blocks = {};
       
       for(var i= 0; i < data.length; i++){
       		var key = data[i].step;

       		if(Blocks.hasOwnProperty(key)){
       			Blocks[key].push_data(data[i], data[i].software);
       		}

       		else{
       			Blocks[key] = new Block(key);

       			Blocks[key].set_fields(Object.keys(data[i]), 1);
       			Blocks[key].push_data(data[i], data[i].software);
       		}




       }

       


       for(var i = 0; i < step.length-4;i++){
       		Blocks[step[i]].render('');
      		 $("#chart").append(Blocks[step[i]].frame);
      		 Blocks[step[i]].renderArrow('darr', Blocks[step[i]].name);
       }

       Blocks[step[step.length-4]].render('');
        $("#chart").append( Blocks[step[step.length-4]].frame);
        Blocks[step[step.length-4]].renderArrow('searr',  Blocks[step[step.length-4]].name);
        Blocks[step[step.length-4]].renderArrow('darr',  Blocks[step[step.length-4]].name);
        Blocks[step[step.length-4]].renderArrow('swarr',  Blocks[step[step.length-4]].name);


    	 Blocks[step[step.length-3]].render('col-md-4');
    	  Blocks[step[step.length-2]].render('col-md-4 ml-auto mr-auto');
         Blocks[step[step.length-1]].render('col-md-4');



    	 $("#chart").append("<div class=\'row justify-content-md-center\'>"+ Blocks[step[step.length-3]].frame + Blocks[step[step.length-2]].frame +  Blocks[step[step.length-1]].frame + "</div>");


    	 for(var i = 0; i < step.length;i++){
    	 	var curr = step[i];
    	 	(function(id){
    	 		$("#" + id.replace(/\s/g,'')).click(function(){
            $(".block-button").removeClass("btn-primary");
            $(".block-button").addClass("btn-outline-primary");
    	 		Blocks[id].makeTable();
    	 	  $(".table-row").show();
    	 		$("#table").empty().append(Blocks[id].table);

            $('#table tfoot th').each( function () {
                var title = $(this).text();
                $(this).html( '<input type="text" placeholder="Search '+title+'" />' );
            } );

          var table = $("#table").DataTable({
             "destroy": true,
             "paging": false,
             "info": false,
             "scrollX": true
           });
    	 		 $("#" + id.replace(/\s/g,'')).removeClass("btn-outline-primary");
         $("#" + id.replace(/\s/g,'')).addClass("btn-primary");
    	 	
          table.columns().every( function () {
             var that = this;
     
            $( 'input', that.footer() ).on( 'keyup change', function () {
                if ( that.search() !== this.value ) {
                    that
                        .search( this.value )
                        .draw();
                }
        } );
    } );
        

        });
    	 	})(curr);
    	 	
    	 }

      
          

     
    });







    
} );