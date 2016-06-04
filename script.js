var api = "http://ddragon.leagueoflegends.com/cdn/6.11.1/";

axios.get(api + "data/en_US/item.json")
  .then(function(res) {
    console.log(res.data.data);
    generate(res.data.data);
  })
  .catch(function(res) {
    console.log('failed get', res);
  });

var spriteSize = 32;
var spriteColumns = 8;

function generate(items) {
  var css = ['/* LOLITEMS CSS */', '.md a[href*=item-]:after{content:"";display:inline-block;','background-image:url(%%lolitems%%);cursor:default;width:32px;height:32px}'];
  
  var itemIds = Object.keys(items);
  console.log(itemIds.length + ' items');
  
  var canvas = document.createElement('canvas');
  
  canvas.setAttribute('width', spriteSize * spriteColumns);
  canvas.setAttribute('height', Math.ceil(itemIds.length / spriteColumns) * spriteSize);
  
  var ctx = canvas.getContext('2d');
  
  var promises = itemIds.map(function(id, i) {
    return new Promise(function(resolve, reject) {
      var item = items[id];
      var x = (i % spriteColumns) * spriteSize;
      var y = (0|(i / spriteColumns)) * spriteSize;  

      var img = new Image();
      img.setAttribute('crossOrigin', 'anonymous');
      img.onload = function() {
        ctx.drawImage(img, x, y, spriteSize, spriteSize);
        resolve();
      };
      img.src = api + "img/item/" + item.image.full;

      css.push('.md a[href$=' + item.name.replace(/[^a-zA-Z0-9]+/g, '').toLowerCase() + ']:after{background-position:-' + x + 'px -' + y +'px}');
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