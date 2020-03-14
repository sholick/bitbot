//function to build the chart

var chartCount = 0;

function createConfig(dataList, labels = null) {

	var max = Math.max(...dataList);
  var min = Math.min(...dataList);
  if (!labels) {
    var indexes = Array.from(dataList, i => dataList.indexOf(i))
  } else {
    var indexes = labels
  }
  return {
      type: 'line',
      data: {
      labels: indexes,
      datasets: [{
          label: 'USD',
            backgroundColor: 'rgba(127,218,255,0.8)',
            borderColor: 'rgb(25,134,178)',
            data: dataList,
            fill: 'origin',
            pointRadius: '0',
            pointBackgroundColor: 'white',
            borderWidth: 2
          }]
          },
      options: {
          maintainAspectRatio: false,
          scales: {
              xAxes: [{
                display: (labels ? true : false),
                gridLines: {
                  display: true,
                  drawBorder: true,
                  drawOnChartArea: false,
                },
                ticks: {
                  autoskip: true,
                  autoSkipPadding: 70,
                  callback: function(dataLabel, index) {
                    return index % 2 === 0 ? labels? dataLabel.format('DD MMM') : dataLabel : '';
                  }
                }
              }],
              yAxes: [{
                  stacked: false,
                  //ticks:{
                  //  min: min - (max-min)*0.2,
                  //  max: max + (max-min)*0.2
                  //}
              }]
          },
          tooltips:{
            intersect: false,
            xPadding: 20,
            bodyFontSize: 10,
            callbacks:{
              //title: function(item, data){
                //if (labels){
                  //var label = data.datasets[item.datasetIndex] || '';
                  //label += moment(item.xLabel).format('DD MMM HH:mm');
                  //return "gg";
                //}
              //},
              //title: function(item, data){
                //if (! labels) return;
               // else{
                //  return data.datasets[item.datasetIndex] || '';
                //}
                //var title = data.datasets[item.datasetIndex].title || '';
                //if (labels) title = label + '' + item.xLabel.format('DD MMM HH:mm');
                //return title;
              //},
              label: function(item, data){
                var label = data.datasets[item.datasetIndex].label || '';
                if (label) label +=': ';
                label += item.yLabel.toPrecision(5);
                return label;
              }
            }
          },
          legend: {
              display: false,
          },
      }
  };
}

function createChart(dataList, id){

        chartCount += 1;
        var box = document.getElementById(id);

        var canvas = document.createElement('canvas');
        canvas.id = "_Chart_" + id;
        canvas.width = "300";
        canvas.height = "230";
        box.appendChild(canvas);

        var ctx = canvas.getContext('2d');
        var config = createConfig(dataList);
        new Chart(ctx, config);
        
}

function createPageChart(dataList, labels = null){

        var area = document.getElementById("chartArea");
        var canvas = document.createElement('canvas');
        canvas.id = "_Chart_";
        canvas.width = "600";
        canvas.height = "400";
        area.appendChild(canvas);

        var ctx = canvas.getContext('2d');
        var config = createConfig(dataList, labels);
        new Chart(ctx, config);
        
}