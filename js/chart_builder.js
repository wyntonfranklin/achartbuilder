var BuildChart = (function($){

    var myChart = null;

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


    function init(settings, id, container){
        $.extend(chartOptions,settings);
        var canvas = '<canvas id="'+id+'" width="'+chartOptions.width+'" height="'
            +chartOptions.height+'"></canvas>';
        container.empty().append(canvas);
        createChart(id);
    }

    function createChart(id){
        var ctx = document.getElementById(id).getContext('2d');

        if ( myChart != null ) {
            myChart.destroy();
        }
        myChart = new Chart(ctx, getOptions());
    }

    function getOptions(){
        var options = new Object();
        if(chartOptions.type == "stackedBar"){
            options.type = "bar";
        }else{
            options.type = chartOptions.type;
        }
        options.data = getData();
        options.options = getSettings();
        return options;
    }

    function getData(){
        var data = new Object();
        data.labels = chartOptions.labels;
        data.datasets = chartOptions.datasource;
        return data;
    }

    function getSettings(){
        var settings = new Object();
        settings.scales = new Object();
        var yAxesOptions = new Object();
        var xAxesOptions = new Object();
        settings.responsive = false;
        settings.scales.yAxes = [];
        settings.scales.xAxes = [];
        yAxesOptions.ticks = {
            beginAtZero: true
        };

        if(chartOptions.showylabel){
            yAxesOptions.scaleLabel = {
                display: true,
                labelString: chartOptions.ylabel
            }
        }
        yAxesOptions.display = chartOptions.showyaxis;
        xAxesOptions.ticks = {
            beginAtZero: true
        }

        xAxesOptions.display = chartOptions.showxaxis;

        if(chartOptions.showxlabel){
            xAxesOptions.scaleLabel = {
                display: true,
                labelString: chartOptions.xlabel
            }
        }

        if(chartOptions.type =="stackedBar"){
            xAxesOptions.stacked = true
        }
        if(chartOptions.type == "stackedBar"){
            yAxesOptions.stacked = true;
        }

        if(chartOptions.datasourcetype == "money"){
            yAxesOptions.ticks.maxTicksLimit = 5;
            yAxesOptions.ticks.padding = 5;
            yAxesOptions.ticks.callback = function(value, index, values) {
                return '$' + number_format(value);
            }
        }

        settings.scales.yAxes.push(yAxesOptions);
        settings.scales.xAxes.push(xAxesOptions);
        settings.title =  {
            display: true,
            text: chartOptions.title
        };
        return settings;
    }

    function createBackgroundColor(limit, settings){
        var colors = getColors(settings.colorscheme);
        return colors[limit]
    }

    function createPieBackgroundColor(limit, settings){
        var colors = getColors(settings.colorscheme);
        var addColors = [];
        for(var i=0; i<= limit; i++){
            addColors.push(colors[i]);
        }
        return addColors;
    }

    function convertTextToArray(text){
        var labels = text.split(',');
        var validatedLabels = [];
        for(var i=0; i<= labels.length-1; i++){
            validatedLabels.push(labels[i].trim());
        }
        return validatedLabels;
    }

    function createDataSourceArray(currentDataSource, chartSettings){
        var dataSource = [];
        for(var i=1; i<= currentDataSource + 2; i++){
            var elid = i;
            if($('#ds_container_'+elid).length){
                var myData = $('#ds_data_'+elid).val();
                var myLabel = $('#ds_label_'+elid).val();
                var cData = convertTextToArray(myData);
                if(chartSettings.type == "pie" || chartSettings.type == "polarArea"){
                    var colors = createPieBackgroundColor(cData.length, chartSettings);
                }else{
                    var colors = createBackgroundColor(elid-1, chartSettings);
                }

                var dsourceObject = new Object();
                dsourceObject.label = myLabel;
                dsourceObject.data = cData;
                dsourceObject.fill = chartSettings.fill;
                if(chartSettings.type == "line"){
                    dsourceObject.borderColor = colors;
                }else{
                    if(chartSettings.fill){
                        dsourceObject.backgroundColor = colors;
                    }
                }
                if(!chartSettings.fill && chartOptions.type != "line"){
                    dsourceObject.borderColor = colors;
                }
                dataSource.push(dsourceObject)
            }
        }
        return dataSource;
    }

    function number_format(number, decimals, dec_point, thousands_sep) {
        // *     example: number_format(1234.56, 2, ',', ' ');
        // *     return: '1 234,56'
        number = (number + '').replace(',', '').replace(' ', '');
        var n = !isFinite(+number) ? 0 : +number,
            prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
            sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
            dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
            s = '',
            toFixedFix = function(n, prec) {
                var k = Math.pow(10, prec);
                return '' + Math.round(n * k) / k;
            };
        // Fix for IE parseFloat(0.55).toFixed(0) = 0;
        s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
        if (s[0].length > 3) {
            s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
        }
        if ((s[1] || '').length < prec) {
            s[1] = s[1] || '';
            s[1] += new Array(prec - s[1].length + 1).join('0');
        }
        return s.join(dec);
    }


    return {
        init : init,
        createDataSourceArray : createDataSourceArray
    }
})(jQuery);
