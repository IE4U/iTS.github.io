// Initialize app
var myApp = new Framework7();
var IntervalTotal;
var time = 0;
var lapTime = 0;
var back = false;





// If we need to use custom DOM library, let's save it to $$ variable:
var $$ = Dom7;

// Add view
var mainView = myApp.addView('.view-main', {
    // Because we want to use dynamic navbar, we need to enable it for this view:
    dynamicNavbar: true
    
});

var operations = {};


function clearlocal() {
    
    localStorage.clear();
    localStorage.setItem('index', 1);
    localStorage.setItem('operations', '{}');
    $$('.operationLists').remove();
    operations = JSON.parse(localStorage.getItem('operations'));
    removeFile();
    createFile();
    loadOperations();
}

// Now we need to run the code that will be executed only for About page.


myApp.onPageBeforeAnimation('index', function(page) {
    
    if (localStorage.getItem('index') <= 0 ) {
        localStorage.setItem('index', 1);
        localStorage.setItem('operations', '{}');
    }
    operations = JSON.parse(localStorage.getItem('operations'));
    $$("#delete_button_steps").attr('id', "delete_button");
    
    $$("#sort_button_step").attr('id', 'sort_button');
    
    $$('#delete_button').text("Delete");
    loadOperations();
    $$('#sort_button').on('click', updateOperations);
    $$('#clear_button').on('click', clearlocal);
    $$('#delete_button').on('click', deleteOperations);
    $$('#add_operation').on('click', addOperations);
    
    
}).trigger();

function updateOperations() {
    
    $$('#sort_button').off('click', updateOperations);
    $$('#clear_button').off('click', clearlocal);
    $$('#delete_button').off('click', deleteOperations);
    $$('#add_operation').off('click', addOperations);
    $$('.operations_link').removeAttr('href');
    
    $$('#sort_button').off('click', updateOperations);
    $$('#sort_button').on('click', endupdateOperations);
}


function endupdateOperations() {
    
    $$('#sort_button').on('click', updateOperations);
    $$('#clear_button').on('click', clearlocal);
    $$('#delete_button').on('click', deleteOperations);
    $$('#add_operation').on('click', addOperations);
    $$('.operations_link').attr('href', 'about.html');
    
    sortValues('#indexList');
    $$('#sort_button').off('click', endupdateOperations);
    $$('#sort_button').on('click', updateOperations);
    
}

function sortValues(str) {
    
    
    var numList = $$(str).children('li').length;
    
    var data = {};
    
    var id = "";
    
    for(i = 0; i < numList; i++){
        id = $$(str).children('li').eq(i).attr('id');
        if (id.split('_')[0] != "add"){
            data['operation_' + id.split('_')[1]] = 'operation_' + id.split('_')[1];
        }
    }
    localStorage.setItem('operations', JSON.stringify(data));
    operations = data;
    
}



// Option 1. Using page callback for page (for "about" page in this case) (recommended way):
myApp.onPageInit('about', function (page) {
    // Do something here for "about" page
    var source = '\
    <li>\
    <div class="item-content">\
    <div class="item-inner">\
    <div class="item-input">\
    <input id ="dataInput" type="text" value="{{name}}" spellcheck="true" >\
    </div>\
    </div>\
    </div>\
    </li>\
    <li class="align-top">\
    <div class="item-content">\
    <div class="item-inner">\
    <div class="item-input">\
    <textarea id = "descriptionInput" spellcheck="true">{{description}}</textarea>\
    </div>\
    </div>\
    </div>\
    </li>\
    <li class="align-top">\
    <div class="item-content">\
    <div class="item-media"><i class="f7-icons size-50">stopwatch</i> &nbsp  Avg. Time: &nbsp<span id = "averageTime">{{avgTime}}</span></div>\
    <div class="item-inner">\
    <div class="item-input">\
    <input id ="averageTimeVal" type="text" readonly>\
    </div>\
    </div>\
    </div>\
    </li>';
    
    var updateData = JSON.parse(localStorage.getItem('step'));
    
    if(updateData['id'] != undefined){
        if(back){
            
            endDeleteTime();
            stopTimer();
            updateTimesRemove();
            updateData['time'] = String(time);
            updateData['lapTime'] = String(lapTime);
            if(updateAverageTime() != 0){
                updateData['avgTime'] = String(updateAverageTime());
            }
            else{
                updateData['avgTime'] = "N/A";
            }
            
            $$('#delete_button_steps').off('click', deleteTimeItem);
            $$("#delete_button_steps").on('click', deleteStepItem);
            $$("#sort_button_step").show();
            back = false;
            localStorage.setItem(updateData['id'], JSON.stringify(updateData));
        }
    }
    
    overallAverageTime();
    
    
    var template = Handlebars.compile(source);
    var context = JSON.parse(localStorage.getItem('about'));
    var html = template(context);
    $$(html).insertBefore('#entry_template');
    
    loadSteps();
    
    $$('#add_step').on('click', addSteps);
    
    $$("#dataInput").on('input', function () {
        var about = JSON.parse(localStorage.getItem('about'));
        var data = JSON.parse(localStorage.getItem(about['id']));
        data['name'] = $$(this).val();
        localStorage.setItem(data['id'], JSON.stringify(data)); 
        localStorage.setItem('about', JSON.stringify(data)); 
    });
    
    $$("#descriptionInput").on('input', function () {
        var about = JSON.parse(localStorage.getItem('about'));
        var data = JSON.parse(localStorage.getItem(about['id']));
        data['description'] = $$(this).val();
        localStorage.setItem(data['id'], JSON.stringify(data)); 
        localStorage.setItem('about', JSON.stringify(data)); 
    });
    
    if($$("#delete_button").length != 0){
        $$("#delete_button").attr('id', "delete_button_steps");
        $$("#delete_button_steps").on('click', deleteStepItem);
        
        $$("#sort_button").attr('id', 'sort_button_step');
        
        $$("#sort_button_step").show();
        $$("#sort_button_step").on('click', updateSteps);
    }
    $$("#sort_button_step").show();
    $$("#convert_to_cvs").on('click', AboutCVS);
});


