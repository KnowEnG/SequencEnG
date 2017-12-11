var pipeline_load = function(seq_name){

  // var step = ['quality control of reads','read mapping', 'quality control after mapping','differential binding', 'peak calling','peak annotation','motif analysis',  'gene ontology analysis']

  $.getJSON("./data/" + seq_name + ".json")
    .done(function( data ) {


      $("#svgContainer svg path").remove();
      var Blocks = {};  
       
       for(let i= 0; i < data.length; i++){
          let key = data[i].step;

          if(Blocks.hasOwnProperty(key)){
            Blocks[key].push_data(data[i], data[i].software);
          }

          else{

            //set a block key as step name
            Blocks[key] = new Block(key, data[i].order, data[i].parent, data[i].nextStep, data[i].nextStepCount, seq_name);

            if(Blocks[key].parent !== ""){
                let parent = Blocks[key].parent;

                if(Blocks[key].order.includes(".1")){
                  Blocks[parent].subStepCount++; 
                }
            }

            //get software info fields 
            Blocks[key].set_fields(Object.keys(data[i]), 5);

            //push software data relate to step
            Blocks[key].push_data(data[i], data[i].software);
          }




       }

       
       for(let key in Blocks){
       
          Blocks[key].render();


          
           (function(id){
            
          $("#" + id).click(function(){
            $(".block-button").removeClass("block-button-selected");
            $(".block-button").addClass("btn-outline-primary");
          Blocks[key].makeTable();
          $(".table-row").show();
          $("#table").empty().append(Blocks[key].table);

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
           $("#" + id).removeClass("block-button-selected");
         $("#" + id).addClass("block-button-selected");
        
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
        })(Blocks[key].id);
        
       }



        var show_chart_one = true;
         $("#chart-button").off();
          $("#chart-button").click(function(e){
              e.stopPropagation();

              $(".block-button").removeClass("block-button-selected");
            $("#svgContainer").toggle('slow', function(){
                  resetSVGsize();
                  connectAll(seq_name, Blocks);

            });
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

            
            
             

             $(window).off();
                $(window).resize(function(){
                     $("#svgContainer svg path").remove();
                    resetSVGsize();
                    connectAll(seq_name, Blocks);
                });
             
            
            });

           
            
          });
               

     
    });

};

  
function connectAll(seq_name, Blocks){

    let i = 1;
    for(let key in Blocks){
     
      if(Blocks[key].nextStep !== "" && Blocks[key].parent === ""){
        let childBlock = $("#" + seq_name + "-" + Blocks[key].nextStep.toString() + " .block:first");
      
        for(let j = 0; j < Blocks[key].nextStepCount; j++){
          $("#svgContainer svg").append("<path id=\'path" + i + "\'/>");
          $("#svgContainer").html($("#svgContainer").html());
          connectElements($("#svg1"), $("#path" + i), $("#" + Blocks[key].id), childBlock.find(".arrowTarget") );
          childBlock = childBlock.next();
          i++;
        }
        
      }
            
  }



}


$(document).ready(function() {
    
	 $("#chart").hide();
   $("#svgContainer").hide();
  $("#tree-button").click(function(){

       $("#main").slideUp('slow');
      $("#chart").hide();
       $("#svgContainer").hide();
    
       $("#chart-button").text("show chart");
       $("#chart-button").removeClass("btn-success");
       $("#chart-button").addClass("btn-outline-success");
      $(".tree-field").delay('850').slideDown('slow');
       $(".tree-button").show();
 });


    
} );