let hora = parseFloat(prompt("Digite a Hora: "))
let prioridade = parseInt(prompt("Digite a Prioridade 1 a 10: "))

if(prioridade > 8 && hora < 18){
    console.log("TAREFA CRÍTICA/URGENTE")
} else if (prioridade >= 7 && prioridade < 9 && hora < 18){
    console.log("TAREFA IMPORTANTE")
} else if ( prioridade < 11 && hora >= 18) {
    console.log("TAREFA NÃO IMPORTANTE")
} else {
    console.log("Horário Inválido e Nível de Prioridade Inválida");
}