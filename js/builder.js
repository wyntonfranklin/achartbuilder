
var CHARTBUILDER = (function($){

    var myChart = null;
    var el_chartType = $('#chart-type');
    var el_container = $('#content-space');
    var el_chartWidth = $('#chart-width');
    var el_chartHeight = $('#chart-height');
    var el_labels =  $("#labels");
    var el_labelName = $('#label-name');
    var currentDataSource = 0;
    var el_datasources = $('#datasources');
    var el_addSource = $('#add-source');
    var el_chartTitle = $('#chart-title');
    var el_colorscheme = $('#ds_colorscheme');
    var el_fill = $('#ds_fill');
    var el_show_xaxis = $('#show-x-axis');
    var el_show_yaxis = $('#show-y-axis');
    var el_xaxis_label = $('#x-axis-label');
    var el_yaxis_label = $('#y-axis-label');
    var saveDialog =  null;
    var fileDialog = null;
    var dg_filename = $('#filename');
    var dg_filetype = $('#filetype');
    var dg_background = $('#bg_color');
    var el_show_xaxis_values = $('#show-x-axis-values');
    var el_show_yaxis_values = $('#show-y-axis-values');
    var el_settings = $('#settings');
    var embedDialog = null;
    var el_ds_type = $('#ds_type');

    var dsLayout = `<br><div id="ds_container_{id}" class="ds_container" style="min-height: 70px; border: 1px solid #ccc; margin-top:3px; margin-bottom: 5px; padding: 5px">
    <span style="float: right;"><a id="ds_remove_{id}" class="delete" href="javascript:void(0);"></a></span>
    <h5 class="title is-5">DataSource #{id}</h5>
    <div style="display: inline-block">
        Label name: <input id="ds_label_{id}" type="text" value="DataSource {id}"/>
        Source Actions: <button class="source-add-commas" data-source="ds_data_{id}">Add Commas</button>
    </div>
    <br><br>
    <div style="display: inline-block">
        <textarea id="ds_data_{id}" cols="100" rows="5">12, 19, 3, 5, 2, 3</textarea>
    </div>
</div>`;

    var chartTypes = [];

    var chartOptions = {
        type : "bar",
        width: "800",
        height: "450",
        labels : [],
        labelname : "A label",
        title : "My chart",
        colorscheme : "default",
        fill : true,
        showxlabel: false,
        xlabel: "My X axis",
        showylabel : false,
        ylabel: "My Y label",
        showxaxis: true,
        showyaxis: true,
        datasource: null,
        datasourcetype : 'numbers'
    };

    saveDialog = $( "#dialog" ).dialog({
        autoOpen: false,
        height: 250,
        width: 350,
        modal: true,
        buttons: {
            "Save": function(){
                savePicture();
                saveDialog.dialog( "close" );
            },
            Cancel: function() {
                saveDialog.dialog( "close" );
            }
        },
        close: function() {

        }
    });

    embedDialog = $( "#embed-dialog" ).dialog({
        autoOpen: false,
        height: 250,
        width: 350,
        modal: true,
        buttons: {
            "Close": function(){
                embedDialog.dialog( "close" );
            },
        },
        close: function() {
            // saveDialog.dialog( "close" );
        }
    });


    $('#build').on('click',function(){
        createChart();
    });

    $('#print').on('click', function(){
        printCanvas();
    });

    el_addSource.on("click",function(){
        getDataSource();
    });

    $('#save-picture').on('click',function(){
        var filename = chartOptions.title.replace(/ /g,"_");
        dg_filename.val(filename);
        saveDialog.dialog( "open" );
    });


    $('#save').on("click", function(){
        saveChart();
        $.notify("Chart Saved in My Charts","info");
        return false;
    });

    $('#embed').on('click', function(){
        buildIframe(function(){
            embedDialog.dialog("open");
        });
        return false;
    });



    jQuery(document).keydown(function(event) {
            if((event.ctrlKey || event.metaKey) && event.which == 83) {
                event.preventDefault();
                createChart();
                if(is_userloggdIn()){
                    saveChart();
                }
                if(is_userloggdIn()){
                    $.notify("Chart Built and saved","info");
                }else{
                    $.notify("Chart Built","info");
                }
                return false;
            }
        }
    );

    $('.app').on('click', '.source-add-commas', function(){
        var el = $(this);
        var output = el.attr('data-source');
        var outputEl = $('#' + output);
        var results = outputEl.val()
            .replace(/(\r\n|\n|\r)/gm,",");
        outputEl.val(results);
    })



    $(document).ready(function(){
        loadFromSettings();
    });

    function assignChartOptions(){
        chartOptions.type = el_chartType.val();
        chartOptions.width = el_chartWidth.val();
        chartOptions.height = el_chartHeight.val();
        chartOptions.labels = convertTextToArray(el_labels.val());
        chartOptions.labelname = el_labelName.val();
        chartOptions.title = el_chartTitle.val();
        chartOptions.colorscheme = el_colorscheme.val();

        if(el_fill.val() == "yes"){
            chartOptions.fill = true;
        }else{
            chartOptions.fill = false;
        }

        if(el_show_xaxis.val() == "yes"){
            chartOptions.showxlabel = true;
            chartOptions.xlabel = el_xaxis_label.val();
        }else{
            chartOptions.showxlabel = false;
        }

        if(el_show_yaxis.val() == "yes"){
            chartOptions.showylabel = true;
            chartOptions.ylabel = el_yaxis_label.val();
        }else{
            chartOptions.showylabel = false;
        }

        if(el_show_xaxis_values.val() =="yes"){
            chartOptions.showxaxis = true;
        }else{
            chartOptions.showxaxis = false;
        }

        if(el_show_yaxis_values.val() == "yes"){
            chartOptions.showyaxis = true;
        }else{
            chartOptions.showyaxis = false;
        }
        if(el_ds_type.val() == "money"){
            chartOptions.datasourcetype = "money";
        }else{
            chartOptions.datasourcetype = "numbers";
        }
        // last option
        chartOptions.datasource = createDataSourceArray(currentDataSource, chartOptions);
        return chartOptions;

    }

    function convertTextToArray(text){
        var labels = text.split(',');
        var validatedLabels = [];
        for(var i=0; i<= labels.length-1; i++){
            validatedLabels.push(labels[i].trim());
        }
        return validatedLabels;
    }

    function init(){
        assignChartOptions();
        var canvas = '<canvas id="myChart" width="'+chartOptions.width+'" height="'
            +chartOptions.height+'"></canvas>';

        el_container.empty().append(canvas);
    }

    function createChart(){
        trackEvents('Chart','create','Ads Profile');
        var settings = assignChartOptions();
        saveSettings(settings);
        BuildChart.init(settings, "myChart", el_container);
    }

    function saveSettings(settings){
        el_settings.attr('data-settings',JSON.stringify(settings))
    }

    function restoreSettings(settings){
        var settings = JSON.parse(settings);
        chartOptions = settings;
        BuildChart.init(settings, "myChart", el_container);
        loadElementsFromSettings(settings);
    }

    function getCurrentSettings(){
        return el_settings.attr('data-settings');
    }

    function isChartSaved(){
        if(el_settings.attr('data-id')){
            return true;
        }
        return false;
    }

    function getCurrentId(){
        if(isChartSaved()){
            return el_settings.attr('data-id');
        }
        return null;
    }

    function getCurrentChartRef(){
        if(isChartSaved()){
            return el_settings.attr('data-ref');
        }
        return null;
    }

    function is_userloggdIn(){
        if($("#save").length){
            return true;
        }
        return false;
    }


    function getDataSource(){
        updateDataSourceId(function(currentId){
            el_datasources.append(dsLayout.replaceAll('{id}', currentId));
            setDataSourceDeleteListener(currentDataSource);
        });
        /*
        updateDataSourceId(function(currentId){
            $.get('/site/GetDataSourceLayout',{id:currentId},function(response){
                el_datasources.append(response);
                setDataSourceDeleteListener(currentDataSource);
            });
        });*/
    }

    function updateDataSourceId(callback){
        currentDataSource++;
        if(currentDataSource >= 30 ){
            callback(currentDataSource);
        }else if(doesDataSourceExists(currentDataSource)){
            updateDataSourceId(callback);
        }else{
            callback(currentDataSource);
        }
    }

    function doesDataSourceExists(id){
        if($('#ds_container_'+id).length){
            return true;
        }
        return false;
    }

    function createDataSourceArray(currentDataSource, settings){
        var dataSource = [];
        for(var i=1; i<= currentDataSource + 2; i++){
            var elid = i;
            if($('#ds_container_'+elid).length){
                var myData = $('#ds_data_'+elid).val();
                var myLabel = $('#ds_label_'+elid).val();
                var cData = convertTextToArray(myData);
                if(chartOptions.type == "pie"
                    || chartOptions.type == "polarArea"
                 || chartOptions.type == "doughnut"){
                    var colors = createPieBackgroundColor(cData.length);
                }else{
                    var colors = createBackgroundColor(elid-1);
                }

                var dsourceObject = new Object();
                dsourceObject.label = myLabel;
                dsourceObject.data = cData;
                dsourceObject.fill = chartOptions.fill;
                if(chartOptions.type == "line"){
                    dsourceObject.borderColor = colors;
                }else{
                    if(chartOptions.fill){
                        dsourceObject.backgroundColor = colors;
                    }
                }
                if(!chartOptions.fill && chartOptions.type != "line"){
                    dsourceObject.borderColor = colors;
                }
                dataSource.push(dsourceObject)
            }
        }
        return dataSource;
    }

    function setDataSourceDeleteListener(id){
        $("#ds_remove_"+id).on("click", function(){
            $("#ds_container_"+id).remove();
            currentDataSource--;
        });
    }

    function convertDataToArray(){

    }
    function createBackgroundColor(limit){
        var colors = getColors(chartOptions.colorscheme);
        return colors[limit]
    }

    function createPieBackgroundColor(limit){
        var colors = getColors(chartOptions.colorscheme);
        var addColors = [];
        for(var i=0; i<= limit; i++){
            addColors.push(colors[i]);
        }
        return addColors;
    }

    function printCanvas()
    {
        trackEvents('Chart','print','Ads Profile');
        var dataUrl = document.getElementById('myChart').toDataURL(); //attempt to save base64 string to server using this var
        var windowContent = '<!DOCTYPE html>';
        windowContent += '<html>'
        windowContent += '<head><title>Print canvas</title></head>';
        windowContent += '<body>'
        windowContent += '<img src="' + dataUrl + '">';
        windowContent += '</body>';
        windowContent += '</html>';
        var printWin = window.open('','','width=740,height=560');
        printWin.document.open();
        printWin.document.write(windowContent);
        printWin.document.close();
        printWin.focus();
        printWin.print();

    }

    function savePicture(){
        trackEvents('Chart','picture','Ads Profile');
        var filename = dg_filename.val();
        var filetype = dg_filetype.val();
        var canvas = document.getElementById("myChart");
        setBackgroundForDownload();
        document.getElementById("myChart").src = canvas.toDataURL();
        Canvas2Image.saveAsImage(canvas,null, null, filetype, filename);
        createChart(); // refresh chart from changes
    }

    function setBackgroundForDownload(){
        var canvas = document.getElementById("myChart");
        var bgColor = dg_background.val();
        var ctx = canvas.getContext('2d');
        ctx.globalCompositeOperation = 'destination-over';
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    function uploadFile(){
        var formData = new FormData($("#file-uploader")[0]);
        $.ajax({
            url: '/site/SaveFile',
            type: 'POST',
            data: formData,
            async: false,
            cache: false,
            contentType: false,
            enctype: 'multipart/form-data',
            processData: false,
            success: function (response) {
                alert(response);
            }
        });
    }

    function saveChart(){
        $.ajax({
            url: '/site/savechart',
            type: 'POST',
            data: {'settings': getCurrentSettings(), 'name': chartOptions.title, 'id' : getCurrentId()},
            success: function (response) {
                var object = JSON.parse(response);
                console.log(response);
                el_settings.attr("data-id", object.id);
                el_settings.attr("data-ref", object.ref);
                trackEvents('Chart','save','Ads Profile');
            }
        });
    }

    function loadFromSettings(){
        var settings = getCurrentSettings();
        if(settings){
            restoreSettings(settings);
        }
    }

    function loadElementsFromSettings(settings){
        el_chartTitle.val(chartOptions.title);
        el_chartWidth.val(chartOptions.width);
        el_chartHeight.val(chartOptions.height);
        el_labels.val(chartOptions.labels);
        el_chartType.val(chartOptions.type);
        if(chartOptions.showxlabel){ el_show_xaxis.val("yes"); }
        else{ el_show_xaxis.val("no");}
        if(chartOptions.showylabel){ el_show_yaxis.val("yes"); }
        else{ el_show_yaxis.val("no");}
        if(chartOptions.showyaxis){
            el_show_yaxis_values.val("yes");
        }else{
            el_show_yaxis_values.val("no");
        }
        if(chartOptions.showxaxis){
            el_show_xaxis_values.val("yes");
        }else{
            el_show_xaxis_values.val("no");
        }
        el_colorscheme.val(chartOptions.colorscheme);
        if(chartOptions.fill){
            el_fill.val("yes");
        }else{
            el_fill.val("no");
        }
        loadSaveDataSources(chartOptions.datasource);

    }

    function loadSaveDataSources(datasource){
        for(var i=1; i<= datasource.length; i++){
            $.ajax({
                url: '/site/GetDataSourceLayout',
                type: 'GET',
                data: {id:i},
                async: false,
                success: function (response) {
                    var currentid = i -1;
                    el_datasources.append(response);
                    $('#ds_data_'+i).val(datasource[currentid]["data"]);
                    $('#ds_label_'+i).val(datasource[currentid]["label"]);
                    setDataSourceDeleteListener(i);
                    currentDataSource =  currentid;
                }
            });
        }
    }

    function buildIframe(callback){
        var ref = getCurrentChartRef();
        if(ref){
            var getUrl = window.location;
            var baseUrl = getUrl .protocol + "//" + getUrl.host + "/";
            var url = baseUrl + 'embed/' + getCurrentChartRef();
            var base = '<iframe width="'+chartOptions.width+'" height="'+chartOptions.height+'" ' +
                'src="'+url+'" frameborder="0" allow="' +
                'encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
            $('#embed-element').val(base);
            callback();
        }else{
            $.notify("Chart not saved","error");
        }
    }

    function trackEvents(name, action, tag){
        if(typeof gtag !== "undefined"){
            gtag('event', action, {
                'event_category': name,
                'event_label': tag,
            });
        }
    }


})(jQuery);
;