function updateSteps() {
    
    $$('#sort_button_step').off('click', updateSteps);
    $$('#delete_button_steps').off('click', deleteStepItem);
    $$('#add_step').off('click', addSteps);
    $$('.steps_link').removeAttr('href');
    
    $$('#sort_button_step').off('click', updateSteps);
    $$('#sort_button_step').on('click', endupdateSteps);
}


function endupdateSteps() {
    
    $$('#sort_button_step').on('click', updateSteps);
    $$('#delete_button_steps').on('click', deleteStepItem);
    $$('#add_step').on('click', addSteps);
    $$('.steps_link').attr('href', 'steps.html');
    
    sortValuesStep('#stepIndexList');
    $$('#sort_button_step').off('click', endupdateSteps);
    $$('#sort_button_step').on('click', updateSteps);
    
}

function sortValuesStep(str) {
    
    
    var numList = $$(str).children('li').length;
    
    var data = {};
    
    var id = "";
    
    var num = "";
    
    for(i = 0; i < numList; i++){
        id = $$(str).children('li').eq(i).attr('id');
        if (id.split('_')[0] != "add"){
            data['step_' + id.split('_')[1] + '_' + id.split('_')[2]] = 'step_' + id.split('_')[1] + '_' + id.split('_')[2];
            num = id.split('_')[1];
        }
        
    }
    
    localStorage.setItem('steps_' + num, JSON.stringify(data));
    
    
}

function redirectPage() {
    var itemIndex = $$(this).attr('id'); 
    var idNum = itemIndex.split("_")[1];
    var name = 'operation_' + idNum
    
    var data = JSON.parse(localStorage.getItem(operations[name]));
    
    localStorage.setItem('about', localStorage.getItem(operations[name]));
    
    
}


function loadOperations() {
    var source = '<li class = "operationLists" id = "{{num}}">\
    <a href="about.html" class="item-link operations_link">\
    <div class="item-content">\
    <div class="item-inner operations" id = "{{id}}">\
    <div class="item-title">{{name}}</div>\
    <div class="item-after">Details</div>\
    </div>\
    </div>\
    </a>\
    <div class="sortable-handler"></div>\
    </li>';
    
    var template = Handlebars.compile(source);
    var context = {};
    var html    = "";
    for(var key in operations)
    {
        context = JSON.parse(localStorage.getItem(operations[key]));
        html = template(context);
        $$(html).insertBefore('#add_operation');
        $$("#" + context['num']).on('click', redirectPage);
    }
    
}

//Adds the Operations to the page

function addOperations() {
    
    var source = '<li class = "operationLists" id = "{{num}}">\
    <a href="about.html" class="item-link operations_link">\
    <div class="item-content">\
    <div class="item-inner operations" id = "{{id}}">\
    <div class="item-title">{{name}}</div>\
    <div class="item-after">Details</div>\
    </div>\
    </div>\
    </a>\
    <div class="sortable-handler"></div>\
    </li>';
    
    
    var template = Handlebars.compile(source);
    var idNum = "operation_" + String(parseInt(localStorage.getItem('index')));
    var currentNum = "list_" + String(parseInt(localStorage.getItem('index')));
    
    var context = {id: idNum, name: "Name", description: "Description", num: currentNum, steps: "0", avgTime: "N/A"};
    var html    = template(context);
    
    $$(html).insertBefore('#add_operation');
    $$("#" + context['num']).on('click', redirectPage);
    
    localStorage.setItem(idNum, JSON.stringify(context)); 
    
    operations[idNum] = idNum;
    
    var operationsList = JSON.stringify(operations);
    localStorage.setItem('operations', operationsList);
    localStorage.setItem('steps_' + String(parseInt(localStorage.getItem('index'))), "{}");  
    localStorage.setItem('index', String(parseInt(localStorage.getItem('index')) + 1));
    
    var data = {time: "0", lapTime: "0"};
    localStorage.setItem('step', JSON.stringify(data));
    
    
};

