let agendaHorarios = [8, 12, 25, 15, -2, 20];
let contagemV = 0

for( let agenda of agendaHorarios) {
    if ( agenda >= 0 && agenda <= 23){
        console.log(`Compromisso agendado para as ${agenda} `)
        
        contagemV++
    } else {
        console.log(`Atenção: O horário ${agenda} é inválido!`)
    }
}

console.log(`Contagem Validos: ${contagemV} `)