//function to build the chart

var chartCount = 0;

function createConfig(dataList) {

	var max = Math.max(...dataList);
  var min = Math.min(...dataList);
  var indexes = Array.from(dataList, i => dataList.indexOf(i))
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
          scales: {
              xAxes: [{
                display: false,
                gridLines: {
                  display: true,
                  drawBorder: true,
                  drawOnChartArea: false,
                },
                ticks: {
                  callback: function(dataLabel, index) {
                    // Hide the label of every 2nd dataset. return null to hide the grid line too
                    return index % 2 === 0 ? dataLabel : '';
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
              title: function(){},
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
        //var div = document.createElement('div');
        //div.classList.add('chartContainer');

        var canvas = document.createElement('canvas');
        canvas.id = "_Chart_" + id;
        canvas.width = "300";
        canvas.height = "230";
        //div.appendChild(canvas);
        box.appendChild(canvas);

        var ctx = canvas.getContext('2d');
        var config = createConfig(dataList);
        new Chart(ctx, config);
        
}