// ============================================================
// Importações necessárias do React
// - useState: hook para criar e gerenciar estados (variáveis reativas)
// - useEffect: hook para executar efeitos colaterais (ex: salvar no localStorage)
// ============================================================
import React, { useState, useEffect } from 'react';

// Importa o arquivo de estilos CSS da aplicação
import './App.css';

// ============================================================
// CONSTANTE DE ORDENAÇÃO POR PRIORIDADE
//
// Objeto que mapeia cada nível de prioridade a um número.
// Isso permite usar o método .sort() para ordenar as tarefas:
//   Alta  → 0 (primeiro)
//   Média → 1 (meio)
//   Baixa → 2 (último)
//
// Quanto menor o número, mais para cima a tarefa vai na lista.
// ============================================================
const PRIORITY_ORDER = { Alta: 0, Média: 1, Baixa: 2 };


// ============================================================
// COMPONENTE PRINCIPAL: App
//
// Toda a lógica e interface da aplicação vivem aqui.
// Em projetos maiores isso seria dividido em componentes menores,
// mas para fins didáticos tudo está centralizado neste arquivo.
// ============================================================
function App() {

  // ----------------------------------------------------------
  // ESTADOS DA APLICAÇÃO (useState)
  //
  // useState(valorInicial) retorna um array com dois itens:
  //   [valorAtual, funçãoParaAtualizar]
  //
  // Toda vez que um estado muda, o React re-renderiza o componente
  // automaticamente com os novos valores.
  // ----------------------------------------------------------

  // Texto digitado pelo usuário no campo "Descrição da tarefa"
  const [taskText, setTaskText] = useState('');

  // Prioridade selecionada no <select> do formulário (padrão: 'Baixa')
  const [priority, setPriority] = useState('Baixa');

  // Lista principal de tarefas — cada item é um objeto com:
  // { id, text, priority, completed, createdAt }
  const [taskList, setTaskList] = useState([]);

  // Filtro de status ativo: 'Todas', 'Pendentes' ou 'Concluídas'
  const [filter, setFilter] = useState('Todas');

  // Texto digitado na barra de busca (filtra tarefas em tempo real)
  const [search, setSearch] = useState('');

  // ID da tarefa que está sendo editada no momento.
  // null significa que nenhuma tarefa está em modo de edição.
  const [editingId, setEditingId] = useState(null);

  // Texto temporário enquanto o usuário edita uma tarefa.
  // Só é salvo de verdade quando o usuário clicar em "Salvar".
  const [editingText, setEditingText] = useState('');


  // ----------------------------------------------------------
  // EFEITO 1: Carrega as tarefas salvas ao abrir a aplicação
  //
  // useEffect(() => { ... }, [])
  //   - O array vazio [] como segundo argumento significa:
  //     "execute isso UMA ÚNICA VEZ, quando o componente montar"
  //   - localStorage.getItem busca os dados salvos no navegador
  //   - JSON.parse converte a string salva de volta para array JS
  // ----------------------------------------------------------
  useEffect(() => {
    const saved = localStorage.getItem('@taskflow_data');
    if (saved) setTaskList(JSON.parse(saved));
  }, []); // [] = executa só na montagem do componente


  // ----------------------------------------------------------
  // EFEITO 2: Salva as tarefas no localStorage sempre que a lista mudar
  //
  // useEffect(() => { ... }, [taskList])
  //   - [taskList] como dependência significa:
  //     "execute isso toda vez que taskList mudar"
  //   - JSON.stringify converte o array JS para string (localStorage
  //     só aceita strings)
  // ----------------------------------------------------------
  useEffect(() => {
    localStorage.setItem('@taskflow_data', JSON.stringify(taskList));
  }, [taskList]); // executa sempre que taskList for atualizado


  // ----------------------------------------------------------
  // FUNÇÃO: addTask — Adiciona uma nova tarefa à lista
  //
  // Recebe o evento do formulário (e) para cancelar o
  // comportamento padrão (recarregar a página).
  // ----------------------------------------------------------
  const addTask = (e) => {
    // Impede que o formulário recarregue a página ao ser enviado
    e.preventDefault();

    // .trim() remove espaços em branco nas pontas.
    // Se o campo estiver vazio (ou só com espaços), cancela a função.
    if (!taskText.trim()) return;

    // Cria o objeto da nova tarefa com todas as propriedades necessárias
    const newTask = {
      // crypto.randomUUID() gera um ID único universal (UUID)
      // Isso garante que cada tarefa tenha um identificador exclusivo
      id: crypto.randomUUID(),

      // .trim() garante que não salvamos espaços desnecessários
      text: taskText.trim(),

      // Prioridade vem do estado atual do <select>
      priority,

      // Toda tarefa começa como não concluída
      completed: false,

      // Formata a data atual no padrão brasileiro: DD/MM/AAAA
      createdAt: new Date().toLocaleDateString('pt-BR'),
    };

    // Cria um novo array colocando a nova tarefa no início ([newTask, ...taskList])
    // O operador spread (...) copia todos os itens do array existente
    const updated = [newTask, ...taskList];

    // ORDENAÇÃO AUTOMÁTICA:
    // .sort() reordena o array com base no peso de cada prioridade.
    // (a, b) => A - B ordena do menor para o maior número,
    // ou seja: Alta(0) → Média(1) → Baixa(2)
    updated.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);

    // Atualiza o estado com a lista reordenada
    setTaskList(updated);

    // Limpa o campo de texto para o usuário poder digitar outra tarefa
    setTaskText('');
  };


  // ----------------------------------------------------------
  // FUNÇÃO: toggleTask — Alterna entre concluída / pendente
  //
  // Recebe o id da tarefa que deve ser alternada.
  // Usa .map() para percorrer toda a lista e retornar um novo array:
  //   - Se o id bate: inverte o campo completed com !t.completed
  //   - Caso contrário: retorna a tarefa sem alteração
  //
  // O spread {...t} cria uma cópia do objeto antes de alterar,
  // respeitando o princípio de imutabilidade do React.
  // ----------------------------------------------------------
  const toggleTask = (id) => {
    setTaskList((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, completed: !t.completed } // inverte o status
          : t                                  // mantém como está
      )
    );
  };


  // ----------------------------------------------------------
  // FUNÇÃO: deleteTask — Remove uma tarefa com confirmação
  //
  // Antes de excluir, mostra um diálogo de confirmação para o
  // usuário. Só exclui se ele confirmar com "OK".
  // ----------------------------------------------------------
  const deleteTask = (id) => {
    // Busca o objeto da tarefa pelo id para mostrar o nome no confirm
    const task = taskList.find((t) => t.id === id);

    // window.confirm exibe uma caixa de diálogo nativa do navegador
    // com botões "OK" e "Cancelar". Retorna true ou false.
    const confirmed = window.confirm(
      `Tem certeza que deseja remover a tarefa:\n"${task.text}"?`
    );

    // Se o usuário clicou em "Cancelar", interrompe a função aqui
    if (!confirmed) return;

    // .filter() cria um novo array excluindo o item com o id informado
    setTaskList((prev) => prev.filter((t) => t.id !== id));
  };


  // ----------------------------------------------------------
  // FUNÇÃO: startEdit — Ativa o modo de edição para uma tarefa
  //
  // Recebe o objeto inteiro da tarefa (não só o id),
  // pois precisamos pré-preencher o campo de edição com o texto atual.
  // ----------------------------------------------------------
  const startEdit = (task) => {
    // Marca qual tarefa está sendo editada pelo seu id
    setEditingId(task.id);

    // Preenche o campo de edição com o texto atual da tarefa
    setEditingText(task.text);
  };


  // ----------------------------------------------------------
  // FUNÇÃO: saveEdit — Salva o novo texto da tarefa editada
  //
  // Usa .map() para encontrar a tarefa pelo id e substituir
  // apenas o campo "text", mantendo todos os outros intactos.
  // ----------------------------------------------------------
  const saveEdit = (id) => {
    // Não salva se o campo estiver vazio
    if (!editingText.trim()) return;

    setTaskList((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, text: editingText.trim() } // atualiza só o texto
          : t
      )
    );

    // Sai do modo de edição limpando os estados relacionados
    setEditingId(null);
    setEditingText('');
  };


  // ----------------------------------------------------------
  // FUNÇÃO: cancelEdit — Cancela a edição sem salvar nada
  // ----------------------------------------------------------
  const cancelEdit = () => {
    setEditingId(null);   // remove o "modo edição" ativo
    setEditingText('');   // descarta o texto temporário
  };


  // ----------------------------------------------------------
  // DERIVAÇÃO: filteredTasks — Lista filtrada para exibição
  //
  // Não é um estado (useState), é uma variável calculada em
  // tempo de renderização a partir dos estados existentes.
  //
  // Aplica DOIS filtros em cadeia com &&:
  //   1. Filtro de status (Todas / Pendentes / Concluídas)
  //   2. Busca por texto em tempo real (case-insensitive)
  // ----------------------------------------------------------
  const filteredTasks = taskList.filter((t) => {

    // FILTRO 1 — Status da tarefa
    // Operador ternário encadeado:
    //   se filtro for 'Pendentes' → só tarefas não concluídas
    //   se filtro for 'Concluídas' → só tarefas concluídas
    //   caso contrário ('Todas') → retorna true (aceita qualquer uma)
    const matchesFilter =
      filter === 'Pendentes'
        ? !t.completed
        : filter === 'Concluídas'
        ? t.completed
        : true;

    // FILTRO 2 — Busca por texto
    // .toLowerCase() em ambos os lados garante que a busca
    // não seja sensível a maiúsculas/minúsculas (case-insensitive)
    // Ex: buscar "react" também encontra "React" e "REACT"
    const matchesSearch = t.text.toLowerCase().includes(search.toLowerCase());

    // A tarefa só aparece se passar pelos DOIS filtros
    return matchesFilter && matchesSearch;
  });


  // ----------------------------------------------------------
  // RENDERIZAÇÃO (JSX)
  //
  // JSX é uma sintaxe parecida com HTML que o React entende.
  // Dentro de {} podemos escrever qualquer expressão JavaScript.
  // ----------------------------------------------------------
  return (
    <div className="app-container">

      {/* Cabeçalho da aplicação */}
      <header>
        <h1>TaskFlow</h1>
        <p>Gestão de Produtividade</p>
      </header>

      {/* ── SEÇÃO: Formulário de criação de tarefas ── */}
      <section className="form-section">
        {/*
          onSubmit={addTask} chama a função quando o formulário é enviado
          (ao clicar no botão "Criar" ou pressionar Enter no input)
        */}
        <form onSubmit={addTask}>

          {/*
            Input controlado: o valor vem do estado (value={taskText})
            e atualiza o estado a cada tecla digitada (onChange)
          */}
          <input
            value={taskText}
            onChange={(e) => setTaskText(e.target.value)}
            placeholder="Descrição da tarefa..."
          />

          {/*
            Select controlado: igual ao input, mas para listas suspensas.
            Ao mudar a opção, atualiza o estado "priority"
          */}
          <select value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="Baixa">Baixa</option>
            <option value="Média">Média</option>
            <option value="Alta">Alta</option>
          </select>

          {/* type="submit" dispara o onSubmit do <form> ao ser clicado */}
          <button type="submit">Criar</button>
        </form>
      </section>

      {/* ── SEÇÃO: Campo de busca em tempo real ── */}
      <section className="search-section">
        {/*
          A cada caractere digitado, setSearch atualiza o estado "search".
          Como filteredTasks depende de "search", a lista se atualiza
          automaticamente sem precisar de botão de buscar.
        */}
        <input
          className="search-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar tarefa pelo texto..."
        />
      </section>

      {/* ── SEÇÃO: Botões de filtro por status ── */}
      <section className="filter-section">
        {/*
          .map() percorre o array e renderiza um <button> para cada opção.

          key={f} é obrigatório no React ao renderizar listas: identifica
          cada elemento para que o React saiba qual atualizar com eficiência.

          className condicional: se o filtro ativo (filter) for igual a
          este botão (f), aplica a classe 'active' para destacá-lo.
        */}
        {['Todas', 'Pendentes', 'Concluídas'].map((f) => (
          <button
            key={f}
            className={filter === f ? 'active' : ''}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </section>

      {/* ── SEÇÃO PRINCIPAL: Grade de cards de tarefas ── */}
      <main className="task-grid">

        {/*
          Renderização condicional com &&:
          Se não houver tarefas correspondentes, exibe mensagem de aviso.
          O && funciona como: "se a condição for verdadeira, renderiza o JSX"
        */}
        {filteredTasks.length === 0 && (
          <p className="empty-msg">Nenhuma tarefa encontrada.</p>
        )}

        {/*
          Renderiza um card para cada tarefa filtrada.

          className dinâmico com template string:
            - item.priority.toLowerCase() → 'alta', 'média' ou 'baixa'
              (as classes CSS usam letras minúsculas)
            - item.completed ? 'done' : '' → adiciona 'done' se concluída

          Resultado exemplo: "task-card alta done"
        */}
        {filteredTasks.map((item) => (
          <div
            key={item.id}
            className={`task-card ${item.priority.toLowerCase()} ${
              item.completed ? 'done' : ''
            }`}
          >
            <div className="task-content">

              {/*
                RENDERIZAÇÃO CONDICIONAL — Modo edição vs. modo exibição:

                Se editingId === item.id, este card está sendo editado:
                  → Exibe um <input> para alterar o texto
                Senão:
                  → Exibe o texto, prioridade e data normalmente

                O operador ternário (condição ? A : B) escolhe qual JSX renderizar.
              */}
              {editingId === item.id ? (

                // ── MODO EDIÇÃO ──
                <div className="edit-group">
                  <input
                    className="edit-input"
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    onKeyDown={(e) => {
                      // Atalhos de teclado para melhor usabilidade:
                      // Enter → salva a edição
                      if (e.key === 'Enter') saveEdit(item.id);
                      // Escape → cancela sem salvar
                      if (e.key === 'Escape') cancelEdit();
                    }}
                    // autoFocus coloca o cursor automaticamente neste campo
                    // quando o modo de edição é ativado
                    autoFocus
                  />
                  <div className="edit-actions">
                    <button className="save" onClick={() => saveEdit(item.id)}>
                      Salvar
                    </button>
                    <button className="cancel" onClick={cancelEdit}>
                      Cancelar
                    </button>
                  </div>
                </div>

              ) : (

                // ── MODO EXIBIÇÃO NORMAL ──
                // O fragmento <> </> agrupa elementos sem criar uma div extra no HTML
                <>
                  <h3>{item.text}</h3>
                  <span>Prioridade: {item.priority}</span>
                  <small>Criada em: {item.createdAt}</small>
                </>
              )}
            </div>

            {/*
              Os botões de ação ficam ocultos durante a edição.
              Isso evita que o usuário tente excluir ou concluir
              enquanto ainda está editando o texto.
            */}
            {editingId !== item.id && (
              <div className="task-actions">

                {/*
                  Botão de concluir/reabrir:
                  O texto muda dinamicamente conforme o status atual da tarefa.
                */}
                <button onClick={() => toggleTask(item.id)}>
                  {item.completed ? 'Reabrir' : 'Concluir'}
                </button>

                {/*
                  Passamos o objeto "item" inteiro (não só o id) para
                  que startEdit possa pré-preencher o campo com o texto atual.
                */}
                <button className="edit" onClick={() => startEdit(item)}>
                  Editar
                </button>

                <button className="delete" onClick={() => deleteTask(item.id)}>
                  Remover
                </button>
              </div>
            )}
          </div>
        ))}
      </main>
    </div>
  );
}

// Exporta o componente para ser usado em outros arquivos (ex: main.jsx)
export default App;
