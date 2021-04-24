function checkImage(url) {
    var image =  new Image();
    image.onload = () => {if(this.width > 0) return true}
    image.onerror = () => { return false }
    image.src = url;
}