
function showToolTip(e){
  e.stopPropagation();

  let target = e.target;
  let position = $(target).offset();

  let width = $(target).width();


  //find tooltip position 
  let tooltipPositionX = position.left;
  let tooltipPositionY = position.top;

 
  //get tip info 
  $('#tooltip-box').empty().append($(target).attr('data-tip'));


  //set tooltip position 
   $('#tooltip-box').css('top', tooltipPositionY-$('#tooltip-box').height()-5);
  $('#tooltip-box').css('left', tooltipPositionX);

  $('#tooltip-box').css('visibility', 'visible');
   $('#tooltip-box').css('opacity', 1);



}
function hideTooltip(e){
  e.stopPropagation();
  $('#tooltip-box').css('visibility', 'hidden');
   $('#tooltip-box').css('opacity', 0);


}

var pipeline_load = function(seq_name){

   $("#chart").empty();
  // var step = ['quality control of reads','read mapping', 'quality control after mapping','differential binding', 'peak calling','peak annotation','motif analysis',  'gene ontology analysis']
  var tableHeaders = ["Software","Description","Features","Strength","Limitation","Format_input","Format_output","Platform requirement","Link","Paper","RCR"];
  let name = seq_name;
  if(name==='WGBS'){
    name = "Bisulfite Sequencing";
  }
  if(name==='WGS'){
    name = "WGS (<a href='https://software.broadinstitute.org/gatk/best-practices/workflow?id=11145'>GATK best practices for calling germline SNPs + Indels</a>) ";
  }
  if(name==='WES'){
    name = "WES (<a href='https://software.broadinstitute.org/gatk/best-practices/workflow?id=11146'>GATK best practices for calling somatic SNVs + Indels</a>) ";
  }
  name = name.replace('_', " ");
  $(".pipeline-title").text('').append("Flowchart for <span style='color:coral;'>" + name + "</span>");

  $.getJSON("./data/" + seq_name + ".json")
    .done(function( data ) {


      $("#svgContainer svg path").remove();
      var Blocks = {};  
       
       for(let i= 0; i < data.length; i++){
          let name = data[i].step;
          let key = name.replace(/[^a-zA-Z0-9]/g,''); // steps 

          

          //already has the step, save datas to blcok {key : software, data : current data }
          if(Blocks.hasOwnProperty(key)){
            Blocks[key].push_data(data[i], data[i].Software);
            let parent = Blocks[key].parent;
            if(parent !== ""){
              Blocks[parent].push_data(data[i], data[i].Software);
            }
          }

          else{

            //set a block key as step name
            Blocks[key] = new Block(name, data[i].order, data[i].parent, data[i].nextStep, data[i].nextStepCount, seq_name);

            let parent = Blocks[key].parent;
            //subSteps 
            if(parent !== ""){
                Blocks[parent].push_data(data[i], data[i].Software);

                //count direct next sub steps 
                if(Blocks[key].order.includes(".1")){
                  Blocks[parent].subStepCount++; 
                }


            }

            //get software info fields 
            Blocks[key].set_fields(Object.keys(data[i]), 5);

            //push software data relate to step
            Blocks[key].push_data(data[i], data[i].Software);
          }




       }

       
       for(let key in Blocks){
       
          Blocks[key].render();
        


          //bind button event 
           (function(id, target){
            
          $("#main #" + id).click(function(){

              target.makeTable();
              $(".table-info-text").empty().append("<ul><li>Scroll to the right to see more columns.</li><li>Packages for current analysis step are ranked based on <a href=\"https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5012559/\">Relative Citation Ratio (RCR)</a>.</li> <li>More evaluations are summarized in the Features, Strength, and Limitation columns, based on review articles and methods comparison papers. </li></ul>");

            $(".table-row").show();
            var table;

            //destroy table
            if($('#table thead').length !== 0){
               table =  $('#table').DataTable();
               table.destroy();

            }


             

             //build table 
              $("#table").empty().append(target.table);

              $('#table th span, #table td span').hover(showToolTip, hideTooltip);

                $('#table tfoot th').each( function () {
                    var title = $(this).text();
                    $(this).html( '<input type="text" placeholder="Search '+title+'" />' );
                } );


                //remove empty columns
                let empty_check = [];


                //check that it is not required field
                $("#table tr:first th").each(function(index, value){
                  if(tableHeaders.indexOf($(value).text()) === -1){
                      empty_check.push(index+1);
                  }
                  
                });

               
               //check that it need to be removed
                let removed = [];
                for(let c = 0; c < empty_check.length;c++){
                    let should_remove = true; 
                    $("#table tbody tr td:nth-child(" + empty_check[c] + ")").each(function(index,value){
                            if($(value).text() !== "-"){
                             
                                should_remove = false;
                            }
                    });
                   
                    removed.push(should_remove);
                }


                //remove that column
                let removeCount = 0;
                for(let r = 0; r < removed.length;r++){

                    if(removed[r]){
                        $('table tr').find('td:nth-child('+(empty_check[r]-removeCount)+ ')'+',th:nth-child('+(empty_check[r]-removeCount)+')').remove();
                        target.remove_field(empty_check[r]-removeCount);
                        removeCount++;
                    }
                }


                //["software","description","features",
                //"strength","RCR", "limitation","format_input",
                //"format_output","platform requirement","link","paper"]
                //console.log(target);
              table = $("#table").DataTable({
                 
                  "destroy": true,
                 "paging": false,
                 "info": false,
                 "scrollX": true,
                 scrollCollapse: true,
                  columnDefs: [
                      { width: 100, targets: 4 }
                  ],
                  fixedColumns: true,
                   "order": [[ 4, "desc" ]],


               });
             
              
            
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
              



              //button css
               if(target.parent !== ""){
               $(".block-button").removeClass("block-button-selected");
                $(".block-button").removeClass("sub-button-selected");

                 $("#" + id).addClass("sub-button-selected");
              }
              else{

               $(".block-button").removeClass("block-button-selected");
                $(".block-button").removeClass("sub-button-selected");
             
               $("#" + id).addClass("block-button-selected");
                
              }       
             
            
            //Sub button showing event 
            if(target.subStepCount !== 0){

                  //show subSteps
                  if($("div[id^=\'" + seq_name + "-" + target.orderNumber + "." + "\']").css('display') ==='none'){
                     $("#svgContainer svg path").remove();
                    target.nextStep = target.orderNumber + "." + 1;
                     target.nextStepCount =  target.subStepCount;

                     //margin substeps that has more than one
                     if( target.nextStepCount > 1){
                           $("div[id^=\'" + seq_name + "-" + target.orderNumber + "."  + "\']").css('margin-right', '150px');
                     }


                     //redraw flow chart
                    $("div[id^=\'" + seq_name + "-" + target.orderNumber + "."  + "\']").slideDown('slow', function(){
                             $("#" + id).addClass("hassub-button-selected");
                           
                            resetSVGsize("#main");
                            connectAll(seq_name, Blocks, "#main");
                    });
                   
                  }

                  //hide subSteps
                  else{
                         $("#svgContainer svg path").remove();
                    //get last substeps 
                     let lastSubId = $("div#chart div[id^=\'" + seq_name + "-" + target.orderNumber + "." + "\']:last .block button").attr('id');
                    target.nextStep = Blocks[lastSubId].nextStep;
                     target.nextStepCount = Blocks[lastSubId].nextStepCount;
                    
                     //redraw flow  chart 
                    $("div[id^=\'" + seq_name + "-" + target.orderNumber + "." + "\']").slideUp('slow', function(){
                                 $(".block-button").removeClass("block-button-selected");
                               $("#" + id).removeClass("hassub-button-selected");
                               
                             $(".table-row").hide();
                              resetSVGsize("#main");
                              connectAll(seq_name, Blocks, "#main");
                    });
                    
                   
                  }


            }
          
        

        });
        })(key, Blocks[key]);
        
       }



             //window resize event
             $(window).off();
                $(window).resize(function(){
                     $("#main #svgContainer svg path").remove();
                   
                    resetSVGsize("#main");
                    connectAll(seq_name, Blocks, "#main");

                    if($(window).width() < 900){
                       $("#main .chart-row").removeClass("justify-content-center");

                    }
                    else{
                        $("#main .chart-row").addClass("justify-content-center");
                    }
                });

         $("#chart-button").off();
          $("#chart-button").click(function(e){
              e.stopPropagation();
        

              $(".block-button").removeClass("block-button-selected");
            
            //show chart
            $("#chart").toggle('slow',function(){

              if($("#chart").css('display') !== 'none'){
                $("#chart-button").text("Hide analysis flow chart");
                $("#chart-button").removeClass("btn-outline-success");
                $("#chart-button").addClass("btn-success");


                 
              }
              else{
                $("#chart-button").text("Show analysis flow chart");
                $("#chart-button").removeClass("btn-success");
                $("#chart-button").addClass("btn-outline-success");
                  $(".block-button").removeClass("btn-primary");
                    $(".block-button").addClass("btn-outline-primary");
                 $(".table-row").hide();
               
               


              }

            });


            //draw paths
             $("#svgContainer").toggle('slow', function(){

                  resetSVGsize("#main");
                  connectAll(seq_name, Blocks, "#main");

            });

             //intro
             if(!localStorage.getItem('intro_shown')){
              let offset = $(".introjs-showElement").offset();
                  let introwidth = $(".introjs-showElement").width();
                  let introheight = $(".introjs-showElement").height();
                  $('.introjs-helperLayer').css('left', offset.left);
                  $('.introjs-helperLayer').css('top', offset.top);
                  $('.introjs-helperLayer').height(introheight+10);
                  $('.introjs-helperLayer').width(introwidth+10);

                  $('.introjs-tooltipReferenceLayer').css('left', offset.left);
                  $('.introjs-tooltipReferenceLayer').css('top', offset.top);
                  $('.introjs-tooltipReferenceLayer').height(introheight+10);
                  $('.introjs-tooltipReferenceLayer').width(introwidth+10);

                  $('.introjs-tooltip').css('bottom', introheight+10);
                  $('.introjs-arrow').removeClass('left').addClass('bottom');
             }


              

          });
          
     
    });

};

  
function connectAll(seq_name, Blocks, layout){
 
    let currentLayout = $(layout);
  // console.log(currentLayout.height());

   if(typeof currentLayout.height() !== 'undefined' && currentLayout.height() !== 0){

     let i = 1; //unique id for path 
    for(let key in Blocks){

      

      if(Blocks[key].nextStep !== "" && $("div[id=\'" + Blocks[key].order + "\']").css('display') !== 'none'){
     
        let nextBlock = $(layout + " div[id=\'" + seq_name + "-" + Blocks[key].nextStep.toString() + "\'] .block:first");
      

        //connect each top blocks to bottom blocks 
        for(let j = 0; j < Blocks[key].nextStepCount; j++){
          //append path
          $(layout + " #svgContainer svg").append("<path id=\'path" + i + "\'/>");

          //reset svg container
          $(layout + " #svgContainer").html($("#svgContainer").html());
         
          //connect
          connectElements($(layout + " #svg-pipe"), $(layout + " #path" + i), $(layout + " #" +key), nextBlock.find(".arrowTarget") , layout);
          

          nextBlock = nextBlock.next(); //find next target block 
          
          i++; // path id 
        }
        
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
     $(".table-row").hide();
      
       $("#chart-button").removeClass("btn-success");
       $("#chart-button").addClass("btn-outline-success");

      $(".tree-field").delay('850').slideDown('slow',function(){

        if(!localStorage.getItem('intro_shown')){
          let offset = $(".introjs-showElement").offset();
                  let introwidth = $(".introjs-showElement").width();
                  let introheight = $(".introjs-showElement").height();
                  $('.introjs-helperLayer').css('left', offset.left);
                  $('.introjs-helperLayer').css('top', offset.top);
                  $('.introjs-helperLayer').height(introheight+10);
                  $('.introjs-helperLayer').width(introwidth+10);

                  $('.introjs-tooltipReferenceLayer').css('left', offset.left);
                  $('.introjs-tooltipReferenceLayer').css('top', offset.top);
                  $('.introjs-tooltipReferenceLayer').height(introheight+10);
                  $('.introjs-tooltipReferenceLayer').width(introwidth+10);

                  $('.introjs-tooltip').css('bottom', introheight+10);
    
                  $('.introjs-arrow').removeClass('left').addClass('bottom');

        }

   
                
      });
     
 });


    
} );
