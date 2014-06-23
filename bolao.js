var height = 28;
var xAdvance = 405;
var yTextAdvance = -10;
var widthMultiplier = 5;
var rainDuration = 1000;
var sortDuration = 500;
var goLeftDuration = 50;
var pointsDuration = 20;
var assyncDurationDown = 30;
var assyncDurationUp = 10;
var topViewport = 50;
var bottom = $(window).height()*4/5;
var mode = 'pressa';
var barHeight = 28;

var POINTS_COLUMN = 0;
var SIZE_COLUMN = 1;
var ID_COLUMN = 2;
var POSITION_COLUMN = 3;
var NAME_COLUMN = 4;

function left(d) {
   return d.left
}

function right(d) {
   return d.right
}


function pontos(palpite, efetivo) {
  if (palpite.left == efetivo.left && palpite.right == efetivo.right) {
    return 8;
  } else if (palpite.left - palpite.right == efetivo.left - efetivo.right) {
    return 5;
  } else if (palpite.left > palpite.right && efetivo.left > efetivo.right) {
    return 3;
  } else if (palpite.left < palpite.right && efetivo.left < efetivo.right) {
    return 3;
  } else {
    return 0;
  }
}

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function sortFunction(a,b) {
  return (b[POINTS_COLUMN] - a[POINTS_COLUMN])*10000 + a[NAME_COLUMN].localeCompare(b[NAME_COLUMN])
}

function start() {
  dataset = [];
  svg = d3.select("#jogos").append("svg:svg")
  addPlayers(svg);
}

function sort() {
  tabelao.sort(sortFunction);
  for(var i in tabelao) {
    tabelao[i][POINTS_COLUMN] = 0;
  }
}

function calculate() {
  tabelao.sort(sortFunction);
  var lastPoint = -1;
  var position = 0;
  for(var i in tabelao) {
    if (tabelao[i][POINTS_COLUMN] != lastPoint) {
      lastPoint = tabelao[i][POINTS_COLUMN];
      position = parseInt(i) + 1;
    }
    if (tabelao[i][POSITION_COLUMN] instanceof Array) {
      tabelao[i][POSITION_COLUMN].unshift(position);
    } else {
      tabelao[i][POSITION_COLUMN] = [position];
    }
  }
}


    var spike = [];
    var xAxis = d3.scale.linear().range([0, 100]);
    var yAxis = d3.scale.linear().range([height - 2 , 2]);
    xAxis.domain(1,48);
    yAxis.domain([0,tabelao.length]);
    var line = d3.svg.line()
             .x(function(d,i) { return xAxis(i); })
             .y(function(d) { return yAxis(d); });

function addPlayers(svg) {

  svg.selectAll("g")
  .data(tabelao)
  .enter()
  .append("g")
  .attr("transform",function(d,i) {
    return "translate(0," + ((i+1)*(height+1)-3) + ")"
  })
  .each(function(d,i) {
    var playerName = d[NAME_COLUMN].toUpperCase();
    var playerGroup = d3.select(this);

    playerGroup.attr("class","c" + d[ID_COLUMN]);

    playerGroup
     .append("rect")
     .attr("x",5)
     .attr("y",0)
     .attr("width",400)
     .attr("height",height)
     .attr("fill","#888")
     .attr("opacity",0.1);

    playerGroup
    .append("text")
    .text(playerName)
    .attr("x",38)
    .attr("y",height + yTextAdvance)
    .attr("font-family","'Gotham SSm A', 'Gotham SSm B', 'Lucida Grande','Lucida Sans Unicode', Tahoma, sans-serif")
    .attr("font-size","10px")
    .attr("fill","white");


    playerGroup
    .append('path')
    .datum(spike)
    .attr("transform","translate(250,0)")
    .attr('class', 'sparkline')
    .attr("stroke", "white")
    .attr("fill","none")
    .attr('d', line);    



    playerGroup
    .append("text")
    .text("")
    .attr("x",350)
    .attr("y",height + yTextAdvance)
    .attr("width",200)
    .attr("height",height)
    .attr("font-family","'Gotham SSm A', 'Gotham SSm B', 'Lucida Grande','Lucida Sans Unicode', Tahoma, sans-serif")
    .attr("font-size","10px")
    .attr("fill","white")
    .attr("class","delta");

    playerGroup
    .append("text")
    .text("")
    .attr("x",380)
    .attr("y",height + yTextAdvance)
    .attr("font-family","'Gotham SSm A', 'Gotham SSm B', 'Lucida Grande','Lucida Sans Unicode', Tahoma, sans-serif")
    .attr("font-family","sans-serif")
    .attr("font-size","10px")
    .attr("fill","#aaa")
    .attr("class","points");

    playerGroup
    .append("text")
    .text("")
    .attr("x",15)
    .attr("y",height + yTextAdvance)
    .attr("font-family","'Gotham SSm A', 'Gotham SSm B', 'Lucida Grande','Lucida Sans Unicode', Tahoma, sans-serif")
    .attr("font-family","sans-serif")
    .attr("font-size","10px")
    .attr("fill","#aaa")
    .attr("class","position");

  })

}