//Activiate Delete of Operations

function deleteOperations() {
    var html = '<div class="item-media delete_icon">\
    <i class="f7-icons size-50 color-red">close</i>\
    </div>';
    
    
    for(var key in operations)
    {
        $$(html).insertBefore("#" + operations[key]); 
        $$("#" + operations[key]).closest('li').on('click', deleteItem);
    }
    
    $$('#delete_button').text('Finished');
    $$('#delete_button').off('click', deleteOperations);
    $$('#delete_button').on('click', deleteEndOperations);
    $$('#add_operation').off('click', addOperations);
    $$('.operations_link').removeAttr('href');
    $$('#sort_button').off('click', updateOperations);
    
    
    var context = {};
    
    for(var key in operations)
    {
        context = JSON.parse(localStorage.getItem(operations[key]));
        $$("#" + context['num']).off('click', redirectPage);
    }
};  

//Deactive Delete of Operations
function deleteEndOperations() {
    $$('.delete_icon').remove();
    $$('#delete_button').text('Delete');
    $$('#delete_button').off('click', deleteEndOperations);
    $$('#delete_button').on('click', deleteOperations);
    $$('#add_operation').on('click', addOperations);
    $$('#sort_button').on('click', updateOperations);
    $$('.operations_link').attr('href', 'about.html');
    
    for(var key in operations)
    {
        context = JSON.parse(localStorage.getItem(operations[key]));
        $$("#" + context['num']).on('click', redirectPage);
        $$("#" + operations[key]).closest('li').off('click', deleteItem);
    }
    
};

function deleteItem() {
    var itemIndex = $$(this).attr('id'); 
    var idNum = itemIndex.split("_")[1];
    var data = JSON.parse(localStorage.getItem(operations['operation_' + idNum]))
    
    var buttons = [
        {
            text: 'Delete: ' + data['name'],
            color: 'red',
            onClick: function(){
                removeOperation(itemIndex);
            }
        },
        {
            text: 'Cancel',
        },
    ];
    myApp.actions(buttons);
}

function removeOperation(id)
{
    var idNum = id.split("_")[1];
    $$("#" + id).off('click', deleteItem);
    $$("#" + id).remove();
    
    var stepData = JSON.parse(localStorage.getItem('steps_' + idNum));
    
    var operation = "";
    var step = "";
    
    for(var key in stepData){
        localStorage.removeItem(stepData[key]);
        operation = stepData[key].split("_")[1];
        step = stepData[key].split("_")[2];
        localStorage.removeItem('time_' + operation + '_' + step);
    }
    
    localStorage.removeItem('steps_' + idNum);
    
    localStorage.removeItem(operations['operation_' + idNum]);
    delete operations['operation_' + idNum];
    
    var operationsList = JSON.stringify(operations);
    localStorage.setItem('operations', operationsList);
    
}                 

function overallAverageTime() {
    
    var data = JSON.parse(localStorage.getItem('about'));
    var index = data['id'].split("_")[1];
    
    var dataAbout = JSON.parse(localStorage.getItem('steps_' + index));
    var dataOperation = JSON.parse(localStorage.getItem(data['id']));
    
    var dataStep = {};
    var avgTimeVal = 0;
    
    var test = false;
    
    for(var key in dataAbout) {
        
        dataStep = JSON.parse(localStorage.getItem(dataAbout[key]));
        if(dataStep['avgTime'] != "N/A") {
            avgTimeVal += parseInt(dataStep['avgTime']);
        }
        else {
            test = true;
        }
    }
    
    var error = "";
    
    
    if(test || avgTimeVal == 0) {
        error = "N/A"
        data['avgTime'] = error;
        $$('#averageTime').text(error);
    }
    
    else {
        data['avgTime'] = convertTime(avgTimeVal);
        $$('#averageTime').text(data['avgTime']);
    }
    
    localStorage.setItem('about', JSON.stringify(data));
    localStorage.setItem(data['id'], JSON.stringify(data));
    
}






function addSteps(){
    
    var source = '<li class = "stepLists" id = "{{num}}">\
    <a href="steps.html" class="item-link steps_link">\
    <div class="item-content">\
    <div class="item-inner operations" id = "{{id}}">\
    <div class="item-title">{{name}}</div>\
    <div class="item-after">Avg Time: {{avgTime}}</div>\
    </div>\
    </div>\
    </a>\
    <div class="sortable-handler"></div>\
    </li>';
    
    
    var template = Handlebars.compile(source);
    
    var data = JSON.parse(localStorage.getItem('about'));
    var index =  data['id'].split("_")[1];
    
    data['steps'] = String(parseInt(data['steps']) + 1);
    var stepNum = data['steps']
    
    var idNum = "step_" + index + "_" + stepNum;
    var currentNum = "stepList_" + index + "_" + stepNum; 
    
    var context = {id: idNum, name: 'Step ' + stepNum, num: currentNum, step: stepNum, description: "Description", numTime: "0", time: "0", lapTime: "0", avgTime: "N/A"};
    
    var html    = template(context);
    
    $$(html).insertBefore('#add_step');
    $$("#" + context['id']).on('click', redirectStepPage);
    
    var stepsData = JSON.parse(localStorage.getItem('steps_' + index));
    stepsData[idNum] = idNum;
    
    localStorage.setItem('steps_' + index, JSON.stringify(stepsData));
    
    localStorage.setItem(data['id'], JSON.stringify(data));
    localStorage.setItem('about', JSON.stringify(data));
    localStorage.setItem(idNum, JSON.stringify(context));
    
    var timeName = 'time_' + index + '_' + stepNum;
    
    localStorage.setItem(timeName, "{}");
    
    overallAverageTime();
}

