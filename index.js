function loadItems(items){
    return JSON.parse(convertNbt(items)).sort((a,b) => (a.Slot > b.Slot) ? 1 : ((b.Slot > a.Slot) ? -1 : 0))
}

function getLootTable(items){
    items = loadItems(items)
    loottable = Array.from(Array(36).keys()).map(x=>new Object({rolls:1,"entries":[{"type":"minecraft:item","name":"minecraft:air"}]}))
    x=0;
    for(i in items){
        x++
        obj = items[i]
        out = loottable[obj.Slot].entries[0]
        if(obj.loottable){
            out.type = "minecraft:loot_table"
            out.name = obj.loottable
        } else {
            out.name = obj.id
        }
        out.functions = []
        if(obj.Count > 1){
            out.functions.push({function: "minecraft:set_count", count:obj.Count})
        }
        if(!obj.tag) obj.tag = {}
        obj.tag.ismenu = 1
        obj.tag.menuid = x
        out.functions.push({function: "minecraft:set_nbt", tag: JSON.stringify(obj.tag)})
    }
    return `{"pools":${JSON.stringify(loottable).replace(/\[(\s*-*[0-9]+),(\s*-*[0-9]+),(\s*-*[0-9]+),(\s*-*[0-9]+)\]/gm, `[I;$1,$2,$3,$4]`)}}`
}

function convertNbt(nbt){
    nbt = nbt.replace(/([0-9]+)b/gm, `$1`).replace(/({|,)\s*([a-zA-Z0-9]+):/gm, `$1"$2":`).replace(/\[I;(\s*-*[0-9]+),(\s*-*[0-9]+),(\s*-*[0-9]+),(\s*-*[0-9]+)\]/gm, `[$1,$2,$3,$4]`)
    regex = /'([^']*)'/gm
    while ((m = regex.exec(nbt)) !== null) {
      if (m.index === regex.lastIndex) {
          regex.lastIndex++;
      }
      nbt = nbt.replace(m[0],m[0].replace(/"/g,'\\"').replace(/'/g,'"'))
    }
    return nbt
}

function getAdvancement(items,score=1){
    items = loadItems(items)
    advancements = []
    x=0
    for(i in items){
        x++
        obj = items[i]
        advancement = {"parent":"core:menu/click","criteria":{"requirement":{"trigger":"minecraft:inventory_changed","conditions":{"player":[{"condition":"minecraft:entity_scores","entity":"this","scores":{"menu.page":{"min":1,"max":1}}},{"condition":"minecraft:inverted","term":{"condition":"minecraft:entity_properties","entity":"this","predicate":{"nbt":"{Slot:1b,tag:{}}"}}}]}}}}
        advancement.rewards = {}
        advancement.rewards.function = `core:menu/click/${score}/${x}`
        if(obj.action){
          if(obj.action.loot) advancement.rewards.loot = obj.action.loot
          if(obj.action.recipes) advancement.rewards.recipes = obj.action.recipes
          if(obj.action.experience) advancement.rewards.experience = obj.action.experience
        }
        advancement.criteria.requirement.conditions.player[0].scores["menu.page"].min = score
        advancement.criteria.requirement.conditions.player[0].scores["menu.page"].max = score
        advancement.criteria.requirement.conditions.player[1].term.predicate.nbt = `{Inventory:[{Slot: ${obj.Slot}b,tag:{menuid: ${x}}}]}`
        advancements.push({name: `core:menu/click/${score}/${x}`, advancement: JSON.stringify(advancement)})
    }
    return advancements
}

function getFunctions(items,score=1){
    items = loadItems(items)
    functions = []
    _function = [
      `scoreboard players set @s menu.restore ${score}`,
      `scoreboard players set @s menu.page -1`,
      `tag @s add wait.clear`,
      `scoreboard players set @s menu.wait 1`
    ]
    functions.push({name: `core:menu/open/${score}`, function: _function.join("\n")})
    x=0
    for(i in items){
        x++
        _function = [
          `scoreboard players operation @s menu.restore = @s menu.page`,
          `scoreboard players set @s menu.page -1`,
          `tag @s add wait.clear`,
          `scoreboard players set @s menu.wait 1`
        ]
        console.log(score);
        obj = items[i]
        if(obj.action && obj.action.open) _function = [`function core:menu/open/${obj.action.open}`]
        if(obj.action && obj.action.close) _function = [`function core:menu/close`]
        if(obj.action && obj.action.function) _function.splice(_function.length > 1 ? -4 : -1, 0, `function ${obj.action.function}`)
        functions.push({name: `core:menu/click/${score}/${x}`, function: _function.join("\n")})
    }
    return functions
}

