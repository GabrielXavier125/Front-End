const diaHoje = new Date()

const diaEvento = new Date ("2026-2-10")

let dif = diaHoje - diaEvento
let dias = dif / (1000 * 60 * 60* 24)
let diasfalt = Math.ceil(dias)
console.log(`Faltam ${diasfalt} dias para o evento`)