function loadSteps() {
    var source = '<li class = "stepLists" id = "{{num}}">\
    <a href="steps.html" class="item-link steps_link">\
    <div class="item-content">\
    <div class="item-inner operations" id = "{{id}}">\
    <div class="item-title">{{name}}</div>\
    <div class="item-after">Avg Time: {{avgTime}}</div>\
    </div>\
    </div>\
    </a>\
    <div class="sortable-handler"></div>\
    </li>';
    
    
    var template = Handlebars.compile(source);
    
    var data = JSON.parse(localStorage.getItem('about'));
    var index =  data['id'].split("_")[1];
    
    var stepNum = data['steps'];
    
    var context = {};
    var html = "";
    var stepID = "";
    
    var stepName = 'steps_' + index;
    if (localStorage.getItem(stepName) != "" ) {
        var stepData = JSON.parse(localStorage.getItem(stepName));
        
        for(var key in stepData){
            
            context = JSON.parse(localStorage.getItem(stepData[key])); 
            if(context['avgTime'] != "N/A"){
                context['avgTime'] = convertTime(parseInt(context['avgTime']));
            }
            html = template(context);
            $$(html).insertBefore('#add_step');
            $$("#" + context['num']).on('click', redirectStepPage);
        }
    }
    
}

function redirectStepPage() {
    var itemIndex = $$(this).attr('id'); 
    var idNum = itemIndex.split("_")[1];
    var stepNum = itemIndex.split("_")[2];
    //var data = JSON.parse(localStorage.getItem("operation" + idNum);
    
    localStorage.setItem('step', localStorage.getItem("step_" + idNum + "_" + stepNum));
    
}

function deleteStepItem() {
    var html = '<div class="item-media delete_icon_steps">\
    <i class="f7-icons size-50 color-red">close</i>\
    </div>';
    
    var data = JSON.parse(localStorage.getItem('about'));
    var index =  data['id'].split("_")[1];
    
    var stepData = JSON.parse(localStorage.getItem('steps_' + index));
    
    
    for(var key in stepData)
    {
        $$(html).insertBefore("#" + stepData[key]); 
        $$("#" + stepData[key]).closest('li').on('click', deleteSteps);
    }
    
    $$('#delete_button_steps').text('Finished');
    $$('#delete_button_steps').off('click', deleteStepItem);
    $$('#delete_button_steps').on('click', deleteEndSteps);
    $$('#add_step').off('click', addSteps);
    $$('#sort_button_step').off('click', updateSteps);
    $$('.steps_link').removeAttr('href');
    
    var context = {};
    
    for(var key in stepData)
    {
        context = JSON.parse(localStorage.getItem(stepData[key]));
        $$("#" + context['num']).off('click', redirectStepPage);
    }
    
}; 

function removeSteps(id)
{
    
    var idNum = id.split("_")[1];
    var stepNum = id.split("_")[2];
    var stepName = "step_" + idNum + "_" + stepNum;
    var timeName = "time_" + idNum + "_" + stepNum;
    $$("#" + id).off('click', deleteSteps);
    $$("#" + id).remove();
    localStorage.removeItem(stepName);
    localStorage.removeItem(timeName);
    
    var data = JSON.parse(localStorage.getItem('steps_' + idNum));
    delete data[stepName];
    
    localStorage.setItem('steps_' + idNum, JSON.stringify(data));
    overallAverageTime();
}

function deleteSteps() {
    var itemIndex = $$(this).attr('id'); 
    var idNum = itemIndex.split("_")[1];
    var stepNum = itemIndex.split("_")[2];
    var stepData = JSON.parse(localStorage.getItem('steps_' + idNum))
    var data = JSON.parse(localStorage.getItem(stepData['step_' + idNum + '_' + stepNum]))
    var buttons = [
        {
            text: 'Delete: ' + data['name'],
            color: 'red',
            onClick: function(){
                removeSteps(itemIndex);
            }
        },
        {
            text: 'Cancel',
        },
    ];
    myApp.actions(buttons);
}

