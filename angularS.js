var app = angular.module("angularForm",[]);

app.controller('myCtrl', function($scope,$http,$compile) {

	var formData = {};

	var validationsArray = [];

	function renderForm () {
		var element = "<table class='table table-bordered'><form><tr><th>"+formData.data.form_id+"</th></tr>";
		formData.data.form_fields.forEach(function (temp, index, arr) {
			var tempId = "field"+index;
			var tempElement = "";
			// IDs will be field1, field2, field3...		
			switch(temp.component){
				case 'textinput':
					tempElement = "";
					element +=  "<tr><td><label>"+temp.label+"</label></td>";
					if(temp.autofill){
						tempElement = "<td><input type='text' id='"+tempId+"' name='"+tempId+"'  value='"+temp.autofill+"' readonly required><br></td></tr>";
					} else {
						tempElement = "<td><input type='text' id='"+tempId+"'  name='"+tempId+"'><br></td></tr>";
					}
					element += tempElement;
					if (temp.validation) {
						console.log(tempId,tempElement);
						pushValidation(temp.component, tempId, temp.validation);
					}

					//console.log("textinput");
					break;
				case 'textarea':
					tempElement = "";
					element +=  "<tr><td><label>"+temp.label+"</label></td>";
					if (temp.autofill != null) {
						tempElement = "<td><textarea rows='4' cols='50' name='"+tempId+"' id='"+tempId+"'  readonly required>"+temp.autofill+"</textarea><br></td></tr>";
					} else {
						tempElement = "<td><textarea rows='4' cols='50' name='"+tempId+"' id='"+tempId+"'></textarea><br></td></tr>";
					}
					element += tempElement;
					if (temp.validation) {
						console.log(tempId,tempElement);
						pushValidation(temp.component, tempId, temp.validation);
					}

					//console.log("textarea");
					break;
				case 'select':
					var temArray =[];
					temArray = temp.options.toString().split(',');
					element +=  "<tr><td><label>"+temp.label+"</label></td><td><select name='"+tempId+"'>";

					if(temp.autoselect != null){
						temArray.forEach(function(option){
							if(option == temp.autoselect){
								element += "<option value='"+option+"' selected>"+temp.autoselect+"</option>";
							}
							else{
								element += "<option value='"+option+"'>"+option+"</option>";
							}
						});
					}
					else{
						temArray.forEach(function(option){
							element += "<option value='"+option+"'>"+option+"</option>";
						});
					}
					element += "</select></td></tr><br>";
					//console.log("select");
					break;
				case 'radio':
					var temArray =[];
					temArray = temp.options.toString().split(',');
					element += 	"<tr><td><label>"+temp.label+"</label></td>";
					if (temp.autoselect != null) {
						temArray.forEach( function(option) {
							if (option == temp.autoselect) {
								element += "<td><input type='radio'  value='"+option+"' checked readonly>"+option+"<br></td>";
							} else {
								element += "<td><input type='radio'  value='"+option+"' disabled>"+option+"<br></td>";
							}
						});
					} else {
						temArray.forEach(function(option){
							element += "<td><input type='radio'>"+option+"<br></td>";
						});
					}
					element += "<br></tr>"; 
					//console.log("radio");
					break;
				case 'checkbox': 
					var auto=[];
					var temArray =[];
					temArray = temp.options.toString().split(',');
					element += 	"<tr><td><label>"+temp.label+"</label></td>";
					if(temp.autoselect != null){
						var auto = temp.autoselect;
						auto = auto.toString().split(',');
						console.log("autoselect:  "+temp.autoselect);
						console.log("temArray:"+temArray);
						temArray.forEach(function(saveEach){
							if(auto.indexOf(saveEach) != -1){
								element += "<td><input type='checkbox' name='"+saveEach+"' disabled='disabled' checked='checked'>"+saveEach+"<br></td>";
							}
							else{
								element += "<td><input type='checkbox' name='"+saveEach+"' disabled='disabled'>"+saveEach+"<br></td>";
							}
						});
					}
					else{
						temArray.forEach(function(saveEach){
							element += "<td><input type='checkbox'  name='"+saveEach+"'>"+saveEach+"<br></td>";
						});
					}
					element+= "<br></tr>"; 
					//console.log("checkbox");
					break;
			}
		});

		element += "<tr><td><input type='submit' value='submit' ng-click='submitFunc($event)'></td></tr></form></table>";

		compiledElement = $compile(element)($scope);
		$('#formDisplay').append(compiledElement);

 		// angular.element(document.getElementById('formDisplay')).append($compile(element)($scope));
	}

    function pushValidation (component, id, validation) {
		//Create our validation object and push it into 'validation' array
		var _validObj = {
			type: component,
			id: id,
			regexp: validation
		}

		validationsArray.push(_validObj);
	}

    $scope.fetchForm = function() {
    	$('#formDisplay').empty();
    	validationsArray =[];
		$http.get("https://randomform.herokuapp.com").success(function (response) {
			formData = response;
			renderForm();
		});
	}
    $.fn.serializeObject = function() {
	var o = {};
	var a = this.serializeArray();
	$.each(a, function() {
		if (o[this.name]) {
			if (!o[this.name].push) {
				o[this.name] = [o[this.name]];
			}
			o[this.name].push(this.value || '');
		} else {
			o[this.name] = this.value || '';
		}
	});
	return o;
	};
	$scope.submitFunc = function($event){
		var isValid = vaildateFields();

		if (isValid) {
			var data = JSON.stringify($('form').serializeObject());
			//var data = ($('form').serializeJSON());
			console.log(data);
			$('#formDisplay').empty();
			var element = "<h1>Successfully Submitted</h1>";
			compiledElement = $compile(element)($scope);
			$('#formDisplay').append(compiledElement);
		} else {
			//$('#formDisplay').empty();
			var element = "<h1>Validation Failed</h1>";
			compiledElement = $compile(element)($scope);
			$('#formDisplay').append(compiledElement);
		}

		// var form=document.getElementById("formDisplay");
		// var formData=new FormData(form);
		// var data = JSON.stringify(formData)
		// $http.post("https://randomform.herokuapp.com/submit", data);
		// $('#formDisplay').empty();
		// var element = "<h1>Submitted Successfully</h1>";
		// angular.element(document.getElementById('formDisplay')).append($compile(element)($scope));
		// console.log(form);
	}

	function vaildateFields () {

		var _isValidFlag = true;
		//What type of field, i.e textarea/input etc
		//How to find/get that fields ie ID
		//What is the validation i.e RegExp

		// [
		// 	{
		// 		type: "textearea"
		// 		id: "field1",
		// 		regexp: "/{234234]/"
		// 	},
		// 	{
		// 		type:
		// 		id:
		// 		regexp:
		// 	},
		// 	{
		// 		type:
		// 		id:
		// 		regexp:
		// 	}
		// ]

		if (validationsArray.length > 0) {
			//inside this you will set _isValidFlag = false if needed
			validationsArray.forEach( function (validObj) {
				// 	{
				// 		type: "textarea"
				// 		id: "field1",
				// 		regexp: "/{234234]/"
				// 	},
				var pattern = new RegExp(validObj.regexp);
				var result = $('#'+validObj.id).val().match(pattern);
				if(result){
					_isValidFlag = true;
				} else{
					_isValidFlag = false;
					$('#'+validObj.id).css("border", "1px solid red");

				}
				
			})
		}

		return _isValidFlag;
	}
});
