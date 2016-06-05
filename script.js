var api = "http://ddragon.leagueoflegends.com/cdn/6.11.1/";

axios.get(api + "data/en_US/map.json").then(function(res) {
  var maps = res.data.data;
  console.log(maps);
  //<label><input type="checkbox" name="maps" value="1" /> Summoner's Rift</label>
  var mapContainer = document.getElementById('maps');
  
  var ids = Object.keys(maps).sort();
  for (var i = 0; i < ids.length; i++) {
    var map = maps[ids[i]];
    var label = document.createElement('label');
    label.innerHTML = '<input type="checkbox" name="maps" value="' + ids[i] + '" /> ' + map.MapName;
    mapContainer.appendChild(label);
  }
  
  var def = 11;
  mapContainer.querySelector('input[value="' + def + '"]').checked = true;
  
}).catch(function(res) {
  console.log(res);
  alert('failed to get map list');
});

var itemsPromise = axios.get(api + "data/en_US/item.json").then(function(res) {
  console.log(res.data.data);
  return res.data.data;
}).catch(function(res) {
  console.log(res);
  alert('failed to get item list');
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

var blacklist = [3671, 3672, 3673, 3675]; //jungle-enchanted boots

function getCheckedMaps() {
  var inputs = document.getElementById('maps').getElementsByTagName('input');
  var maps = [];
  for (var i = 0; i < inputs.length; i++)
    if (inputs[i].checked)
      maps.push(inputs[i].value);
  return maps;
}
function getCheckedChamps() {
  var inputs = document.getElementById('champs').getElementsByTagName('input');
  var champs = [];
  for (var i = 0; i < inputs.length; i++)
    if (inputs[i].checked)
      champs.push(inputs[i].value);
  return champs;
}

var spriteSize = 32;
var spriteColumns = 8;

function generate() {
  itemsPromise.then(function(items) {
    var css = ['/* LOLITEMS CSS */', '.md a[href*=item-]:after{content:"";display:inline-block;','background-image:url(%%lolitems%%);cursor:default;width:' + spriteSize + 'px;height:' + spriteSize + 'px}'];
    
    // filter based on input
    var maps = getCheckedMaps();
    var champs = getCheckedChamps();
    var itemIds = Object.keys(items);
    itemIds.forEach(function(id) {
      if (jungleItems.hasOwnProperty('' + id))
        items[id].val = jungleItems[id];
      else
        items[id].val = items[id].name.replace(/[^a-zA-Z0-9]+/g, '').toLowerCase()
    });
    itemIds.sort(function(a, b) {
      var aname = items[a].val;
      var bname = items[b].val;
      if (aname < bname) return -1;
      if (bname < aname) return 1;
      return 0;
    });
    itemIds = itemIds.filter(function(id) {
      //remove blacklisted items
      for (var i = 0; i < blacklist.length; i++)
        if ('' + blacklist[i] === id)
          return false;
      return true;
    }).filter(function(id) {
      // remove if not included in map selection
      for (var i = 0; i < maps.length; i++)
        if (items[id].maps[maps[i]]) // {"1": true}
          return true;
      return false;
    }).filter(function(id) {
      // remove if not in champ selection
      var champ = items[id].requiredChampion;
      if (champ && champs.indexOf(champ) < 0)
        return false;
      return true;
    });
    //self referencing
    itemIds = itemIds.filter(function(id, i) {
      //console.log(i);
      //if (i > 0)
      //  console.log(items[itemIds[i-1]].val, items[id].val);
      // remove duplicates
      if (i > 0 && items[id].val === items[itemIds[i - 1]].val) {
        console.log('removed '+ items[itemIds[i - 1]].val);
        return false;
      }
      return true;
    });/*.sort(function(a, b) {
      //put back in normal order
      return a - b;
    });//*/
    
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
        var pos = i + 1;
        var item = items[id];

        var x = (pos % spriteColumns) * spriteSize;
        var y = (0|(pos / spriteColumns)) * spriteSize;  

        var img = new Image();
        img.setAttribute('crossOrigin', 'anonymous');
        img.onload = function() {
          ctx.drawImage(img, x, y, spriteSize, spriteSize);
          resolve();
        };
        img.src = api + "img/item/" + item.image.full;
        
        css.push('.md a[href$=-' + item.val + ']:after{background-position:-' + x + 'px -' + y +'px}');
      });
    });

    Promise.all(promises).then(function() {
      var code = document.getElementById('css');
      code.innerText = css.join('\n');

      var dataUrl = canvas.toDataURL("image/png");
      var domimg = document.getElementById('img');
      domimg.src = dataUrl;
      document.getElementById('image').appendChild(domimg);
    }).catch(function(err) {
      console.log(err);
    });
  });
}