function deleteEndSteps() {
    $$('.delete_icon_steps').remove();
    $$('#delete_button_steps').text('Delete');
    $$('#delete_button_steps').off('click', deleteEndSteps);
    $$('#delete_button_steps').on('click', deleteStepItem);
    $$('#add_step').on('click', addSteps);
    $$('#sort_button_step').on('click', updateSteps);
    $$('.steps_link').attr('href', 'steps.html');
    
    var data = JSON.parse(localStorage.getItem('about'));
    var index =  data['id'].split("_")[1];
    
    var stepData = JSON.parse(localStorage.getItem('steps_' + index));
    
    for(var key in stepData)
    {
        context = JSON.parse(localStorage.getItem(stepData[key]));
        $$("#" + context['num']).on('click', redirectPage);
        $$("#" + stepData[key]).closest('li').off('click', deleteSteps);
    }
    
};                         

//Timer Stuff
myApp.onPageInit('steps', function(page) {
    var source = '\
    <li>\
    <div class="item-content">\
    <div class="item-inner">\
    <div class="item-input">\
    <input id ="dataInput_steps" type="text" value="{{name}}" spellcheck="true" >\
    </div>\
    </div>\
    </div>\
    </li>\
    <li class="align-top">\
    <div class="item-content">\
    <div class="item-inner">\
    <div class="item-input">\
    <textarea id = "descriptionInput_steps" spellcheck="true">{{description}}</textarea>\
    </div>\
    </div>\
    </div>\
    </li>\
    <li class="align-top">\
    <div class="item-content">\
    <div class="item-media"><i class="f7-icons size-50">stopwatch</i> &nbsp  Avg. Time: </div>\
    <div class="item-inner">\
    <div class="item-input">\
    <input id ="averageTime_steps" type="text" readonly>\
    </div>\
    </div>\
    </div>\
    </li>';
    
    back = true;
    var template = Handlebars.compile(source);
    var context = JSON.parse(localStorage.getItem('step'));
    var html = template(context);
    $$(html).insertBefore('#step_template');
    
    $$("#dataInput_steps").on('input', function () {
        var about = JSON.parse(localStorage.getItem('step'));
        var data = JSON.parse(localStorage.getItem(about['id']));
        data['name'] = $$(this).val();
        localStorage.setItem(data['id'], JSON.stringify(data));
        localStorage.setItem('step', JSON.stringify(data)); 
    });
    
    $$("#descriptionInput_steps").on('input', function () {
        var about = JSON.parse(localStorage.getItem('step'));
        var data = JSON.parse(localStorage.getItem(about['id']));
        data['description'] = $$(this).val();
        localStorage.setItem(data['id'], JSON.stringify(data)); 
        localStorage.setItem('step', JSON.stringify(data));
    });
    
    $$("#delete_button_steps").off('click', deleteStepItem);
    $$("#delete_button_steps").on('click', deleteTimeItem);
    
    $$("#sort_button_step").hide();
    
    time = parseInt(context['time']); //seconds
    lapTime = parseInt(context['lapTime']);
    
    updateTime(time);
    
    loadTimes();
    calculateAverageTime();
    $$("#start_button").on('click', startTimer);
    $$("#reset_button").on('click', resetTimer);
    $$('#add_time').on('click', clearTime);
});

function deleteTimeItem() {
    
    $$("#start_button").off('click', startTimer);
    $$("#reset_button").off('click', resetTimer);
    $$('#add_time').off('click', clearTime);
    
    $$('.timeBadge').addClass('bg-red');
    $$('#delete_button_steps').text('Finished');
    $$('#delete_button_steps').off('click', deleteTimeItem);
    $$('#delete_button_steps').on('click', endDeleteTime);
    
    var data = JSON.parse(localStorage.getItem('step'));
    
    var operation = data['id'].split("_")[1];
    var step = data['id'].split("_")[2];
    var timeName = 'time_' + operation + '_' + step;
    
    var dataTime = JSON.parse(localStorage.getItem(timeName));
    
    var id = "";
    
    for(var key in dataTime){
        id = '#times_' + operation + '_' + step + '_' + key;
        $$(id).on('click', deleteTimes);
        
    }
    
}

function endDeleteTime() {
    
    updateTimesRemove();
    $$("#start_button").on('click', startTimer);
    $$("#reset_button").on('click', resetTimer);
    $$('#add_time').on('click', clearTime);
    
    $$('.timeBadge').removeClass('bg-red');
    $$('#delete_button_steps').text('Delete');
    $$('#delete_button_steps').on('click', deleteTimeItem);
    $$('#delete_button_steps').off('click', endDeleteTime);
    
    var data = JSON.parse(localStorage.getItem('step'));
    
    var operation = data['id'].split("_")[1];
    var step = data['id'].split("_")[2];
    var timeName = 'time_' + operation + '_' + step;
    
    var dataTime = JSON.parse(localStorage.getItem(timeName));
    
    var id = "";
    
    for(var key in dataTime){
        id = '#times_' + operation + '_' + step + '_' + key;
        $$(id).off('click', deleteTimes);
        
    }
    
    $$('.time_li').remove();
    loadTimes();
}

function deleteTimes() {
    var itemIndex = $$(this).attr('id'); 
    var idNum = itemIndex.split("_")[1];
    var stepNum = itemIndex.split("_")[2];
    var timeNum = itemIndex.split("_")[3];
    var stepTime = JSON.parse(localStorage.getItem('time_' + idNum + '_' + stepNum))
    var buttons = [
        {
            text: 'Delete: ' + stepTime[timeNum],
            color: 'red',
            onClick: function(){
                removeTimes(itemIndex);
            }
        },
        {
            text: 'Cancel',
        },
    ];
    myApp.actions(buttons);
}

