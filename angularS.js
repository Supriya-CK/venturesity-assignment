var app = angular.module("angularForm",[]);

app.controller('myCtrl', function($scope,$http,$compile) {

	var formData = {};
	var validationsArray = [];

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

    $scope.fetchForm = function() {
    	$('#formDisplay').empty();
    	$scope.validationError = "";
    	validationsArray = [];
		$http.get("https://randomform.herokuapp.com").success(function (response) {
			formData = response;
			renderForm();
		});
	}

	function renderForm () {
		var element = "<form><h3>"+formData.data.form_id+"</h3>";
		formData.data.form_fields.forEach(function (temp, index, arr) {
			var tempId = "field"+index;
			var tempElement = "";
			// IDs will be field1, field2, field3...		
			switch(temp.component){
				case 'textinput':
					tempElement = "";
					element +=  "<fieldset><label>"+temp.label+"</label><br>";
					if(temp.autofill){
						tempElement = "<input type='text' id='"+tempId+"' name='"+temp.label+"'  value='"+temp.autofill+"' disabled required><br></fieldset>";
					} else {
						tempElement = "<input type='text' id='"+tempId+"'  name='"+temp.label+"'><br></fieldset>";
					}
					element += tempElement;
					if (temp.validation) {
						pushValidation(temp.component, tempId, temp.validation);
					}

					//console.log("textinput");
					break;
				case 'textarea':
					tempElement = "";
					element +=  "<fieldset><label>"+temp.label+"</label><br>";
					if (temp.autofill != null) {
						tempElement = "<textarea rows='4' cols='50' name='"+temp.label+"' id='"+tempId+"'  disabled required>"+temp.autofill+"</textarea><br></fieldset>";
					} else {
						tempElement = "<textarea rows='4' cols='50' name='"+temp.label+"' id='"+tempId+"'></textarea><br></fieldset>";
					}
					element += tempElement;
					if (temp.validation) {
						pushValidation(temp.component, tempId, temp.validation);
					}

					//console.log("textarea");
					break;
				case 'select':
					var temArray =[];
					temArray = temp.options.toString().split(',');
					element +=  "<fieldset><label>"+temp.label+"</label><select name='"+temp.label+"'>";

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
					element += "</select></fieldset>";
					//console.log("select");
					break;
				case 'radio':
					var temArray =[];
					temArray = temp.options.toString().split(',');
					element += 	"<fieldset><label>"+temp.label+"</label><br>";
					if (temp.autoselect != null) {
						temArray.forEach( function(option) {
							if (option == temp.autoselect) {
								element += "<input type='radio' name='"+option+"' value='"+option+"' checked disabled>"+option+"<br>";
							} else {
								element += "<input type='radio' name='"+option+"' value='"+option+"' disabled>"+option+"<br>";
							}
						});
					} else {
						temArray.forEach(function(option){
							element += "<input type='radio' name='"+option+"' value='"+option+"'>"+option+"<br>";
						});
					}
					element += "<br></fieldset>"; 
					//console.log("radio");
					break;
				case 'checkbox': 
					var auto=[];
					var temArray =[];
					temArray = temp.options.toString().split(',');
					element += 	"<fieldset><label>"+temp.label+"</label><br>";
					if(temp.autoselect != null){
						var auto = temp.autoselect;
						auto = auto.toString().split(',');
						temArray.forEach(function(saveEach){
							if(auto.indexOf(saveEach) != -1){
								element += "<input type='checkbox' name='"+saveEach+"' disabled='disabled' checked='checked'>"+saveEach+"<br>";
							}
							else{
								element += "<input type='checkbox' name='"+saveEach+"' disabled='disabled'>"+saveEach+"<br>";
							}
						});
					}
					else{
						temArray.forEach(function(saveEach){
							element += "<input type='checkbox'  name='"+saveEach+"'>"+saveEach+"<br>";
						});
					}
					element+= "<br></fieldset>"; 
					//console.log("checkbox");
					break;
			}
		});

		element += "<fieldset><input type='submit' class='button' value='Submit' ng-click='submitFunc($event)'><span>{{validationError}}</span></fieldset></form>";

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

	$scope.submitFunc = function($event){
		var isValid = vaildateFields();

		if (isValid) {

			var form = $('form');
			var disabled = form.find(':disabled').removeAttr('disabled');
			var data = form.serializeObject();
			disabled.attr('disabled','disabled');

			console.log(data);
			submitThisForm(data);

			$('#formDisplay').empty();
			$('#formDisplay').append("<h3>Successfully Submitted</h3>");
		} else {
			$scope.validationError = "Validation Failed";
		}
	}

	function vaildateFields () {
		var _isValidFlag = true;
		//What type of field, i.e textarea/input etc
		//How to find/get that fields ie ID
		//What is the validation i.e RegExp
		if (validationsArray.length > 0) {
			//inside this you will set _isValidFlag = false if needed
			validationsArray.forEach( function (validObj) {
				var pattern = new RegExp(validObj.regexp);
				var result = $('#'+validObj.id).val().match(pattern);
				if(result){
					_isValidFlag = true;
				} else{
					_isValidFlag = false;
					$('#'+validObj.id).css("border", "1px solid #ef404a");

				}
				
			})
		}
		return _isValidFlag;
	}

	function submitThisForm (data) {
		var config = {
			headers: {
				"Content-Type": "application/json"
			}
		}
		$http.post("https://randomform.herokuapp.com/submit", data, config).success( function (response) {
			console.log("Got response from server: ", response);
		})
		.error( function (error) {
			console.log("Got error from server: ", error);
		})
	}
});
