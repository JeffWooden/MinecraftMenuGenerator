index = {
    "Byte": [0, 0],
    "Double": [1, 0],
    "Float": [2, 0],
    "Int": [3, 0],
    "Long": [0, 1],
    "Short": [1, 1],
    "String": [2, 1],
    "Compound": [3, 1],
    "Byte_Array": [0, 2],
    "Int_Array": [1, 2],
    "List": [2, 2],
    "Boolean": [3, 2],
    "Long_Array": [0, 3],
    "None": [1, 3]
}

function appendElement(element, object, level=1) {
    console.log(`${"-".repeat(level)} ${object.name}`)
    $(element).append(`
    <ul>
        <li>
            <span title="${object.type && index[object.type] ? object.type : "None"}">
                <span class="sprite nbt-sprite"></span>
            </span>
            <span class="nowrap ${object.description ? "bold":""}">${object.name}</span>${object.description ? ": " : ""}${object.description}
        </li>
    </ul>`
    )
    if(!object.content || object.content.length < 1) return;
    object.content.forEach(object => {
        appendElement($(element).children().last().children(), object, level+1)
    })
}