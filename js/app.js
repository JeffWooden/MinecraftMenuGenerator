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
                break;
            default:
                console.log("Default")
                break
        }
    })
    $('[option="open_boolean"]').click((e) => {
        $('[option="open"]').prop("disabled", !$(e.currentTarget).prop("checked"))
        $('[option="close"]').val((!$(e.currentTarget).prop("checked")).toString())
    })
    $('[option="close"]').on("change", (e) => {
        value = $(e.currentTarget).val()
        $('[option="open_boolean"]').prop("checked", !value)
        $('[option="open"]').prop("disabled", value)
    })
    $('[option]').on("change", (e) => { SlotSaved = false })

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
        if(!e.altKey || (e.altKey && e.key == "Alt")) return;
        if(!shortcuts[e.key]) return; // Raccourcis inconnu
        e.preventDefault();
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
    menuState(false, true)
}

function load_pages(){
    $("#pages").empty()
    for(i in Pages){
        $("#pages").append(`
        <li class="list-group-item"><a href="#" class="d-flex gap-2 align-items-center" action="select-page" page="${Pages[i].index}"><span class="badge rounded-pill">${Pages[i].index}</span>${Pages[i].name}</a></li>
        `)
    }
    activePage(Page?.index)
    $('a[action="select-page"]').click((e) => {
        element = $(e.target)
        if(element.parent().hasClass("active")) return;
        index = parseInt(element.attr("page"))
        activePage(index)
        saveItems()
        savePage()
        Page = Pages[getIndexPage(index)]
        Items = Page.items
        refreshSlots()
        menuState(false, true); $('.slot.active').removeClass("active");
    })
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
            item = `${Items[slot].id.replace("minecraft:","")}`
            cursor.append(`
            <span class="grid slot" slot="${slot}"><img src="" alt=""></span>
            `)
            changeSlotImg(slot, item)
        }
    }
    $(".slot").click((e) => { // Changement de slot
        element = $(e.currentTarget)
        if(element.hasClass("active")){
            element.removeClass("active")
            menuState(false, true)
            return;
        }
        $('.slot.active').removeClass("active")
        element.addClass("active")
        menuState(true, false)
        Item = Items[getIndexItem(parseInt(element.attr("slot")))]
        load_item()
    })
}

function load_item(){
    $("#item-name").text(Item.id ? Item.id : Item.loottable); $("#item-slot").text(`Slot n°${Item.Slot}`);
    $("[option]").attr("disabled", false)
    options = ["id","Count","NBT"]
    actions = [{recipe:"",state:true},{function:"",state:true},{close:false,state:false},{open:0,state:false}]
    defaults = ["minecraft:air",1,""]
    if(Item.loottable){
        $("[option='type']").val("loottable")
        options[0] = "loottable"; defaults[0] = ""
    } else {
        $("[option='type']").val("id")
    }
    for(i of options){
        $(`[option="${i == "loottable" ? "id" : i}"]`).val(Item[i] ? Item[i] : defaults[options.indexOf(i)])
    }
    for(action of actions){
        for(i in action){
            if(i == "state") continue;
            switch(i){
                case "recipe":
                case "function":
                case "close":
                    if(i == "close" && $('[option="open_boolean"]').prop("checked")) Item.action[i] = false
                    $(`[option="${i}"]`).val(Item.action[i].toString() ? Item.action[i].toString() : action[i])
                    break;
                case "open":
                    $('[option="open_boolean"]').prop("checked",!(Item.action[i] < 0 || !Item.action[i]))
                    $('[option="open"]').prop("disabled", Item.action[i] < 0 || !Item.action[i])
                    $('[option="open"]').val(Item.action[i] < 0 || !Item.action[i] ? action[i] : Item.action[i])
                    break
                default:
                    break;
            }
        }
    }
}

function refreshSlots(){
    Items.forEach((e) => {
        slot = Items.indexOf(e)
        if(!e.id && !e.loottable) throw console.error(`Aucun "id" ou "loottable" n'a été donné dans Items[${slot}]: ${JSON.stringify(e)}`)
        item = e.id ? `${e.id.replace("minecraft:","")}` : `loottable`
        changeSlotImg(slot, item, e.loottable ? "svg" : "png")
    })
}