function createDirectories(path){
  result = /(.*\/)([^\/]+)\/*$/gm.exec(path)
  if(!fs.existsSync(path)){
    createDirectories(result[1])
    fs.mkdirSync(path)
  }
}

function createFile(path,extension,dir,content){
  filename = path.replace("core:",`./out/data/core/${dir}/`)
  result = /(.*\/)([^\/]+)\/*$/gm.exec(filename)
  createDirectories(result[1])
  fs.writeFileSync(filename + extension, content)
}

function createMenu(menus){
  restores = [
    `advancement revoke @s from core:menu/click`,
    `tag @s remove wait.restore`,
    `scoreboard players operation @s menu.page = @s menu.restore`,
    `scoreboard players set @s menu.restore -1`
  ]
  n=0;
  for(a in menus){
    menu = menus[a]
    n++
    restores.unshift(`loot replace entity @s[scores={menu.restore=${n}}] hotbar.0 loot core:menu/${n}`)
    functions = getFunctions(menu,n)
    for(i in functions){
      createFile(functions[i].name, ".mcfunction","functions", functions[i].function)
    }
    createFile(`core:menu/${n}`, ".json", "loot_tables", getLootTable(menu))
    advancements = getAdvancement(menu,n)
    for(i in advancements){
      createFile(advancements[i].name, ".json","advancements", advancements[i].advancement)
    }
  }
  createFile("core:restore", ".mcfunction", "functions", restores.join("\n"))
}

const fs = require('fs');
const fse = require("fs-extra")

if(!fs.existsSync("./out")) fs.mkdirSync("./out")
fse.copySync('./template/', './out/')

Menus = [
    `[{Slot: 4b, id: "minecraft:player_head", Count: 1b, tag: {SkullOwner: {Properties: {textures: [{Value: "eyJ0ZXh0dXJlcyI6eyJTS0lOIjp7InVybCI6Imh0dHA6Ly90ZXh0dXJlcy5taW5lY3JhZnQubmV0L3RleHR1cmUvNmQ2ODM0M2JkMGIxMjlkZTkzY2M4ZDNiYmEzYjk3YTJmYWE3YWRlMzhkOGE2ZTJiODY0Y2Q4NjhjZmFiIn19fQ=="}]}, Id: [I; -1809921078, 1775585777, -1671443835, -114947541]}, display: {Name: '{"text":"≡ Page n°0","italic":false,"color":"white"}'}}}, {Slot: 5b, id: "minecraft:player_head", action: {open: 2}, Count: 1b, tag: {SkullOwner: {Properties: {textures: [{Value: "eyJ0ZXh0dXJlcyI6eyJTS0lOIjp7InVybCI6Imh0dHA6Ly90ZXh0dXJlcy5taW5lY3JhZnQubmV0L3RleHR1cmUvZDllY2NjNWMxYzc5YWE3ODI2YTE1YTdmNWYxMmZiNDAzMjgxNTdjNTI0MjE2NGJhMmFlZjQ3ZTVkZTlhNWNmYyJ9fX0="}]}, Id: [I; -886489585, -502644074, -1943245271, -436273173]}, display: {Name: '{"text":"Page suivante ⇒","italic":false,"color":"white"}'}}}, {Slot: 19b, id: "minecraft:bricks", Count: 1b, action: {function: "test:gamemode/creative"}, tag: {display: {Name: '{"text":"Créatif","color":"green","italic":false}'}}}, {Slot: 21b, id: "minecraft:iron_sword", Count: 1b, action: {function: "test:gamemode/survival"}, tag: {display: {Name: '{"text":"Survie","color":"red","italic":false}'}}}, {Slot: 23b, id: "minecraft:map", Count: 1b, action: {function: "test:gamemode/adventure"}, tag: {display: {Name: '{"text":"Aventure","color":"gold","italic":false}'}}}, {Slot: 25b, id: "minecraft:ender_eye", Count: 1b, action: {function: "test:gamemode/spectator"}, tag: {display: {Name: '{"text":"Spectateur","color":"blue","italic":false}'}}}]`,
    `[{Slot: 3b, id: "minecraft:player_head", Count: 1b, tag: {SkullOwner: {Properties: {textures: [{Value: "eyJ0ZXh0dXJlcyI6eyJTS0lOIjp7InVybCI6Imh0dHA6Ly90ZXh0dXJlcy5taW5lY3JhZnQubmV0L3RleHR1cmUvODY0Zjc3OWE4ZTNmZmEyMzExNDNmYTY5Yjk2YjE0ZWUzNWMxNmQ2NjllMTljNzVmZDFhN2RhNGJmMzA2YyJ9fX0="}]}, Id: [I; 1725013901, -1319550924, -1685700747, -1241102807]}, display: {Name: '{"text":"⇐ Page précédente","italic":false,"color":"white"}'}}, action: {open: 1}}, {Slot: 4b, id: "minecraft:player_head", Count: 1b, tag: {SkullOwner: {Properties: {textures: [{Value: "eyJ0ZXh0dXJlcyI6eyJTS0lOIjp7InVybCI6Imh0dHA6Ly90ZXh0dXJlcy5taW5lY3JhZnQubmV0L3RleHR1cmUvZDJhNmYwZTg0ZGFlZmM4YjIxYWE5OTQxNWIxNmVkNWZkYWE2ZDhkYzBjM2NkNTkxZjQ5Y2E4MzJiNTc1In19fQ=="}]}, Id: [I; -554328644, 1220102470, -1396119578, -33059658]}, display: {Name: '{"text":"≡ Page n°1","italic":false,"color":"white"}'}}}, {Slot: 5b, id: "minecraft:player_head", Count: 1b, tag: {SkullOwner: {Properties: {textures: [{Value: "eyJ0ZXh0dXJlcyI6eyJTS0lOIjp7InVybCI6Imh0dHA6Ly90ZXh0dXJlcy5taW5lY3JhZnQubmV0L3RleHR1cmUvZDllY2NjNWMxYzc5YWE3ODI2YTE1YTdmNWYxMmZiNDAzMjgxNTdjNTI0MjE2NGJhMmFlZjQ3ZTVkZTlhNWNmYyJ9fX0="}]}, Id: [I; -886489585, -502644074, -1943245271, -436273173]}, display: {Name: '{"text":"Page suivante ⇒","italic":false,"color":"white"}'}}, action: {open: 3}}, {Slot: 21b, id: "minecraft:player_head", loottable: "test:head", Count: 1b}, {Slot: 23b, id: "minecraft:gold_ingot", Count: 1b, loottable: "test:money"}]`,
    `[{Slot: 3b, id: "minecraft:player_head", Count: 1b, tag: {SkullOwner: {Properties: {textures: [{Value: "eyJ0ZXh0dXJlcyI6eyJTS0lOIjp7InVybCI6Imh0dHA6Ly90ZXh0dXJlcy5taW5lY3JhZnQubmV0L3RleHR1cmUvODY0Zjc3OWE4ZTNmZmEyMzExNDNmYTY5Yjk2YjE0ZWUzNWMxNmQ2NjllMTljNzVmZDFhN2RhNGJmMzA2YyJ9fX0="}]}, Id: [I; 1725013901, -1319550924, -1685700747, -1241102807]}, display: {Name: '{"text":"⇐ Page précédente","italic":false,"color":"white"}'}}, action: {open: 2}}, {Slot: 4b, id: "minecraft:player_head", Count: 1b, tag: {SkullOwner: {Properties: {textures: [{Value: "eyJ0ZXh0dXJlcyI6eyJTS0lOIjp7InVybCI6Imh0dHA6Ly90ZXh0dXJlcy5taW5lY3JhZnQubmV0L3RleHR1cmUvOTZmYWI5OTFkMDgzOTkzY2I4M2U0YmNmNDRhMGI2Y2VmYWM2NDdkNDE4OWVlOWNiODIzZTljYzE1NzFlMzgifX19"}]}, Id: [I; 1798930196, -418755633, -1180596697, -191167104]}, display: {Name: '{"text":"≡ Page n°2","italic":false,"color":"white"}'}}}, {Slot: 20b, id: "minecraft:nether_star", Count: 1b,loottable: "test:random/1"}, {Slot: 22b, id: "minecraft:nether_star", Count: 2b,loottable: "test:random/2"}, {Slot: 24b, id: "minecraft:map",loottable: "test:random/3", Count: 1b}]`,
    `[{Slot: 0b, id: "minecraft:dragon_head", Count: 1b}, {Slot: 3b, id: "minecraft:air",action:{function:"test:loot_block"}, Count: 1b}, {Slot: 5b, id: "minecraft:spruce_log", Count: 4b}, {Slot: 10b, id: "minecraft:purple_banner", Count: 1b}, {Slot: 16b, id: "minecraft:enchanted_book", Count: 1b, tag: {StoredEnchantments: [{lvl: 4, id: "minecraft:protection"}]}}, {Slot: 24b, id: "minecraft:pink_banner", Count: 4b}, {Slot: 26b, id: "minecraft:smithing_table", Count: 1b}, {Slot: 30b, id: "minecraft:podzol", Count: 5b}]`
]
createMenu(Menus)