Menu = {
    name: "Menu",
    description: "Liste des objets présents dans",
    type: "List",
    content: [
        {
            name: "", description: "Contient la liste de tout les items nécessaires", type: "String"
        }
    ]
}
Items = {
    name: "Items",
    description: "Liste de tous les objets. Comparable au tag <code>Inventory</code>.",
    type: "List",
    content: [
        {
            name: "Item", description: "Objet", type: "Compound",
            content: [
                {
                    name: "id", description: "ID de l' Objet/Bloc. Si une <code>loot_table</code> est spécifiée, l'objet en question est écrasé.", type: "String"
                },
                {
                    name: "Count", description: "Nombre d'objets stockés dans la boite", type: "Byte"
                },
                {
                    name: "Slot", description: "", type: "Byte"
                },
                {
                    name: "tag", description: "", type: "Compound"
                },
                {
                    name:"action",description:"Répertorie toutes les actions à effectuer sur un objet cliqué",type:"Compound",content:[
                        {name:"function",description:"Fonction à exécuter lorsque l'objet est cliqué",type:"String"},
                        {name:"open",descrption:"Index du menu à ouvrir",type:"Int"},
                        {name:"loottable",description:"Loot table à accorder une fois l'object cliqué",type:"String"}
                    ]
                }
            ]
        }
    ]
}