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
  return b[0] - a[0] + a[3].localeCompare(b[3])
}

function start() {
  dataset = [];
  svg = d3.select("#jogos").append("svg:svg")
  addPlayers(svg);
}

function reset() {
  dataset = [];
  tabelao.sort(sortFunction);
  for(var i in tabelao) {
    tabelao[i][0] = 0;
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
    var playerName = d[3].toUpperCase();
    var playerGroup = d3.select(this);

    playerGroup.attr("class","c" + d[1]);

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
         var playerName = tabelao[index][3];
         var  barWidth = (1 + pts)*widthMultiplier;

        //  if (pts>0) {
            var y = ((parseInt(index)+1)*(height+1)-3);

            var bar = d3.select('.c' + tabelao[index][1])
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
            .attr("x",xAdvance + tabelao[index][0])
            .each("start", closure(y));

            delay+= assyncDurationDown;
            tabelao[index][0] += barWidth;
        //  }
      }
      delay+=rainDuration;
      tabelao.sort(sortFunction)
      for (var index in tabelao) {
         var y = ((parseInt(index)+1)*(height+1)-3);
         var bar = d3.select('.c' + tabelao[index][1])

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
         var bar = d3.select('.c' + tabelao[index][1])

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
