function checkImage(url) {
    var image =  new Image();
    image.onload = () => {if(this.width > 0) return true}
    image.onerror = () => { return false }
    image.src = url;
}

function activePage(index){
    $('a[action="select-page"]').parent().removeClass("active")
    $('a[action="select-page"][page=' + (index) + ']').parent().addClass("active")
}

function getIndexPage(index){
    return Pages.indexOf(Pages.filter((e) => e.index == index)[0])
}

function savePage(){
    Pages[getIndexPage(Page.index)] = Page
}

function saveItems(){
    Page.items = Items
}

function changeSlotImg(slot,item){
    url = `./img/textures/${item}.png`;
    if(!checkImage(url)) url.replace(item, "air")
    $(`.grid[slot="${slot}"] > img`).attr("src", url)
}

function menuState(lower, noitem){
    lower ? $("#lower").show() : $("#lower").hide();
    noitem ? $("#no-item-loaded > h2").show() : $("#no-item-loaded > h2").hide()
}