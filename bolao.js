

var height = 18;
var xAdvance = 0;
var widthMultiplier = 10;
var rainDuration = 1000;
var sortDuration = 500;
var goLeftDuration = 50;
var assyncDurationDown = 30;
var assyncDurationUp = 10;
var topViewport = 50;
var bottom = $(window).height()*4/5;
var mode = 'pressa';

var POINTS_COLUMN = 0;
var ID_COLUMN = 1;
var POSITION_COLUMN = 2;
var NAME_COLUMN = 3;

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

function sortFunction(a,b) {
  return b[POINTS_COLUMN] - a[POINTS_COLUMN] + a[NAME_COLUMN].localeCompare(b[NAME_COLUMN])
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
      position++;
    }
    if (tabelao[i][POSITION_COLUMN] instanceof Array) {
      tabelao[i][POSITION_COLUMN].unshift(position);
    } else {
      tabelao[i][POSITION_COLUMN] = [position];
    }
  }
}


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
    .append("text")
    .text(playerName)
    .attr("x",10)
    .attr("y",height-5)
    .attr("font-family","sans-serif")
    .attr("font-size","10px")
    .attr("fill","#777")

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


  resultados.selectAll("div")
    .data(dataset)
    .enter()
    .append("div")
    .each(function(d,i) {
      var that = this;

      for (var index in tabelao) {
         var pts = pontos({left: tabelao[index][jIndex], right:tabelao[index][jIndex+1]},d);
         var playerName = tabelao[index][NAME_COLUMN];
         var  barWidth = (1 + pts)*widthMultiplier;
         var y = ((parseInt(index)+1)*(height+1)-3);

         var bar = d3.select('.c' + tabelao[index][ID_COLUMN])
          .append("rect")
          .attr("x",$(window).width())
          .attr("y",0)
          .attr("width",barWidth)
          .attr("height",height)
          .attr("fill",{0:"#555",3:"#33ccff",5:"green",8:"yellow"}[pts])
          .attr("opacity",0.4);

         bar
          .transition()
          .delay(delay)
          .duration(rainDuration)
          .attr("x",xAdvance + tabelao[index][POINTS_COLUMN])
          .each("start", closure(y));

         delay+= assyncDurationDown;
         tabelao[index][POINTS_COLUMN] += barWidth;
      }
      delay+=rainDuration;
      calculate();
      for (var index in tabelao) {
         var y = ((parseInt(index)+1)*(height+1)-3);
         var bar = d3.select('.c' + tabelao[index][ID_COLUMN ])
         var campanha = tabelao[index][POSITION_COLUMN];
         if (campanha.length > 1) {
           var delta = campanha[0] - campanha[1];
           var deltaStr = ""+delta;
           var color = "#f33d6c";
           if (delta < 0) {
              deltaStr = "+" + delta
              color = "#45e954"
           } else if (delta == 0) {
              color = "#f3cf3d";
           }

           bar
              .append("text")
              .text(deltaStr)
              .attr("x",xAdvance + tabelao[index][POINTS_COLUMN])
              .attr("y",height-5)
              .attr("font-family","sans-serif")
              .attr("font-size","10px")
              .attr("fill",color)    

         }




         bar
            .transition()
            .delay(delay)
            .duration(sortDuration)
            .attr("transform","translate(212," + y + ")")
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
     jIndex += 3;
    });

    setTimeout(function() {
      callback();
    },delay);

  }
}