function removeTimes(itemIndex){
    var idNum = itemIndex.split("_")[1];
    var stepNum = itemIndex.split("_")[2];
    var timeNum = itemIndex.split("_")[3];
    
    var stepTime = JSON.parse(localStorage.getItem('time_' + idNum + '_' + stepNum));
    
    $$('#times_' + idNum + '_' + stepNum + '_' + timeNum).remove();
    delete stepTime[timeNum];
    
    var data = JSON.parse(localStorage.getItem('step'));
    var numTimeVal = String(parseInt(data['numTime']) - 1);
    data['numTime'] = numTimeVal;
    
    localStorage.setItem('step', JSON.stringify(data));
    localStorage.setItem(data['id'], JSON.stringify(data));
    
    
    localStorage.setItem('time_' + idNum + '_' + stepNum, JSON.stringify(stepTime));
    
    calculateAverageTime();
    
    
    
}


function updateTimesRemove() {
    
    var data = JSON.parse(localStorage.getItem('step'));
    var operation  = data['id'].split("_")[1];
    var step = data['id'].split("_")[2];
    var stepTime = JSON.parse(localStorage.getItem('time_' + operation + '_' + step));
    
    
    var stepTimeUpdate = {};
    var i = 0;
    
    for(var key in stepTime){
        i++;
        stepTimeUpdate[i] = stepTime[key];
        
    }
    
    localStorage.setItem('time_' + operation + '_' + step, JSON.stringify(stepTimeUpdate));
    
    
}

function startTimer() {
    
    $$("#delete_button_steps").off('click', deleteTimeItem);
    
    $$('#add_time').off('click', clearTime);
    $$('#stopwatch').text('stopwatch');
    $$("#start_button").off('click', startTimer);
    $$("#start_button").on('click', stopTimer);
    
    $$("#reset_button").off('click', resetTimer);
    $$('#reset_button').on('click', lapEvent);
    $$('#reset_button').text("Lap");
    
    $$("#start_button").text('Stop');
    $$("#start_button").addClass('color-red').removeClass('color-green');
    
    var test = getTimeDataLength();
    if ( test < 1 || time == 0){
        lapTimer();
    }
    
    //seconds
    IntervalTotal = setInterval(function() { 
        time ++;
        updateTime(time); 
        updateTimeVal(time);
    }, 10);
    
    
}


function resetTimer() {
    
    time = 0; //seconds
    lapTime = 0;
    
    $$("#total_time").text(convertTime(time));
    
}


function updateTime(time) {
    
    $$("#total_time").text(convertTime(time));
    
}

function stopTimer() {
    
    $$("#delete_button_steps").on('click', deleteTimeItem);
    
    $$('#add_time').on('click', clearTime);
    $$("#start_button").text('Start');
    $$("#start_button").addClass('color-green').removeClass('color-red');
    $$("#start_button").off('click', stopTimer);
    $$("#start_button").on('click', startTimer);
    clearInterval(IntervalTotal);
    $$('#stopwatch').text('stopwatch_fill');
    $$("#total_time").text(convertTime(time));
    updateTimeData();
    
    $$('#reset_button').off('click', lapEvent);
    $$("#reset_button").on('click', resetTimer);
    $$('#reset_button').text("Reset");
}


function updateTimeVal(time) {
    var data = JSON.parse(localStorage.getItem('step'));
    var num = data['numTime'];
    var updateTimeSet = time - lapTime;
    
    $$('#dataInput_times_' + num).text(convertTime(updateTimeSet));
    
}

function getTimeDataLength() {
    var data = JSON.parse(localStorage.getItem('step'));
    
    var operation = data['id'].split("_")[1];
    var step = data['id'].split("_")[2];
    var timeName = 'time_' + operation + '_' + step;
    
    var dataTime = JSON.parse(localStorage.getItem(timeName));
    
    var i = 0;
    
    for(var key in dataTime){
        i ++;
    }
    
    return i;
    
}


function updateTimeData() {
    var lapTimeSet = time - lapTime;
    
    
    var data = JSON.parse(localStorage.getItem('step'));
    
    var operation = data['id'].split("_")[1];
    var step = data['id'].split("_")[2];
    var timeName = 'time_' + operation + '_' + step;
    
    var dataTime = JSON.parse(localStorage.getItem(timeName));
    
    
    dataTime[String(parseInt(data['numTime']))] = String(lapTimeSet);
    
    if(parseInt(data['numTime']) > 0 && lapTimeSet > 0){
        localStorage.setItem('step', JSON.stringify(data));
        localStorage.setItem(data['id'], JSON.stringify(data));
        
        localStorage.setItem(timeName, JSON.stringify(dataTime));   
        calculateAverageTime();
    }
}

