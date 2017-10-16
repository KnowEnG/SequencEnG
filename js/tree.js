

//device viewport
const deviceW = $(window).width();   // returns width of browser viewport


let treeData = {
	"name" : "Training",
	 "parent": "null",
    "children": []

}


$.getJSON("./data/tree.json")
    .done(function( data ) {

      $(".modalclose").click(function(){
          $("#modalbox").hide();
      });

    	let dataObject = {};


    	for(let i= 0; i < data.length; i++){
    		if(typeof dataObject[data[i].seq_goal_level1] !== 'undefined'){
    			let leafNode = data[i];
    			leafNode.name = data[i].seq_name;
    			if(typeof dataObject[data[i].seq_goal_level1].child[data[i].seq_goal_level2] !== "undefined"){
    				dataObject[data[i].seq_goal_level1].child[data[i].seq_goal_level2].push(leafNode);
    			}

    			else{
    				dataObject[data[i].seq_goal_level1].child[data[i].seq_goal_level2] = [];
    				dataObject[data[i].seq_goal_level1].child[data[i].seq_goal_level2].push(leafNode);
    			}

    		}
    		else{
    			dataObject[data[i].seq_goal_level1] = {};
    			dataObject[data[i].seq_goal_level1].child = {};

    			dataObject[data[i].seq_goal_level1].child[data[i].seq_goal_level2] = [];


    			let leafNode = data[i];
    			leafNode.name = data[i].seq_name;
    			dataObject[data[i].seq_goal_level1].child[data[i].seq_goal_level2].push(leafNode);


    		}


    	}

    	

    	for(let key in dataObject){
    		let child_node = {};
    		child_node.name = key; 
    		child_node.children = []; 

    		for(let childKey in dataObject[key].child){
    			let childObject = {};
    			childObject.name = childKey;
    			childObject.children = dataObject[key].child[childKey];
    			child_node.children.push(childObject);
    		}

    		treeData.children.push(child_node);

    	}



function show_description(data){


      let $divContainer = $("<div>", {id: "desc-detail", "class": "container"});
    
      // notes, seq_fullname, year, paper_title paper_link
        let $divRowName = $("<div>", {"class": "row "});
        $divRowName.append("<div>Full name : " + data.seq_fullname + "</div>");
        let $divRowNote = $("<div>", {"class": "row"});
        $divRowNote.append("<div>Description : " + data.notes + "</div>");
        let $divRowYear = $("<div>", {"class": "row"});
        $divRowYear.append("<div>Year : " + data.year + "</div>"); 
        let $divRowPaper = $("<div>", {"class": "row"});
        $divRowPaper.append("Paper  <a target='_blank' href='"+ data.paper_link + "'>" + data.paper_title + "</a>");

        let $divRowButton = $("<div>", {"class": "row justify-content-md-center button-row"});
        $divRowButton.append("<button class='btn btn-sucess show-chart'>Show steps</button>");

        let $imgBox = $("<div>", {"class" : "row"});
        
        let $figure = $("<figure>",{"class" : "normalimg"});
        let $descimg = $("<img>", {"id" : "descimg", "alt" : data.seq_fullname, "src" : "./img/"+data.seq_name+".jpeg"});
        $figure.append($descimg);
        $imgBox.append($figure);


        let $modal = $("#modalbox");
        let $imgmodal = $("#img-modal");

        //modal event
        $descimg.click(function(){
            $modal.show();
            $imgmodal.attr("src",  "./img/"+data.seq_name+".jpeg");
            $("#caption").text(data.seq_fullname);
        });

        $divContainer.append($divRowName, $divRowNote, $divRowYear, $divRowPaper, $imgBox, $divRowButton);

        return $divContainer;


}    	

//desktop
if(deviceW > 1024){

    
  let margin = {top: 20, right: 90, bottom: 30, left: 90},
      width = 1000 - margin.left - margin.right,
      height =1200- margin.top - margin.bottom;

  let svg = d3.select("#tree").append("svg")
      .attr("width", width + margin.right + margin.left)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate("
            + margin.left + "," + margin.top + ")");

  let i = 0,
      duration = 750,
      root;

  let tree = d3.tree().size([height, width]);

  root = d3.hierarchy(treeData, function(d) { return d.children; });
  root.x0 = height / 2;
  root.y0 = 0;

  root.children.forEach(collapse);

  update(root);

  function collapse(d) {
    if(d.children) {
      d._children = d.children
      d._children.forEach(collapse)
      d.children = null
    }
  }



  function update(source) {

    let tData = tree(root);

    let nodes = tData.descendants(),
        links = tData.descendants().slice(1);

    // Normalize for fixed-depth.
    nodes.forEach(function(d){ 
      d.y = d.depth * 220});

    let node = svg.selectAll('g.node')
        .data(nodes, function(d) {return d.id || (d.id = ++i); });

    let nodeEnter = node.enter().append('g')
        .attr('class', 'node')
        .attr("transform", function(d) {
          return "translate(" + source.y0 + "," + source.x0 + ")";
      })
      .on('click', click);

    nodeEnter.append('circle')
        .attr('class', 'node')
        .attr('r', 1e-6)
        .style("fill", function(d) {
            return d._children ? "springgreen" : "#fff";
        });

    nodeEnter.append('text')
        .attr("dy", ".35em")
        .attr("x", function(d) {
            return d.children || d._children ? -20 : 20;
        })
        .attr("text-anchor", function(d) {
            return d.children || d._children ? "end" : "start";
        })
        .attr("font-size", function(d){
          return d.children || d._children ? "12" : "14";
        })
        .attr("font-weight",function(d){
          return d.children || d._children ? "normal" : "bold";
        })
        .text(function(d) { return d.data.name; })
        .on("mouseenter", function(d){
            //console.log(d);
            if(typeof d.data.children === 'undefined'){
                let $descText = show_description(d.data);
                $descText.hide();

                $("#desc").html($descText);

                $(".show-chart").on('click', function(){
                    $(".tree-field").slideUp('slow');
                    $("#main").delay('850').slideDown('slow');
                });
                $descText.fadeIn('slow');
                $("#desc").fadeIn('slow');
            }
        
        });

   
    let nodeUpdate = nodeEnter.merge(node);

   
    nodeUpdate.transition()
      .duration(duration)
      .attr("transform", function(d) { 
          return "translate(" + d.y + "," + d.x + ")";
       });

   
    nodeUpdate.select('circle.node')
      .attr('r', 15)
      .style("fill", function(d) {
          return d._children ? "springgreen" : "#fff";
      })
      .attr('cursor', 'pointer');


   
    let nodeExit = node.exit().transition()
        .duration(duration)
        .attr("transform", function(d) {
            return "translate(" + source.y + "," + source.x + ")";
        })
        .remove();

   
    nodeExit.select('circle')
      .attr('r', 1e-6);

    
    nodeExit.select('text')
      .style('fill-opacity', 1e-6);

  
    let link = svg.selectAll('path.link')
        .data(links, function(d) { return d.id; });

   
    let linkEnter = link.enter().insert('path', "g")
        .attr("class", "link")
        .attr('d', function(d){
          let o = {x: source.x0, y: source.y0}
          return diagonal(o, o)
        });

   
    let linkUpdate = linkEnter.merge(link);

    
    linkUpdate.transition()
        .duration(duration)
        .attr('d', function(d){ return diagonal(d, d.parent) });

   
    let linkExit = link.exit().transition()  
        .duration(duration)
        .attr('d', function(d) {
          let o = {x: source.x, y: source.y}
          return diagonal(o, o)
        })
        .remove();

   
    nodes.forEach(function(d){
      d.x0 = d.x;
      d.y0 = d.y;
    });

    
    function diagonal(s, d) {

      let path = `M ${s.y} ${s.x}
              C ${(s.y + d.y) / 2} ${s.x},
                ${(s.y + d.y) / 2} ${d.x},
                ${d.y} ${d.x}`

      return path
    }

    
    function click(d) {
      if (d.children) {
          d._children = d.children;
          d.children = null;
        } else {
          d.children = d._children;
          d._children = null;
        }
      update(d);
    }
  }




}


//tablet, mobile
else{

  let margin = {top: 30, right: 20, bottom: 30, left: 20},
      width = deviceW - margin.right - margin.left,
      barHeight = 30,
      barWidth = width;


  let i = 0,
      duration = 750,
      root;


  let svg = d3.select("#tree").append("svg")
      .attr('width', width + margin.right + margin.left)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  root = d3.hierarchy(treeData) // Constructs a root node from the specified hierarchical data.

  let tree = d3.tree().nodeSize([0, 30]); //Invokes tree

  root.children.forEach(collapse);
  // Collapse the node and all it's children
  function collapse(d) {
    if(d.children) {
      d._children = d.children
      d._children.forEach(collapse)
      d.children = null
    }
  }


  function update(source) {

    
     nodes = tree(root); //returns a single node with the properties of d3.tree()
     nodesSort = [];



    // returns all nodes and each descendant in pre-order traversal (sort)
    nodes.eachBefore(function (n) {

       nodesSort.push(n); 
    });

    // Compute the "layout".
    nodesSort.forEach(function (n,i) {
      n.x = i *barHeight;
    })


    d3.select("svg").transition()
        .duration(duration)
        .attr("height", nodesSort.length * barHeight + margin.top + margin.bottom);

    // Update the nodes…
    let node = svg.selectAll("g.node")
        .data(nodesSort, function(d) { return d.id || (d.id = ++i); }); //assigning id for each node

    let nodeEnter = node.enter().append("g")
        .attr("class", "node")
        .attr("transform", function(d) {  return "translate(" + source.y + "," + source.x + ")"; })
        .style("opacity", 1e-6);

    // Enter any new nodes at the parent's previous position.
    nodeEnter.append("rect")
        .attr("y", -barHeight / 2)
        .attr("height", barHeight)
        .attr("width", barWidth)
        .style("fill", color)
        .on("click", click);

    nodeEnter.append("text")
        .attr("dy", 3.5)
        .attr("dx", 5.5)
        .text(function (d) {
          return d.depth == 0 ? d.data.name + " >>>" : d.depth == 1 ? d.data.name + " >>" : d.data.name ; })
         .on("click", click);

    // Transition nodes to their new position.
    nodeEnter.transition()
        .duration(duration)
        .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
        .style("opacity", 1);

    node.transition()
        .duration(duration)
        .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
        .style("opacity", 1)
      .select("rect")
        .style("fill", color);

    // Transition exiting nodes to the parent's new position.
    node.exit().transition()
        .duration(duration)
        .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
        .style("opacity", 1e-6)
        .remove();

      nodes.eachBefore(function (d) {
        d.x0 = d.x;
        d.y0 = d.y
      });

  }

  // Initalize function
  update(root);


  // Toggle children on click.
  function click(d) {

    if(typeof d.data.children === 'undefined'){


                let $descText = show_description(d.data);
                $descText.hide();

                $("#desc").html($descText);

                $(".show-chart").on('click', function(){
                    $(".tree-field").slideUp('slow');
                    $("#main").delay('850').slideDown('slow');
                });

                $descText.fadeIn('slow');
                $("#desc").fadeIn('slow');
            }

    if (d.children) {
      d._children = d.children;
      d.children = null;
    } else {
      d.children = d._children;
      d._children = null;
    }
    update(d);
  }

  function color(d) {
    return d._children ? "seagreen" : d.children ? "mediumseagreen" : "lightgreen";
  }

}


    });


