var api = "http://ddragon.leagueoflegends.com/cdn/6.11.1/";

axios.get(api + "data/en_US/item.json")
  .then(function(res) {
    console.log(res.data.data);
    generate(res.data.data);
  })
  .catch(function(res) {
    console.log('failed get', res);
  });

var jungleItems = {
  //3706: "stalkersblade",
  1400: "stalkersblade-red",
  1401: "stalkersblade-green",
  1402: "stalkersblade-blue",
  1416: "stalkersblade-yellow",
  
  //3711: "trackersknife",
  1408: "trackersknife-red",
  1409: "trackersknife-green",
  1410: "trackersknife-blue",
  1418: "trackersknife-yellow",
  
  //3711: "skirmisherssabre",
  1412: "skirmisherssabre-red",
  1413: "skirmisherssabre-green",
  1414: "skirmisherssabre-blue",
  1419: "skirmisherssabre-yellow",
};

var spriteSize = 32;
var spriteColumns = 8;

function generate(items) {
  var css = ['/* LOLITEMS CSS */', '.md a[href*=item-]:after{content:"";display:inline-block;','background-image:url(%%lolitems%%);cursor:default;width:32px;height:32px}'];
  
  var itemIds = Object.keys(items);
  var tiles = itemIds.length + 1; //first tile reserved for question mark
  console.log(itemIds.length + ' items');
  
  var canvas = document.createElement('canvas');
  
  canvas.setAttribute('width', spriteSize * spriteColumns);
  canvas.setAttribute('height', Math.ceil(tiles / spriteColumns) * spriteSize);
  
  var ctx = canvas.getContext('2d');
  ctx.fillStyle = '#f00';
  ctx.textAlign = 'center';
  ctx.font = spriteSize + 'px monospace';
  ctx.fillText('?', spriteSize / 2, spriteSize * 0.85, spriteSize);
  
  var promises = itemIds.map(function(id, i) {
    return new Promise(function(resolve, reject) {
      var item = items[id];
      var pos = i + 1;
      var x = (pos % spriteColumns) * spriteSize;
      var y = (0|(pos / spriteColumns)) * spriteSize;  

      var img = new Image();
      img.setAttribute('crossOrigin', 'anonymous');
      img.onload = function() {
        ctx.drawImage(img, x, y, spriteSize, spriteSize);
        resolve();
      };
      img.src = api + "img/item/" + item.image.full;

      var itemName = item.name.replace(/[^a-zA-Z0-9]+/g, '').toLowerCase();
      if (jungleItems.hasOwnProperty('' + id))
        itemName = jungleItems[id];
        
      css.push('.md a[href$=' + itemName + ']:after{background-position:-' + x + 'px -' + y +'px}');
    });
  });

  Promise.all(promises).then(function() {
    var code = document.createElement('code');
    code.innerText = css.join('\n');
    document.getElementById('css').appendChild(code);
    
    var dataUrl = canvas.toDataURL("image/jpeg", 0.99);
    var domimg = document.createElement('img');
    domimg.src = dataUrl;
    document.getElementById('image').appendChild(domimg);
  });
}