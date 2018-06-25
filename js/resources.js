//pipeline system buttons
$('.pipeline-systems button').click(function(){


	$("#chart").empty();
	$("#svgContainer svg path").remove();
	$(".pipelines-selection").show();
	

	let systemName = $(this).text();
	let a = ['A','E','I','O', 'U'].indexOf(systemName.charAt(0))!==-1?'an':'a';
	$(".pipeline-title").empty().append("Select " + a + " <span style='color:coral;'> " + systemName + "</span> pipeline")
	$.get('./data/'+ systemName + '/' + systemName + '-list.txt').done(function(data){
			
			let target = $('#select-resource-pipelines');

			let names_links = data.split('\n');

			let lists = names_links[0].split(',');
			let links = names_links[1].split(',');


			target.slideUp(function(){
				target.empty();

				for(let i = 0; i < lists.length;i++){

					let name  = lists[i];
					let id = name.replace(/[^a-zA-Z0-9\-]/g,'');

					if(name.includes('200bp')){
						if(name.includes("longer")){
							name = "RNA-seq (transcripts &gt; 200bp)"
						}
						if(name.includes("shorter")){
							name = "RNA-seq (transcripts &le; 200bp)"
						}
					}

					target.append("<div class = 'col-12 col-md-3'><button class='btn btn-outline-success' id = "
									+ id + ">" + name + "</button></div>");


				}
				if(systemName==='Cistrome'){
					$(".pipelines-selection").hide();
				}
				

			}).slideDown('slow', function(){


				for(let i = 0; i < lists.length;i++){

					let seq_name  = lists[i];
					let link = links[i];
					let seq_id = seq_name.replace(/[^a-zA-Z0-9\-]/g,'');
					$("#" + seq_id).click(function(){

						$(".curr-pipeline").text(seq_name);
						$("#chart").empty();
						$("#svgContainer svg path").remove();
					
						$.get('./data/'+ systemName + '/' + seq_id +'.json').done(function(data){
								
								//make Blocks using data 
								let Blocks = {};
								for(let i = 0; i < data.length;i++){

									let stepName = data[i].step.replace(/[^a-zA-Z0-9]/g,'');
									let currBlock = new Block(data[i].step, data[i].order, data[i].parent, data[i].nextStep, data[i].nextStepCount, seq_id);
									let softwares = data[i].Software;
									let position = data[i].Position;
									currBlock.render();
									Blocks[stepName] = currBlock;
									

									//shifting block
									if(typeof data[i].Shift !== 'undefined'){
										$("#" + seq_id + "-" + data[i].order).removeClass("justify-content-center").addClass("justify-content-" + data[i].Shift);
									}

									

										$("#" + stepName).click(function(){

											let container = $("#" + stepName + "-container .row");
											let clicked = $("#" + stepName + "-container .row > .resource-tooltip");
											let tooltipPostion = "right";
											
											if(!clicked.length && softwares !== ""){
												switch(position){

													case "right":
														container.append("<div class='resource-tooltip resource-tooltip-right'>"+ analyzeValueInString(softwares) + "</div>");
														tooltipPostion = 'left';
														break;

													//left 
													default:
														container.append("<div class='resource-tooltip resource-tooltip-left'>"+ analyzeValueInString(softwares) + "</div>");
														break;
												}


											let buttonWidth =(($("#" + stepName + "-container .row").width()/2) + $("#" + stepName + "-container .row > button").width()/2 + 20) + 'px';


											$("#" + stepName + "-container .row > .resource-tooltip").css(tooltipPostion, buttonWidth).fadeIn('slow');


											}

											else{

												if(clicked.css('display') === 'none'){
														clicked.fadeIn('slow');
	
												}
												else{
														clicked.fadeOut('slow');	
												}
											

											}
											



										});

									

								}



								//connect Blocks 
								resetSVGsize();
                  				connectAll(seq_id, Blocks);


                  				$("#chart").append("<div class='row justify-content-center'><a target='_blank' href='" + link + "'>"+ link + "</a></div>")


						}).fail(function(err){
							console.log(err);
						});
					});

					if(systemName==="Cistrome"){
						$("#" + seq_id).click();

					}


				}



			});

	});

});