function lapEvent() {
    updateTimeData();
    lapTime = time;
    lapTimer();
    
}
function lapTimer() {
    var lapTimeSet = time - lapTime;
    
    var source = '\
    <li class = "time_li" id = "{{id}}">\
    <div class="item-content" id = "{{id}}">\
    <div class="item-media"><span class="badge timeBadge">{{index}}</span> </div>\
    <div class="item-inner">\
    <div class="item-input">\
    <h3 style="text-align: center;" id ="dataInput_times_{{num}}">{{timeVal}}</h3>\
    </div>\
    </div>\
    </div>\
    </li>';
    
    var data = JSON.parse(localStorage.getItem('step'));
    var numTimeVal = String(parseInt(data['numTime']) + 1);
    data['numTime'] = numTimeVal;
    
    localStorage.setItem('step', JSON.stringify(data));
    localStorage.setItem(data['id'], JSON.stringify(data));
    
    var operation = data['id'].split("_")[1];
    var step = data['id'].split("_")[2];
    var timeName = 'time_' + operation + '_' + step;
    
    var timeID = 'times_' + operation + '_' + step + '_' + numTimeVal;
    
    var template = Handlebars.compile(source);
    var context = {index: getTimeDataLength() + 1, num: numTimeVal, timeVal: convertTime(lapTimeSet), id: timeID};
    var html = template(context);
    $$('#timeList').show();
    
    $$(html).insertBefore('#add_time');
    
}

function loadTimes() {
    
    var source = '\
    <li class = "time_li" id = "{{id}}">\
    <div class="item-content">\
    <div class="item-media"><span class="badge timeBadge">{{index}}</span> </div>\
    <div class="item-inner">\
    <div class="item-input">\
    <h3 style="text-align: center;" id ="dataInput_times_{{num}}">{{timeVal}}</h3>\
    </div>\
    </div>\
    </div>\
    </li>';
    
    var dataStep = JSON.parse(localStorage.getItem('step'));
    
    var template = Handlebars.compile(source);
    
    var context = {};
    var html = "";
    
    var operation = dataStep['id'].split("_")[1];
    var step = dataStep['id'].split("_")[2];
    var timeName = 'time_' + operation + '_' + step;
    var dataTime = JSON.parse(localStorage.getItem(timeName));
    var i = 0;
    
    var data = JSON.parse(localStorage.getItem('step'));
    var numTimeVal =  data['numTime'];
    
    var timeID = ""
    
    for(var key in dataTime) {   
        
        i ++;
        timeID = 'times_' + operation + '_' + step + '_' + i;
        context = {index: i, num: key, timeVal: convertTime(parseInt(dataTime[key])), id: timeID};
        html = template(context);
        $$('#timeList').show();
        $$(html).insertBefore('#add_time');
    }
    
}

function updateAverageTime() {
    
    var dataStep = JSON.parse(localStorage.getItem('step'));
    
    if(dataStep['id'] != null){
        var operation = dataStep['id'].split("_")[1];
        var step = dataStep['id'].split("_")[2];
        var timeName = 'time_' + operation + '_' + step;
        var dataTime = JSON.parse(localStorage.getItem(timeName));
        
        var i = 0;
        var totalTime = 0;
        
        for(var key in dataTime) {   
            i ++;
            totalTime += parseInt(dataTime[key]);
        }
        
        if(i == 0){
            i = 1;
        }
        
        return Math.round(totalTime/i);
    }
    
}


function calculateAverageTime() {
    
    var dataStep = JSON.parse(localStorage.getItem('step'));
    
    var operation = dataStep['id'].split("_")[1];
    var step = dataStep['id'].split("_")[2];
    var timeName = 'time_' + operation + '_' + step;
    var dataTime = JSON.parse(localStorage.getItem(timeName));
    
    var i = 0;
    var totalTime = 0;
    
    for(var key in dataTime) {   
        i ++;
        totalTime += parseInt(dataTime[key]);
    }
    
    if(i == 0){
        i = 1;
    }
    
    $$('#averageTime_steps').val(convertTime(Math.round(totalTime/i)));
    
}

function convertTime(time) {
    if(time != "N/A") {
        var x = 0;
        var seconds = 0;
        var hrseconds = 0;
        var minutes = 0;
        var hours = 0;
        var days = 0;
        
        hrseconds = (time % 100);
        time = time/100;
        seconds=Math.trunc((time)%60);
        minutes=Math.trunc((time/(60))%60);
        hours=Math.trunc((time/(60*60))%2);
        
        var timeString = checkValue10(hours) + ":" + checkValue10(minutes) + ":" + checkValue10(seconds) + "." + checkValue10(hrseconds);
    }
    else {
        timeString = time;
    }
    
    return timeString;
}

function checkValue10(val) {
    
    var timeVal = val;
    
    if(val < 10)
    {
        timeVal = "0" + val;
    }
    
    return timeVal;
}

