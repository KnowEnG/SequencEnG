function Block(name){
	

	this.name = name;

	this.data = {};

	this.table = "";

	this.frame = "";

	this.fields = [];



}


Block.prototype.set_fields = function(fields, index){
	this.fields = fields.slice(index,fields.length);
};

Block.prototype.push_data = function(data, key) {
		this.data[key] = data;

};


Block.prototype.render = function(horizontal){

	var id = this.name.replace(/\s/g,''); 
	this.frame = "<div class=\'" + horizontal + " block\'>"
					+"<div class=\'container\'>"
						+"<div class=\'row justify-content-center \'>"
							+"<Button class=\'block-button btn btn-outline-primary\' id=\'"+id+"\'>" + this.name + "</Button>"
						+"</div>"
						+"<div class=\'row justify-content-md-center arrow-container\'>"
							+"<div class=\'col-md-2 block-arrow d-none d-md-block\' id=\'" + id + "swarr\'></div>"
							+"<div class=\'col-md-2 block-arrow\' id=\'" + id + "darr\'></div>"
							+"<div class=\'col-md-2 block-arrow d-none d-md-block\' id=\'" + id + "searr\'></div>"
						+ "</div>"
					+"</div>"
				+"</div>";

};

Block.prototype.makeTable = function(...args){

	var head_fields = [];
	var col = [];

	if(args.lenght!==0){
		for(let i = 0; i < args.length;i++){
			head_fields.push(args[i]);
		}
	}
	var head = "<tr>";


	head_fields = head_fields.concat(this.fields);

	for(let i = 0; i < head_fields.length;i++){
		head = head + "<th>" + head_fields[i] + "</th>";
	}

	head = head + "</tr>";


	var body = "";

	for(let key in this.data){
		var tr = "<tr>";

		for(var i= 0; i < head_fields.length;i++){
			if(this.data[key][head_fields[i]] ===""){
				tr = tr + "<td>-</td>";
			}
			else{
				tr = tr + "<td>" + this.data[key][head_fields[i]] + "</td>";
			}
			
		}

		tr = tr + "</tr>";

		body = body + tr;		

	}

	var table_head = "<thead>" + head + "</thead>";
	var table_body = "<tbody>" + body + "</tbody>";
	var table_foot = "<tfoot>" + head + "</tfoot>";
	this.table = table_head + table_body + table_foot;

};


Block.prototype.renderArrow = function(position, name){
	var id = name.replace(/\s/g,''); 
	$("#" + id+ position).append("<span>\&"+position+";</span>");



}