function adjustViewport(y) {
   if (mode=='pressa') return;
   if (y > bottom) {
      var diff = y - bottom;
      topViewport += diff;
      bottom += diff;
      $(window).scrollTop(topViewport);
   } else if (y < topViewport) {
      var diff = topViewport - y;
      if (topViewport - diff >0) {
        topViewport -= diff;
        bottom -= diff;
      } else {
        top -= topViewport;
        bottom -= topViewport;
      }
      $(window).scrollTop(topViewport);
   }
}

function closure(x) {
   return function() {
     adjustViewport(x);
   }
}

function buildUpdate(jIndex) {
  return function(n,m, callback) {

  var j = { "left": n, "right": m};

  dataset.push(j);

  var resultados = d3.select("#resultados")
  var delay = 0;
  var stats = {0: 0, 3:0, 5:0, 8: 0};

  d3.selectAll('.delta').text("")
  d3.selectAll('.points').text("")


  resultados.selectAll("div")
    .data(dataset)
    .enter()
    .append("div")
    .each(function(d,i) {
      var that = this;

      for (var index in tabelao) {
         var pts = pontos({left: tabelao[index][jIndex], right:tabelao[index][jIndex+1]},d);
         stats[pts]++;
         var playerName = tabelao[index][NAME_COLUMN];
         var barWidth = (1 + pts)*widthMultiplier;
         var y = ((parseInt(index)+1)*(height+1)-3);

         var pointsBar = d3.select('.c' + tabelao[index][ID_COLUMN] + ' .points');


         var bar = d3.select('.c' + tabelao[index][ID_COLUMN])
          .append("rect")
          .attr("x",$(window).width())
          .attr("y",height-barHeight)
          .attr("width",barWidth)
          .attr("height",barHeight)
          .attr("fill",{0:"#555",3:"#33ccff",5:"green",8:"yellow"}[pts])
          .attr("opacity",0.4);


         tabelao[index][POINTS_COLUMN] += pts;

         bar
          .transition()
          .delay(delay)
          .duration(rainDuration)
          .attr("x",xAdvance + tabelao[index][SIZE_COLUMN])
          .each("start", closure(y));

          tabelao[index][SIZE_COLUMN] += barWidth;

          pointsBar.text(tabelao[index][POINTS_COLUMN]);

         delay+= assyncDurationDown;
      }
      delay+=rainDuration;
      calculate();
      for (var index in tabelao) {
         var y = ((parseInt(index)+1)*(height+1)-3);
         var bar = d3.select('.c' + tabelao[index][ID_COLUMN])

         bar
            .transition()
            .delay(delay)
            .duration(sortDuration)
            .attr("transform","translate(600," + y + ")")
            .each("start", closure(y));


        delay+= assyncDurationDown;
     }
     delay+=sortDuration;
     for (var j in tabelao) {
         var index = tabelao.length - parseInt(j) -1;
         var y = ((index+1)*(height+1)-3);
         var bar = d3.select('.c' + tabelao[index][ID_COLUMN])

         bar
            .transition()
            .delay(delay)
            .duration(goLeftDuration)
            .attr("transform","translate(0," + y + ")")
            .each("start", closure(y));

        delay+= assyncDurationUp;
     }
     delay+=goLeftDuration;
     for (var index in tabelao) {
          var deltaBar = d3.select('.c' + tabelao[index][ID_COLUMN ] + ' .delta');
          var positionBar = d3.select('.c' + tabelao[index][ID_COLUMN] + ' .position');
          var sparklineBar = d3.select('.c' + tabelao[index][ID_COLUMN] + ' .sparkline');

          var campanha = tabelao[index][POSITION_COLUMN];
          if (campanha.length > 1) {
            var delta = campanha[0] - campanha[1];
            var deltaStr = "-"+delta;
            var color = "#f33d6c";
            if (delta < 0) {
               deltaStr = "+" + (-delta)
               color = "#45e954"
            } else if (delta == 0) {
               deltaStr = "";
               // color = "#f3cf3d";
            }

             deltaBar
               .transition()
               .delay(delay)
               .duration(pointsDuration)
               .text(deltaStr)
               .attr("fill",color);

            positionBar.text(tabelao[index][POSITION_COLUMN][0]);

            xAxis.domain([0,48]);
            yAxis.domain([tabelao.length, 0]);
            line = d3.svg.line()
             .x(function(d,i) { return xAxis(i); })
             .y(function(d) { return yAxis(d); });            
            sparklineBar.datum(tabelao[index][POSITION_COLUMN].reverse()).attr("d",line);

          }


         delay+= assyncDurationUp;
      }
      delay+=pointsDuration;


     jIndex += 3;
    });


    setTimeout(function() {
      callback(stats);
    },delay);

  }
}
