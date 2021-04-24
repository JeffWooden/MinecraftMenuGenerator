var Menu = {options: {namespace: "core", version: "1.16"}};
var Pages = [];
var Page;
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
                new_menu()
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

    $("a[button=new]").click()
})


function new_menu(){
    Items = Array.from(Array(4*9).keys()).map(x => Object.create({Slot: x,id:"minecraft:air",Count:1,NBT:""}))
    Item = Items[0]
    Page = {index: 0, name: "Page principale", items: Items}
    Pages.push(Page)
    Menu.name = "Menu", Menu.pages = Pages;
    load()
}

function load(){
    $("#content").show()
    load_pages()
    load_slots()
    $("#menu-name").text(Menu.name)
    $("[option]").attr("disabled", "true")
}

function load_pages(){
    $("#pages").empty()
    for(i in Pages){
        $("#pages").append(`
        <li class="list-group-item"><a href="#" class="d-flex gap-2 align-items-center" button="select-page" page="${Pages[i].index}"><span class="badge rounded-pill">${Pages[i].index}</span>${Pages[i].name}</a></li>
        `)
    }
}

function load_slots(){
    $("#slots-grid").empty()
    lines = 4
    cols = 9
    for(i=0;i<lines;i++){ // TODO: Les boucles for s'adapteront
        line = i == 3 ? 0 : i+1
        $("#slots-grid").append(`
        <div class="d-flex grid-item slots-line${line == 0 ? " mt-3" : ""}" line="${line}"></div>
        `)
        cursor = $("#slots-grid .slots-line").last()
        for(j=0;j<cols;j++){
            slot = cols*line + j;
            cursor.append(`
            <span class="grid" slot="${slot}"><img src="./img/textures/creeper_banner_pattern.png" alt=""></span>
            `)
        }
    }
}