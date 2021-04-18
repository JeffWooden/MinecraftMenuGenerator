var Menu;
var Pages;
var Items;
var Item;

$(document).ready(() => {
    // Détection clics sur des boutons
    $("a").click(function(e){
        e.preventDefault()
        action = $(this).attr("button")
        if(!action) return;
        switch(action){
            case "new":
                load()
                $("#content").show()
            case "open":
            case "save":
            case "export":
                console.log("Menu")
                break
            default:
                console.log("Default")
                break
        }
    })

    // Touches raccourcis
    shortcuts = {
        "n": "new",
        "o": "open",
        "s": "save",
        "e": "export",
        "Backspace": "remove-item",
        "+": "add-page",
        "-": "remove-page"
    }
    $(window).keydown(function(e){
        e.preventDefault()
        if(!e.altKey || (e.altKey && e.key == "Alt")) return;
        if(!shortcuts[e.key]) return console.log(`Raccourcis "Alt + ${e.key}" inconnu.`)
        $(`a[button=${shortcuts[e.key]}]`).click()
    })
})


function load(){
    $("#content").show()
    $("#slots-grid").empty()
    for(i=0;i<4;i++){
        line = i == 3 ? 0 : i+1
        $("#slots-grid").append(`
        <div class="d-flex grid-item slots-line${line == 0 ? " mt-3" : ""}" line="${line}"></div>
        `)
        cursor = $("#slots-grid .slots-line").last()
        for(j=0;j<9;j++){
            slot = 9*line + j;
            cursor.append(`
            <span class="grid" slot="${slot}"><img src="./img/textures/creeper_banner_pattern.png" alt=""></span>
            `)
        }
    }
}