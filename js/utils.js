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