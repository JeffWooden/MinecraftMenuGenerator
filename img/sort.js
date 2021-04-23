const fs = require("fs")

items = require("./list.json").items
data = fs.readdirSync("./textures/")
extras = []
missing = Array.from(items)

for(i in data){
    Name = data[i].replace(".png", "")
    if(items.indexOf(Name) < 0) extras.push(Name)
    // if(items.indexOf("minecraft:" + data[i].replace(".png", "")) <= 0) console.log(data[i])
}

missing = items.filter((x) => {
    return !data.includes(x + ".png")
})

fs.writeFileSync("./+.json", extras.join("\n"))
fs.writeFileSync("./-.json", missing.join("\n"))