function clearTime() {
    
    var dataStep = JSON.parse(localStorage.getItem('step'));
    var itemIndex = dataStep['id']; 
    var idNum = itemIndex.split("_")[1];
    var stepNum = itemIndex.split("_")[2];
    var data = JSON.parse(localStorage.getItem('step_' + idNum + '_' + stepNum))
    var timeName = 'time_' + idNum + '_' + stepNum;
    var buttons = [
        {
            text: 'Delete Times: ' + data['name'],
            color: 'red',
            onClick: function(){
                localStorage.setItem(timeName, "{}");
                calculateAverageTime();
                resetTimer();
                $$('.time_li').remove();
                $$('#timeList').hide();
                data['numTime'] = "0";
                localStorage.setItem('step_' + idNum + '_' + stepNum, JSON.stringify(data));
                localStorage.setItem('step', JSON.stringify(data));
            }
        },
        {
            text: 'Cancel',
        },
    ];
    myApp.actions(buttons);
    
}

function AboutCVS() {
    var aboutData = {}
    
    var operationData = JSON.parse(localStorage.getItem('about'));
    var operationNum = operationData['id'].split("_")[1];
    var stepsData = JSON.parse(localStorage.getItem("steps_" + operationNum));
    
    var stepNum = "";
    var stepData = {};
    
    var timeData = {};
    var i = 0;
    
    aboutData['name'] = operationData['name'];
    aboutData['description'] = operationData['description'];
    aboutData['avgTime'] = operationData['avgTime'];
    var stepInfo = {};
    var timeInfo = {};
    var InfoTotal = [];
    
    InfoTotal.push(aboutData);
    
    for(var key in stepsData){
        stepInfo = new Array();
        timeInfo = new Array();
        stepData = JSON.parse(localStorage.getItem(key));
        stepNum = stepData['id'].split("_")[2];
        timeData = JSON.parse(localStorage.getItem('time_' + operationNum + '_' + stepNum));
        stepInfo['name'] = stepData['name'];
        stepInfo['description'] = stepData['description'];
        stepInfo['avgTime'] = convertTime(stepData['avgTime']);
        InfoTotal.push(stepInfo);
        for(var timeKey in timeData){
            timeInfo[timeKey] = convertTime(timeData[timeKey]);
        }
        InfoTotal.push(timeInfo);
    }
    
    var BOM = "\uFEFF";
    var csvFile = BOM + ConvertToCSV(InfoTotal);
    var filename = aboutData['name'] + " Data" + ".csv";
    
    //alert(csvFile);
    var blob = new Blob([csvFile], {type: "text/csv;charset=utf-8"});
/*     writeFile(csvFile, function() {   window.plugins.socialsharing.shareVia('email', csvFile, filename,  localStorage.getItem('URL'))}); */
    
    saveAs(blob, filename);
    
    
    
    
}

function cloneMessage(servermessage) {
    var clone ={};
    for( var key in servermessage ){
        if(servermessage.hasOwnProperty(key)) //ensure not adding inherited props
        clone[key]=servermessage[key];
    }
    return clone;
}

function ConvertToCSV(objArray) {
    var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    var str = '';
    
    for (var i = 0; i < array.length; i++) {
        var line = '';
        for (var index in array[i]) {
            if (line != '') line += ','
            
            line += array[i][index];
        }
        
        str += line + '\r\n';
    }
    
    return str;
}

function createFile() {
    
    
    var type = window.PERSISTENT;
    var size = 5*1024*1024;
    window.requestFileSystem(type, size, successCallback, errorCallback)
    
    
    
    function successCallback(fs) {
        fs.root.getFile("data.csv", {create: true, exclusive: true}, function(fileEntry) {
            localStorage.setItem('URL', fileEntry.toURL());
            //alert('File creation successfull!')
        }, errorCallback);
    }
    
    function errorCallback(error) {
        //alert("ERROR: " + error.code)
    }
    
}

function writeFile(csvFile, callback) {
    var type = window.PERSISTENT;
    var size = 5*1024*1024;
    window.requestFileSystem(type, size, successCallback, errorCallback)
    
    function successCallback(fs) {
        fs.root.getFile("data.csv", {create: true}, function(fileEntry) {
            
            fileEntry.createWriter(function(fileWriter) {
                fileWriter.onwriteend = function(e) {
                    //alert(fileEntry.toURL());
                };
                
                fileWriter.onerror = function(e) {
                    //alert('Write failed: ' + e.toString());
                };
                
                var blob = new Blob([csvFile], {type: "text/csv;charset=utf-8"});
                fileWriter.write(blob);
                
            }, errorCallback);
        callback();}, errorCallback);
    }
    
    function errorCallback(error) {
        //alert("ERROR: " + error.code)
    }
    
    
}


function removeFile() {
    var type = window.PERSISTENT;
    var size = 5*1024*1024;
    window.requestFileSystem(type, size, successCallback, errorCallback)
    
    function successCallback(fs) {
        fs.root.getFile("data.csv", {create: false}, function(fileEntry) {
            
            fileEntry.remove(function() {
                //alert('File removed.');
            }, errorCallback);
        }, errorCallback);
    }
    
    function errorCallback(error) {
        //alert("ERROR: " + error.code)
    }
}	    
