// Modo estrito
'use strict';

/**
 * Função que será executada quando a página estiver toda carregada, criando a variável global "info" com um objeto Information
 * @param {Event} event Objeto que representará o evento
**/
window.onload = (event) =>
{
  var info = new Information();
  window.info = info;
};

/**
 * @class Guarda toda informação necessaria na execução do site 
 * @constructs Information
 * @property {users[]} user - Array de objetos do tipo User, para guardar todas as informações dos utilizadores do sistema.
 * @property {pacotes[]} pacote - Array de objetos do tipo Pacote, para guardar todas as informações dos pacotes disponíveis.
 * @property {cacifos[]} cacifo - Array de objetos do tipo Cacifo, para guardar todas as informações dos cacifos.
 * @property {feedbacks[]} feedback - Array de objetos do tipo Feedback, para guardar todas as informações dos feedbacks recebidos.
 * @property {userCacifos[]} user_cacifo - Array de objetos do tipo UserCacifo, para guardar todas as informações dos utilizadores que estao a utilizar o cacifos.
 * @property {temposCarga[]} tempo_carga - Array de objetos do tipo TempoCarga, para guardar todas as informações dos tempos de cargarregamento estimado dos cacifos para com as trotinetes.
 * @property {consumos[]} consumo - Array de objetos do tipo Consumo, para guardar todas as informações dos consumos de energia nos cacifos.
 * @property {pagamentos[]} pagamento - Array de objetos do tipo Pagamento, para guardar todas as informações dos pagamentos efetuados.
 * @property {gerais[]} geral - Array de objetos do tipo Geral, para guardar informações gerais do dashboard.
 */
class Information {
  constructor() {
      this.user = [];
      this.pacote = [];
      this.cacifo = [];
      this.feedback = [];
      this.user_cacifo = [];
      this.tempo_carga = [];
      this.consumo = [];
      this.pagamento = [];
      this.geral = [];
  }

  //feito
  /**
   * Função responsável por efetuar o login do utilizador
   * Função que obtem as informações de email e password do formulário de login e envia uma solicitação ao servidor NODE.JS de forma assíncrona e em JSON.
   * Caso o utilizador seja invalido será lançado um alerta
   * @memberof Information
   */
  userLogin = () => {
    // Obtém os valores do email e password dos elementos HTML
    var email = document.getElementById("email").value;
    var password = document.getElementById("password").value;

    // Cria uma instância do objeto XMLHttpRequest para realizar solicitações assíncronas
    const xhr = new XMLHttpRequest();
    xhr.responseType = 'json';

    // Configura o pedido GET para o endpoint '/login' com os parâmetros de email e password
    xhr.open('GET', `/login?email=${email}&password=${password}`, true);
    // Define a função de retorno de chamada para ser executada quando o estado da solicitação muda
    xhr.onreadystatechange = function () {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 200) {
            localStorage.setItem('idUser', xhr.response.data[0].id);                        
            localStorage.setItem('nomeuser', xhr.response.data[0].nome);            
            info.user.nome = xhr.response.data[0].nome;
            info.user.email = xhr.response.data[0].email;
            info.user.password = xhr.response.data[0].password;
            
            // Redireciona para a página inicial se o tipo de utilizador for 1 (admin)
            if(xhr.response.data[0].user_type === 1) {
              window.location.href = 'index.html';
            } else {
             // Exibe um alerta de acesso negado para outros tipos de utilizador
             alert("Acesso Negado");
            }            
        } else if (xhr.status === 401) {
            alert("Incorrect credentials.");
        }
      }
    };
    // Define o cabeçalho Content-Type da solicitação como application/json
    xhr.setRequestHeader('Content-Type', 'application/json');
    // Envia os dados do utilizador
    xhr.send();
  }

  //feito
  /**
   * Função que obtém de forma assíncrona todas as informações dos utilizadores do servidor.
   * Atualiza o array de utilizador na instância de Information e chama a função para exibir os utilizadores.
   * @memberof Information
   */
  getUsers = () => {    
    var users = this.user;    
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "/user", true);
    xhr.onreadystatechange = function () {
      // Verifica se a solicitação foi concluída e bem-sucedida
      if ((this.readyState === 4) && (this.status === 200)) {
          var response = JSON.parse(xhr.responseText);
          // Verifica se a resposta contém dados válidos em forma de array~
          if (response.data && Array.isArray(response.data)) {
              // Limpa o array existente de utilizadores
              users.length = 0;
              // Adiciona os novos itens ao array
              response.data.forEach(function (current) {
                  users.push(current);
              });
              info.showUsers();
          }         
      }
    };
    xhr.setRequestHeader('Content-Type', 'application/json');
    // Envia a requisição
    xhr.send();    
  }

  //FEITO
  /**
   * Função responsável por exibir a lista de utilizadores na interface da pagina user.
   * Atualiza o display dos elementos HTML (section) para mostrar a lista de utilizadores e ocultar outros elementos relacionados à criação ou edição de utilizadores.
   * @memberof Information
   */
  showUsers = () => {
    // exibição dos elementos HTML relevantes
    document.getElementById("listaUser").style.display = "block";
    document.getElementById("criarUtilizador").style.display = "none";
    document.getElementById("editarUtilizador").style.display = "none";

    // Obtém uma referência ao array de utilizadores
    var users = this.user;
    // Limpa a tabela de utilizadores
    const table = document.getElementById('tabelaUsers');
    table.innerHTML = ''; 

    // Verifica se existem utilizadores para exibir
    if (users.length > 0) {
         // Itera sobre cada utilizador para criar as linhas da tabela
         users.forEach(function (u) {
            var tr = document.createElement('tr');
            // Define o conteúdo de cada célula da linha com as informações do utilizador
            tr.innerHTML = `
              <tr>
                <td>${u.nome}</td>
                <td>${u.email}</td>
                <td>${u.user_type}</td>
                <td>${u.pacote}</td>
                <td>${u.data_criacao}</td>
                <td>
                  <button onclick="info.updateUser(${u.id})">Editar</button>
                  <button onclick="info.deleteUser(${u.id})">Deletar</button>
                </td>
              </tr>`;
            table.appendChild(tr); // Adiciona a linha à tabela
        });
    }
  }

  //FEITO
  /**
   * Função responsável por exibir o formulário de criação de utilizador na interface do utilizador.
   * Oculta a lista de utilizadores e exibe o formulário de criação de utilizador.
   * Carrega os pacotes disponíveis para seleção no formulário de criação de utilizador.
   */
  criarUser = () => {
    document.getElementById("listaUser").style.display = "none";
    document.getElementById("criarUtilizador").style.display = "block";
    
    const idelem = "pacoteutiC";
    info.carregarPacotes(idelem);
  }

  //feito
  /**
   * Função responsável por criar um novo utilizador no servidor.
   * Obtém os valores dos campos do formulário de criação de utilizador.
   * Cria um objeto contendo os dados do novo utilizador.
   * Envia uma requisição POST para o servidor para criar o novo utilizador.
   * Exibe um alerta de sucesso após a criação do utilizador e atualiza a lista de utilizadores na interface do utilizador.
   */
  saveNewUser = () => {
    // Obtém os valores dos campos do formulário de criação de utilizador
    const nome = document.getElementById("nomeutiC").value;
    const email = document.getElementById("emailutiC").value;
    const password = document.getElementById("passutiC").value;
    const pacote = document.getElementById("pacoteutiC").value;
    const user_type = document.getElementById("tipouser").value;

    // Cria um objeto contendo os dados do novo utilizador
    var dados = {nome: nome, email: email, password: password, pacote: pacote, user_type: user_type};

    var xhr = new XMLHttpRequest();        
    xhr.responseType="json";

    xhr.open("POST", "/user", true);
    xhr.onreadystatechange = () => {
      if (xhr.readyState !== XMLHttpRequest.DONE) { return; }
			if (xhr.status !== 200) { return; }
      
      // Exibe um alerta de sucesso após a criação do utilizador
      alert("Utilizador Criado");
      // Atualiza a lista de utilizadores na interface do utilizador
      info.getUsers();
    }
    xhr.responseType="json";
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(dados));
  }

  //feito
  /**
   * Função responsável por preencher o formulário de edição de utilizador com os dados do utilizador especificado.
   * Carrega os pacotes disponíveis para seleção no formulário de edição de utilizador.
   * Exibe o formulário de edição de utilizador na interface do utilizador.
   * @param {number} idUser - O ID do utilizador a ser editado.
   */
  updateUser = (idUser) => {
    var users = this.user;

    // ID do elemento select onde os pacotes serão carregados no formulário de edição de utilizador
    const idelem = "pacoteutiE";
    // Chama a função para carregar os pacotes disponíveis para seleção no formulário de edição de utilizador
    info.carregarPacotes(idelem);

    // Exibe o formulário de edição de utilizador na interface do utilizador
    document.getElementById("editarUtilizador").style.display = "block";
    // Obtém referências aos campos do formulário de edição de utilizador
    const nome = document.getElementById("nomeutiE");
    const email = document.getElementById("emailutiE");
    const password = document.getElementById("passutiE");
    const pacote = document.getElementById("pacoteutiE");
    const user_type = document.getElementById("tipouserE");

    // Procura pelo utilizador com o ID especificado no array de utilizadores
    const userEncontrado = users.find(p => p.id === idUser);

    if (userEncontrado) {
      // Preenche os campos do formulário de edição de utilizador com os dados do utilizador encontrado
      nome.value = userEncontrado.nome;
      email.value = userEncontrado.email;
      password.value = userEncontrado.password;
      pacote.value = userEncontrado.pacote;

      // Define o valor do campo de tipo de utilizador com base no tipo de utilizador encontrado
      if(userEncontrado.user_type === "Administrador"){
        user_type.value = 1;
      } else { user_type.value = 2; }

      // Define o valor do campo de ID do utilizador oculto no formulário de edição de utilizador
      document.getElementById('idUser').value = idUser;

    } else {
      console.log('ERROOO UPDATE USER');
    }
  }

  //feito
  /**
   * Função responsável por atualizar os dados de um utilizador no servidor.
   * Obtém o ID do utilizador a ser atualizado do campo oculto no formulário de edição de utilizador.
   * Oculta o formulário de edição de utilizador após a atualização.
   * Obtém os novos valores dos campos de pacote e tipo de utilizador do formulário de edição de utilizador.
   * Envia uma requisição PUT para o servidor para atualizar os dados do utilizador.
   * Exibe um alerta de sucesso após a atualização e atualiza a lista de utilizadores na interface do utilizador.
   */
  saveUpdUser = () => {
    // Obtém o ID do utilizador a ser atualizado do campo oculto no formulário de edição de utilizador
    var idUser = document.getElementById('idUser').value;

    // Oculta o formulário de edição de utilizador após a atualização
    document.getElementById("editarUtilizador").style.display = "none";
    // Obtém os novos valores dos campos de pacote e tipo de utilizador do formulário de edição de utilizador
    const pacote = document.getElementById("pacoteutiE").value;
    const user_type = document.getElementById("tipouserE").value;
    // Cria um objeto com os dados atualizados do utilizador
    var dados = {pacote: pacote, user_type: user_type};

    var xhr = new XMLHttpRequest();        
    xhr.open("PUT", "/user/" + idUser + "/pacote", true);
    xhr.onreadystatechange = () => {
      if (xhr.readyState !== XMLHttpRequest.DONE) { return; }  
      if (xhr.status === 200) { 
        // Exibe um alerta de sucesso após a atualização
        alert("Dados DO UTILIZADOR Atualizados"); 
         // Atualiza a lista de utilizadores na interface do utilizador
         info.getUsers();
      } else if (xhr.status === 400) {
            // Exibe um alerta se houver erro de preenchimento dos campos
            alert("Preencha todos os campos!");
      } else {
          // Exibe um alerta se ocorrer um erro inesperado no servidor
          console.error("Erro: O servidor retornou um status inesperado - " + xhr.status);
          alert("Erro: O servidor retornou um status inesperado - " + xhr.status);
      }
    };
    xhr.responseType="json";
    xhr.setRequestHeader('Content-Type', 'application/json');
    // Envia os dados de atualização do utilizador para o servidor
    xhr.send(JSON.stringify(dados));
  }

  //feito
  /**
   * Função responsável por excluir um utilizador do servidor.
   * Envia uma requisição DELETE para o servidor para excluir o utilizador com o ID especificado.
   * Remove o utilizador excluído do array de utilizadores e atualiza a lista de utilizadores na interface do utilizador.
   * @param {number} idUser - O ID do utilizador a ser excluído.
   */
  deleteUser = (idUser) => {
    var xhr = new XMLHttpRequest();
    xhr.open("DELETE", `/user/${idUser}`, true);
    xhr.onreadystatechange = function () {
      if ((this.readyState === 4) && (this.status === 200)) {
          // Remove o utilizador excluído do array de utilizadores
          info.user.splice(info.user.findIndex(i => i.id == idUser), 1);
          // Atualiza a lista de utilizadores na interface do utilizador
          info.showUsers();
      }
    }
    xhr.responseType = "json";
		xhr.setRequestHeader('Content-Type', 'application/json');
    // Envia a requisição DELETE para excluir o utilizador
    xhr.send();    
  }
  
  //feito
  /**
   * Função responsável por carregar os pacotes disponíveis para seleção no formulário de criação de utilizador.
   * Obtém os pacotes disponíveis do servidor e os adiciona ao elemento select especificado.
   * @param {string} idelem - ID do elemento select onde os pacotes serão carregados.
   */
  carregarPacotes = (idelem) => {
    // Obtém uma referência ao elemento select onde os pacotes serão carregados
    var selectPacote = document.getElementById(idelem);
    var pacotes = this.pacote;

    var xhr = new XMLHttpRequest();
    xhr.open("GET", "/pacote", true);
    xhr.onreadystatechange = function () {
        if ((this.readyState === 4) && (this.status === 200)) {
            var response = JSON.parse(xhr.responseText);
            if (response.data && Array.isArray(response.data)) {
                pacotes.length = 0;
                // Adiciona os novos itens ao array
                response.data.forEach(function (current) {
                    pacotes.push(current);
                    // Cria uma nova opção para o pacote atual e a adiciona ao elemento select
                    var option = document.createElement("option");
                    option.value = current.id;
                    option.text = current.nome;
                    selectPacote.appendChild(option);
                });
            }
        }
    };
    xhr.send();
  }

  //feito
  /**
   * Função responsável por obter os pacotes da base de dados do servidor.
   * Envia uma solicitação GET ao servidor para buscar todos os pacotes disponíveis.
   * Quando a resposta do servidor é recebida, os dados dos pacotes são inseridos no array 'pacote'.
   * Em seguida, a função 'showPacotes()' é chamada para exibir os pacotes na interface do utilizador.
   */
  getPacotes = () => {    
    var pacote = this.pacote;    

    // Exibe a lista de pacotes e oculta outros elementos relacionados
    document.getElementById("listaPacotes").style.display = "block";
    document.getElementById("editaPacotes").style.display = "none";
    document.getElementById("listaCacifos").style.display = "none";
    document.getElementById("editaCacifo").style.display = "none";
    document.getElementById("btnCriarPacote").style.display = "block";
    document.getElementById("btnCriarCacifo").style.display = "none";
    
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "/pacote", true);
    xhr.onreadystatechange = function () {
      if ((this.readyState === 4) && (this.status === 200)) {
        var response = JSON.parse(xhr.responseText);
        if (response.data && Array.isArray(response.data)) {
          pacote.length = 0;
          // Adiciona os novos itens ao array
          response.data.forEach(function (current) {
              pacote.push(current);
          });
          info.showPacotes();
        }         
      }
    };
    // Envia a requisição
    xhr.send();    
  }

  //feito
  /**
   * Função responsável por exibir os pacotes na interface do utilizador.
   * Exibe a lista de pacotes e oculta outros elementos relacionados.
   * Itera sobre o array de pacotes e cria linhas na tabela HTML para cada pacote, preenchendo-as com os dados dos pacotes.
   * adiciona botões de edição e exclusão para cada pacote na tabela.
   */
  showPacotes = () => {
    document.getElementById("listaPacotes").style.display = "block";
    document.getElementById("editaPacotes").style.display = "none";
    document.getElementById("criarPacotes").style.display = "none";
    document.getElementById("listaCacifos").style.display = "none";
    document.getElementById("editaCacifo").style.display = "none";
    document.getElementById("criarCacifo").style.display = "none";
    document.getElementById("btnCriarCacifo").style.display = "none";
    document.getElementById("btnCriarPacote").style.display = "block";
    var pacotes = this.pacote;

    const table = document.getElementById('tabelaPacotes');
    table.innerHTML = '';  // Limpa o conteúdo existente

     // Verifica se há pacotes para exibir
     if (pacotes.length > 0) {
        // Itera sobre o array de pacotes e cria linhas na tabela para cada pacote
        pacotes.forEach(function (p) {
            // Cria uma nova linha na tabela
            var tr = document.createElement('tr');
             // Preenche a linha com os dados do pacote
             tr.innerHTML = `
                <td>${p.id}</td>
                <td>${p.nome}</td>
                <td>${p.descricao}</td>
                <td>${p.valor} €</td>
                <td>
                    <button onclick="info.updatePacote(${p.id})">Editar</button> <!-- Botão para editar o pacote -->
                    <button onclick="info.deletePacote(${p.id})" style="background: gray;" disabled>Deletar</button> <!-- Botão para excluir o pacote (desabilitado) -->
                </td>`;
            table.appendChild(tr);  // Adiciona a linha à tabela
        });
    }
  }

  //feito
  /**
   * Função responsável por exibir o formulário de criação de pacote e ocultar outros elementos relacionados.
   */
  criarPacote = () => {
    document.getElementById("listaPacotes").style.display = "none";
    document.getElementById("editaPacotes").style.display = "none";
    document.getElementById("criarPacotes").style.display = "block";
    document.getElementById("listaCacifos").style.display = "none";
    document.getElementById("editaCacifo").style.display = "none";
    document.getElementById("btnCriarCacifo").style.display = "none";
    document.getElementById("criarCacifo").style.display = "none";
    document.getElementById("btnCriarPacote").style.display = "block";
  }

  //FEITO
    /**
   * Função responsável por salvar um novo pacote no servidor.
   * Obtém os dados do novo pacote do formulário de criação de pacote na interface do utilizador.
   * Envia uma requisição POST ao servidor para adicionar o novo pacote à base de dados.
   * Após a conclusão bem-sucedida da requisição, exibe uma mensagem de confirmação e atualiza a lista de pacotes na interface do utilizador.
   */
  saveNewPacote = () => {
    const nome = document.getElementById("nomePacoteC").value;
    const valor = document.getElementById("valorPacoteC").value;
    const descricao = document.getElementById("descPacoteC").value;
    // Cria um objeto com os dados do novo pacote
    var dados = {nome: nome, valor: valor, descricao: descricao};

    var xhr = new XMLHttpRequest();        
    xhr.responseType="json";
    // Abre a conexão com o servidor para enviar a requisição POST para adicionar o novo pacote
    xhr.open("POST", "/pacote", true);
    xhr.onreadystatechange = () => {
      if (xhr.readyState !== XMLHttpRequest.DONE) { return; }
			if (xhr.status !== 200) { return; }
      // Exibe uma mensagem de confirmação
      alert("Pacote Criado");
      // Atualiza a lista de pacotes na interface do utilizador após a criação do novo pacote
      info.getPacotes();
    }
    xhr.responseType="json";
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(dados));
  }

  //feito
 /**
   * Função responsável por preencher o formulário de edição de pacote com os dados do pacote selecionado.
   * Exibe o formulário de edição de pacote e preenche os campos com os dados do pacote especificado.
   * @param {number} idPacote - O ID do pacote a ser atualizado.
   */
  updatePacote = (idPacote) => {
    var pacotes = this.pacote;

    // Exibe o formulário de edição de pacote na interface do utilizador
    document.getElementById("editaPacotes").style.display = "block";
    // Obtém referências aos campos do formulário de edição de pacote
    const nome = document.getElementById('nomePacoteE');
    const valor = document.getElementById('valorPacoteE');
    const descricao = document.getElementById('descPacoteE');

    // Procura pelo pacote com o ID especificado no array de pacotes
    const pacoteEncontrado = pacotes.find(p => p.id === idPacote);

    // Verifica se o pacote foi encontrado
    if (pacoteEncontrado) {
      // Preenche os campos do formulário com os dados do pacote encontrado
      nome.value = pacoteEncontrado.nome;
      valor.value = pacoteEncontrado.valor;
      descricao.value = pacoteEncontrado.descricao;
      document.getElementById('idPacoteE').value = idPacote; // Define o valor do campo ID do formulário

    } else {
      console.log('ERROOO PACOTE');// pacote não for encontrado
    }
  }

  //feito
  /**
   * Função responsável por salvar as alterações feitas em um pacote atualizado no servidor.
   * Obtém os dados atualizados do formulário de edição de pacote na interface do utilizador.
   * Envia uma requisição PUT ao servidor para atualizar os dados do pacote com o ID especificado.
   * Após a conclusão bem-sucedida da requisição, exibe uma mensagem de confirmação e atualiza a lista de pacotes na interface do utilizador.
   */
  saveUpdPacote = () => {
    var idPacote = document.getElementById('idPacoteE').value;

    document.getElementById("editaPacotes").style.display = "none";
    const nome = document.getElementById('nomePacoteE').value;
    const valor = document.getElementById('valorPacoteE').value;
    const descricao = document.getElementById('descPacoteE').value;
    
    // Cria um objeto com os dados atualizados do pacote
    var dados = {nome: nome, valor: valor, descricao: descricao};

    var xhr = new XMLHttpRequest();        
    xhr.open("PUT", "/pacote/" + idPacote, true);
    xhr.onreadystatechange = () => {
      if (xhr.readyState !== XMLHttpRequest.DONE) { return; }  
      if (xhr.status === 200) { 
        // Exibe uma mensagem de confirmação
        lert("Dados Atualizados"); 
        // Atualiza a lista de pacotes na interface do utilizador após a atualização bem-sucedida do pacote
        info.getPacotes();
      } else if (xhr.status === 400) {
          alert("Preencha todos os campos!");
      } else {
          console.error("Erro: O servidor retornou um status inesperado - " + xhr.status);
          alert("Erro: O servidor retornou um status inesperado - " + xhr.status);
      }
    };
    xhr.responseType="json";
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(dados));
  }

  //feito - NAO USAR
   /**
   * Função responsável por excluir um pacote do servidor.
   * Envia uma solicitação DELETE ao servidor para excluir o pacote com o ID especificado.
   * Após a exclusão bem-sucedida do pacote, remove o pacote do array 'pacote' e atualiza a exibição dos pacotes na interface do utilizador.
   * @param {number} idPacote - O ID do pacote a ser excluído.
   */
  deletePacote = (idPacote) => {
    var xhr = new XMLHttpRequest();
    xhr.open("DELETE", `/pacote/${idPacote}`, true);
    xhr.onreadystatechange = function () {
      if ((this.readyState === 4) && (this.status === 200)) {
          // Remove o pacote excluído do array 'pacote' utilizando o método splice
          info.pacote.splice(info.pacote.findIndex(i => i.id == idPacote), 1);
          // Atualiza a exibição dos pacotes na interface do utilizador
          info.showPacotes();
      }
    }
    xhr.responseType = "json";
		xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send();    
  }

  //feito
  /**
   * Função responsável por obter de forma assíncrona todas as informações dos cacifos do servidor.
   * Atualiza o display dos elementos HTML para mostrar a lista de cacifos e ocultar outros elementos relacionados à criação ou edição de pacotes ou cacifos.
   */
  getCacifos = () => {
    var cacifo = this.cacifo;

    document.getElementById("listaPacotes").style.display = "none"; // Oculta a lista de pacotes
    document.getElementById("editaPacotes").style.display = "none"; // Oculta o formulário de edição de pacotes
    document.getElementById("listaCacifos").style.display = "block"; // Exibe a lista de cacifos
    document.getElementById("editaCacifo").style.display = "none"; // Oculta o formulário de edição de cacifos
    document.getElementById("btnCriarPacote").style.display = "none";  // Oculta o botão de criação de pacotes
    document.getElementById("btnCriarCacifo").style.display = "block"; // Exibe o botão de criação de cacifos

    var xhr = new XMLHttpRequest();
    xhr.open("GET", "/cacifo", true);
    xhr.onreadystatechange = function () {
      if ((this.readyState === 4) && (this.status === 200)) {
        // Analisa a resposta JSON
        var response = JSON.parse(xhr.responseText);
        if (response.data && Array.isArray(response.data)) {
          cacifo.length = 0;
          // Adiciona os novos itens ao array
          response.data.forEach(function (current) {
              cacifo.push(current);
          });
            // Chama a função para exibir os cacifos
          info.showCacifos();
        }         
      }
    };
    xhr.send();    
  }

  //feito
  /**
   * Função responsável por exibir a lista de cacifos na interface do utilizador.
   * Atualiza o display dos elementos HTML para mostrar a lista de cacifos e ocultar outros elementos relacionados à criação ou edição de pacotes ou cacifos.
   */
  showCacifos = () => {
    document.getElementById("listaPacotes").style.display = "none";
    document.getElementById("editaPacotes").style.display = "none";
    document.getElementById("criarPacotes").style.display = "none";
    document.getElementById("listaCacifos").style.display = "block";
    document.getElementById("editaCacifo").style.display = "none";
    document.getElementById("btnCriarCacifo").style.display = "block";
    document.getElementById("criarCacifo").style.display = "none";
    document.getElementById("btnCriarPacote").style.display = "none";

    var cacifos = this.cacifo;
    
    const table = document.getElementById('tabelaCacifos');
    table.innerHTML = '';  // Limpa o conteúdo existente

    if (cacifos.length > 0) {
        // Itera sobre cada cacifo para criar as linhas da tabela
        cacifos.forEach(function (c) {
          // Verifica se media_consumo é nulo ou seja nenhum carregamento
          var mediaConsumo = c.media_consumo !== null ? `${c.media_consumo} mAh` : "NC"; // Verifica se media_consumo é nulo ou seja nenhum carregamento
          var tr = document.createElement('tr');
          tr.innerHTML = `
            <td>${c.id_cacifo}</td>
            <td>${c.status}</td>
            <td>${mediaConsumo}</td>
            <td>
                <button onclick="info.updateCacifo(${c.id_cacifo})">Editar</button>
                <button onclick="info.deleteCacifo(${c.id_cacifo})">Deletar</button>
                <!--<button onclick="deletarUsuario('id_do_usuario_1')">Grafico de Consumo</button>-->
            </td>`;

            // Adiciona a classe 'inactive' à linha se o status do cacifo for 'Inativo'
            if (c.status === 'Inativo') {
              tr.classList.add('inactive');
            }

          table.appendChild(tr);  
      });
    }
  }

  //feito
  /**
   * Função responsável por exibir o formulário de criação de cacifo e ocultar outros elementos relacionados à criação ou edição de pacotes ou cacifos.
   */
  criarCacifo = () => {
    document.getElementById("listaPacotes").style.display = "none";
    document.getElementById("editaPacotes").style.display = "none";
    document.getElementById("criarPacotes").style.display = "none";
    document.getElementById("listaCacifos").style.display = "none";
    document.getElementById("editaCacifo").style.display = "none";
    document.getElementById("btnCriarCacifo").style.display = "block";
    document.getElementById("criarCacifo").style.display = "block";
    document.getElementById("btnCriarPacote").style.display = "none";
  }

  //feito
  /**
   * Função responsável por salvar um novo cacifo no servidor.
   * Obtém o status selecionado do formulário de criação de cacifo, realiza uma requisição POST para criar um novo cacifo no servidor e exibe mensagens de sucesso ou erro.
   */
  saveNewCacifo = () => {
		let status = document.getElementById('statusCacifoC').value;
    console.log("teste status " + status);
    // Converte o status selecionado para o formato esperado pelo servidor
    switch(status) {
      case 'Ocupado':
        status = 1;
        break;
      case 'Livre':
        status = 2;
        break;
      case 'Manutenção':
        status = 3;
        break; 
      case 'Inativo':
        status = 4;
        break;  
    }

    var dados = {status: status};
    var xhr = new XMLHttpRequest();        
    xhr.open("POST", "/cacifo", true);
    xhr.onreadystatechange = () => {
      if (xhr.readyState !== XMLHttpRequest.DONE) { return; }
			if (xhr.status !== 200) { return; }
      
      // Exibe um alerta indicando que o cacifo foi criado com sucesso
      alert("Cacifo Criado");
      // Atualiza a lista de cacifos após a criação do novo cacifo
      info.getCacifos();
    };
    xhr.responseType="json";
    xhr.setRequestHeader('Content-Type', 'application/json');
    // Envia a requisição com os dados do novo cacifo no formato JSON
    xhr.send(JSON.stringify(dados));
  }

  //feito
  /**
   * Função responsável por exibir o formulário de edição do cacifo com base no ID do cacifo fornecido.
   * Preenche os campos do formulário com as informações do cacifo correspondente.
   * @param {number} idCacifo - O ID do cacifo que será editado.
   */
  updateCacifo = (idCacifo) => {
    var cacifo = this.cacifo;

    // Exibe o formulário de edição de cacifo
    document.getElementById("editaCacifo").style.display = "block";
    const id = document.getElementById('idCacifo');
    const status = document.getElementById('statusCacifo');

    // Encontra o cacifo correspondente com base no ID fornecido
    const cacifoEncontrado = cacifo.find(c => c.id_cacifo === idCacifo);

    // Preenche os campos do formulário com as informações do cacifo encontrado
    if (cacifoEncontrado) {
      id.value = cacifoEncontrado.id_cacifo; // Preenche o campo de ID
      status.value = cacifoEncontrado.status; // Preenche o campo de status
    } else {
      console.log('ERROOO CACIFO'); // Exibe uma mensagem de erro no console se o cacifo não for encontrado
    }
  }  

  //feito
  /**
   * Função responsável por salvar as atualizações feitas em um cacifo no servidor.
   * Obtém os dados do formulário de edição do cacifo, realiza uma requisição PUT para atualizar os dados do cacifo no servidor e exibe mensagens de sucesso ou erro.
   */
  saveUpdCacifo = () => {
    // Obtém o ID do cacifo a ser atualizado a partir do campo de ID do formulário
    var idCacifo = document.getElementById('idCacifo').value;

    // Oculta o formulário de edição de pacotes
    document.getElementById("editaPacotes").style.display = "none";
    // Obtém o status selecionado do campo de status do formulário
    let status = document.getElementById('statusCacifo').value;

    // Converte o status selecionado para o formato esperado pelo servidor
    switch(status) {
      case 'Ocupado':
        status = 1;
        break;
      case 'Livre':
        status = 2;
        break;
      case 'Manutenção':
        status = 3;
        break; 
      case 'Inativo':
        status = 4;
        break;  
    }

    // Cria um objeto com os dados do cacifo a serem atualizados
    var dados = {status: status};

    var xhr = new XMLHttpRequest();        
    xhr.open("PUT", "/cacifo/" + idCacifo, true);
    xhr.onreadystatechange = () => {
      if (xhr.readyState !== XMLHttpRequest.DONE) { return; }  
      if (xhr.status === 200) { 
        // Exibe um alerta indicando que os dados foram atualizados com sucesso
        alert("Dados Atualizados"); 
        // Atualiza a lista de cacifos após a atualização
        info.getCacifos();
      } else if (xhr.status === 400) {
          // Exibe um alerta se houver erro de validação nos dados enviados
          alert("Preencha todos os campos!");
      } else {
          console.error("Erro: O servidor retornou um status inesperado - " + xhr.status);
          alert("Erro: O servidor retornou um status inesperado - " + xhr.status);
      }
    };
    xhr.responseType="json";
    xhr.setRequestHeader('Content-Type', 'application/json');
    // Envia a requisição com os dados do cacifo a serem atualizados no formato JSON
    xhr.send(JSON.stringify(dados));
  }  

  //feito
  /**
   * Função responsável por marcar um cacifo como deletado no servidor, alterando o seu status para 'Inativo' (valor 4).
   * Realiza uma requisição PUT para atualizar o status do cacifo no servidor e atualiza a lista de cacifos na interface do utilizador.
   * @param {number} idCacifo - O ID do cacifo a ser deletado.
   */
  deleteCacifo = (idCacifo) => {
    // Define o status 'Inativo' para marcar o cacifo como deletado
    var status = 4;
    var dados = {status: status};
    
    var xhr = new XMLHttpRequest();
    xhr.open("PUT", `/cacifo/${idCacifo}`, true);
    xhr.onreadystatechange = function () {
      if ((this.readyState === 4) && (this.status === 200)) {
          // Atualiza a lista de cacifos após a exclusão do cacifo
          info.getCacifos();
      }
    }
    xhr.responseType = "json";
		xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(dados));    
  }

  //FEITO
  /**
 * Função responsável por fazer uma solicitação ao servidor para obter os dados do dashboard.
 * total de cacifos, a quantidade que esta sendo utilizada no momento, a quantidade de pagamentos pendentes e a quantidade de avaliações.
 * Atualiza o array 'geral' com os dados recebidos do servidor.
 * Chama a função 'dadosDashboard' para exibir os dados no dashboard após receber a resposta do servidor.
 */
  getDadosDashboard = () => {
    var geral = this.geral;

    var xhr = new XMLHttpRequest();
    xhr.open("GET", "/dados", true);
    xhr.onreadystatechange = function () {
      if ((this.readyState === 4) && (this.status === 200)) {
          var response = JSON.parse(xhr.responseText);
          if (response.data && Array.isArray(response.data)) {
              geral.length = 0;
              // Adiciona os novos itens ao array
              response.data.forEach(function (current) {
                geral.push(current);
              });
              info.dadosDashboard()
          }         
      }
    };
    xhr.send(); 
  }

  /**
   * Função responsável por exibir os dados do dashboard na interface do utilizador.
   * Atualiza os elementos HTML com os valores correspondentes aos dados do dashboard.
   */
  dadosDashboard = () => {   
    var geral = this.geral;

    document.getElementById('total-trotinetes').textContent = geral[0].total_cacifos;
    document.getElementById('cacifos-uso').textContent = geral[0].cacifos_em_uso;
    document.getElementById('pagamentos-pen').textContent = geral[0].pagamentos_pendentes;
    document.getElementById('total-ava').textContent = geral[0].total_avaliacoes;
  }

  //feito
  /**
   * Função responsável por obter os feedbacks do servidor.
   * Envia uma requisição GET para o servidor para obter os feedbacks.
   * Atualiza o array de feedbacks com os dados recebidos do servidor.
   * Chama a função para exibir os feedbacks na interface do utilizador.
   */
  getFeedbacks = () => {
    var feedbacks = this.feedback;
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "/avaliacao", true);
    xhr.onreadystatechange = function () {
      if ((this.readyState === 4) && (this.status === 200)) {
          // Converte a resposta do servidor para JSON
          var response = JSON.parse(xhr.responseText);
          // Verifica se a resposta contém dados e se é um array
          if (response.data && Array.isArray(response.data)) {
              feedbacks.length = 0;
              // Adiciona os novos itens ao array
              response.data.forEach(function (current) {
                  feedbacks.push(current);
              });
              // Chama a função para exibir os feedbacks na interface do utilizador
              info.showFeedbacks();
          }         
      }
    };
    xhr.send(); 
  }

  //feito
  /**
   * Função responsável por exibir os feedbacks na interface do utilizador.
   * Limpa o conteúdo existente do container onde os feedbacks serão exibidos.
   * Para cada feedback no array de feedbacks, cria um novo elemento HTML correspondente e adiciona ao container.
   * Define o estilo do botão com base no tipo de avaliação do feedback.
   */
  showFeedbacks = () => {
    // Obtém uma referência ao array de feedbacks
    var feedbacks = this.feedback;

    // Obtém uma referência ao container onde os feedbacks serão exibidos
    const container = document.getElementById('cardsFeedbacks');
    // Limpa o conteúdo existente do container
    container.innerHTML = '';

    // Verifica se há feedbacks no array
    if (feedbacks.length > 0) {
        // Para cada feedback no array de feedbacks
        feedbacks.forEach(function (feedback) {
            // Cria um novo elemento div para representar o card do feedback
            const cardDiv = document.createElement('div');
            cardDiv.className = 'card';

            // Cria um novo elemento div para representar o utilizador do feedback
            const userDiv = document.createElement('div');
            const iconList = document.createElement('ul');
            const userIcon = document.createElement('li');
            userIcon.innerHTML = '<i class="fa-solid fa-user"></i>';
            iconList.appendChild(userIcon);

            // Cria um novo item de lista para exibir o nome do utilizador do feedback
            const usernameItem = document.createElement('li');
            usernameItem.textContent = feedback.nomeUtilizador;
            iconList.appendChild(usernameItem);
            userDiv.appendChild(iconList);

            cardDiv.appendChild(userDiv);

            // Cria um novo botão para exibir o tipo de avaliação do feedback
            const typeButton = document.createElement('button');
            typeButton.textContent = feedback.tipoAvaliacao;

            // Define o estilo do botão com base no tipo de avaliação do feedback
            switch (feedback.tipoAvaliacao) {
              case 'Excelente':
                  typeButton.style.backgroundColor = '#b1ffab';
                  typeButton.style.color = '#259112';
                  break;
              case 'Mau':
                  typeButton.style.backgroundColor = '#ff9f9f';
                  typeButton.style.color = '#c71919';
                  break;
              case 'Satisfatorio':
                  typeButton.style.backgroundColor = 'yellow';
                  typeButton.style.color = '#c79b19';
                  break;
              default:
                  // Cor padrão se o tipo não for nenhum dos especificados
                  typeButton.style.backgroundColor = 'gray';
                  typeButton.style.color = 'white';
                  break;
            }

            // Cria um novo parágrafo para conter o botão do tipo de avaliação
            const typeParagraph = document.createElement('p');
            typeParagraph.className = 'close';
            typeParagraph.appendChild(typeButton);
            cardDiv.appendChild(typeParagraph);

            // Cria um novo parágrafo para exibir a data de criação do feedback
            const planParagraph = document.createElement('p');
            planParagraph.className = 'desc';
            planParagraph.textContent = feedback.data_criacao;
            cardDiv.appendChild(planParagraph);

            // Cria um novo parágrafo para exibir o comentário do feedback
            const descParagraph = document.createElement('p');
            descParagraph.className = 'desc';
            descParagraph.textContent = feedback.comentario; 
            cardDiv.appendChild(descParagraph);

            // Adiciona o card do feedback ao container
            container.appendChild(cardDiv);
        });
    }
  }

  //feito
  /**
   * Função para obter e contar o número de reservas de cacifos por utilizador.
   * Atualiza a variável 'user_cacifo' com os dados obtidos do servidor e chama a função 'chartCountDiarias' para exibir os resultados.
   */
  getCountDiarias = () => {
    var user_cacifo = this.user_cacifo;
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "/user-cacifo", true);
    xhr.onreadystatechange = function () {
      if ((this.readyState === 4) && (this.status === 200)) {
        var response = JSON.parse(xhr.responseText);
        if (response.data && Array.isArray(response.data)) {
          user_cacifo.length = 0;
          // Adiciona os novos itens ao array
          response.data.forEach(function (current) {
            user_cacifo.push(current);
          });
          console.log(user_cacifo);
          info.chartCountDiarias();
        }        
      }
    };
    xhr.send(); 
  }

  //feito
  /**
   * Função para criar e exibir um gráfico de barras representando o número de utilizações de cacifos por dia da semana.
   * Contabiliza o número de utilizações por dia da semana e cria um gráfico de barras usando a biblioteca Chart.js.
   */
  chartCountDiarias = () => {
    // Criar um objeto para armazenar contagens por dia da semana
    const utilizacoesPorDia = {};

    //percorrer o obejto
    this.user_cacifo.forEach(entry => {
      const diaDaSemana = entry.dia_semana;
      // Incrementa a contagem de utilizações para o dia da semana atual
      utilizacoesPorDia[diaDaSemana] = (utilizacoesPorDia[diaDaSemana] || 0) + entry.total_utilizacoes;
    });

    // criar o gráfico
    const ctx2 = document.getElementById("chart2").getContext("2d");
    const chart2 = new Chart(ctx2, {
      type: "bar",
      data: {
        labels: Object.keys(utilizacoesPorDia), // Dias da semana como rótulos do eixo X
        datasets: [{
          label: "Utilizações por Dia da Semana",
          data: Object.values(utilizacoesPorDia), // Número de utilizações como dados do gráfico
          backgroundColor: "rgba(255, 99, 132, 0.2)",
          borderColor: "rgba(255, 99, 132, 1)",
          borderWidth: 2,
        }],
      },
      options: {
        scales: {
          x: {
            type: 'category', // Configurar o eixo X como categoria (dias da semana)
            labels: ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"],
          },
          y: {
            beginAtZero: true, // Começa o eixo Y a partir de zero
            max: 10, // Definir o valor máximo no eixo Y como 10
            stepSize: 1, // Para garantir que os valores no eixo Y sejam inteiros
          },
        },
      },
    });
  }

  //feito
  /**
   * Função responsável por obter os dados de feedback do servidor e atualizar o gráfico de contagem de feedbacks.
   * Limpa o conteúdo existente do array de feedbacks.
   * Envia uma solicitação GET ao servidor para recuperar os dados de feedback.
   * Quando a resposta do servidor é recebida, os dados são adicionados ao array de feedbacks e o gráfico é atualizado.
   */
  getCountFeedbacks = () => {
    var feedback = this.feedback;
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "/count-avaliacao", true);
    xhr.onreadystatechange = function () {
      if ((this.readyState === 4) && (this.status === 200)) {
        var response = JSON.parse(xhr.responseText);
        if (response.data && Array.isArray(response.data)) {
          feedback.length = 0;
          // Adiciona os novos itens ao array
          response.data.forEach(function (current) {
            feedback.push(current);
          });
          console.log(feedback);
          // Atualiza o gráfico de contagem de feedbacks com os novos dados.
          info.chartCountFeedbacks();
        }        
      }
    };
    xhr.send(); 
  }

  //feito
  /**
   * Função responsável por exibir os feedbacks na interface do utilizador.
   * Limpa o conteúdo existente do container onde os feedbacks serão exibidos.
   * Para cada feedback no array de feedbacks, cria um novo elemento HTML correspondente e adiciona ao container.
   * Define o estilo do botão com base no tipo de avaliação do feedback.
   */
  chartCountFeedbacks = () => {
    // Obtém os dados de feedback do contexto atual (this.feedback).
    const feedback = this.feedback;

    // Mapeia os dados de feedback no formato necessário para o gráfico de rosca (doughnut),
    // onde cada elemento representa o número total de avaliações.
    const chartData = feedback.map(item => item.total_avaliacoes);

    // Configuração do gráfico:
    // Obtém o contexto do gráfico do elemento com o ID "doughnut-chart".
    const ctx3 = document.getElementById("doughnut-chart").getContext("2d");

    // Cria uma nova instância de gráfico de rosca (doughnutChart) usando Chart.js,
    // passando o contexto do gráfico e as opções de configuração.
    const doughnutChart = new Chart(ctx3, {
        // Define o tipo de gráfico como "doughnut" para criar um gráfico de rosca.
        type: "doughnut",
        // Define os dados do gráfico.
        data: {
            // Define os rótulos do gráfico como os tipos de avaliação presentes nos dados de feedback.
            labels: feedback.map(item => item.tipo_avaliacao),
            // Define os conjuntos de dados do gráfico, onde cada conjunto representa um tipo de avaliação.
            datasets: [{
                // Define um rótulo para o conjunto de dados.
                label: "Feedbacks",
                // Define os valores dos dados, que representam o número total de avaliações para cada tipo.
                data: chartData,
                // Define as cores de fundo para cada fatia do gráfico.
                backgroundColor: [
                    "rgba(255, 99, 132, 0.2)", // Vermelho
                    "rgb(255 255 0 / 63%)",     // Azul
                    "rgb(177, 255, 171)",       // Verde
                ],
                // Define as cores da borda para cada fatia do gráfico.
                borderColor: [
                    "rgba(255, 99, 132, 1)",   // Vermelho
                    "rgb(199, 155, 25)",        // Amarelo
                    "rgb(37, 145, 18)",         // Verde
                ],
                // Define a largura da borda para cada fatia do gráfico.
                borderWidth: 2,
            }],
        },

        // Define as opções do gráfico.
        options: {
            // Define o tamanho do corte no meio do gráfico de rosca (0 a 1).
            cutout: "70%",
            // Impede que o gráfico mantenha a proporção ao redimensionar.
            maintainAspectRatio: false,
        },
    });
  }

  //feito
  /**
 * Função para obter os dados da tabela de tempo de carregamento das trotinetes.
 * Faz uma requisição GET ao servidor para obter os dados de tempo de carga.
 * Atualiza o array 'tempo_carga' com os novos dados recebidos.
 * Chama a função 'showTempoCarga()' para exibir os dados na interface do utilizador.
 */
  getTempoCarga = () => {
    var tempo_carga = this.tempo_carga;
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "/tempo-carga", true);
    xhr.onreadystatechange = function () {
      if ((this.readyState === 4) && (this.status === 200)) {
        var response = JSON.parse(xhr.responseText);
        if (response.data && Array.isArray(response.data)) {
          tempo_carga.length = 0;
          // Adiciona os novos itens ao array
          response.data.forEach(function (current) {
            tempo_carga.push(current);
          });
          console.log(tempo_carga);
          info.showTempoCarga();
        }        
      }
    };
    xhr.send(); 
  }

  //feito
  /**
   * Função para exibir os dados de tempo de varregamento das trotinetes na interface do utilizador.
   * Limpa o conteúdo existente da tabela onde os dados serão exibidos.
   * Para cada registro de tempo de carga no array 'tempo_carga', cria uma nova linha na tabela e adiciona os dados correspondentes.
   */
  showTempoCarga = () => {
    var tempo_carga = this.tempo_carga;

    const table = document.getElementById('tblTempoCarga');
    table.innerHTML = '';

    if (tempo_carga.length > 0) {
      tempo_carga.forEach(function (tc) {
        var tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${tc.capacidade} mAh</td>
            <td>${tc.tempo}</td>`;
        table.appendChild(tr);  
      });
    }
  }

  //feito
  /**
   * Função para calcular o tempo de carregamento com base na capacidade da bateria.
   * Obtém a capacidade da bateria do elemento HTML com o ID 'idCapacidade'.
   * Calcula o tempo de carga utilizando a fórmula especificada.
   * Atualiza o valor do elemento HTML com o ID 'idTempo' para exibir o tempo de carregamento calculado.
   */
  calcularTempo = () => {
    let result = 0;
    const capacidade = document.getElementById("idCapacidade").value;
    const tempo = document.getElementById("idTempo");
    // Calcula o tempo de carga com base na capacidade da bateria
    result = 0.00009 * capacidade + 3.9698;

    tempo.value = "Tempo " + result;
  }

  //feito
  /**
   * Função responsável por obter os dados de consumo e chamar a função para exibir o gráfico de consumo.
   * Utiliza uma requisição XMLHttpRequest para obter os dados de consumo de cada cacifo pelo servidor.
   * Atualiza o array de consumos com os novos dados obtidos.
   * Chama a função chartConsumo() para exibir o gráfico de consumo com os dados atualizados.
   */
  getCountConsumo = () => {
    var consumos = this.consumo;
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "/consumo", true);
    xhr.onreadystatechange = function () {
      if ((this.readyState === 4) && (this.status === 200)) {
        var response = JSON.parse(xhr.responseText);
        if (response.data && Array.isArray(response.data)) {
          consumos.length = 0;
          // Adiciona os novos itens ao array
          response.data.forEach(function (current) {
            consumos.push(current);
          });
          console.log(consumos);
          info.chartConsumo();
        }        
      }
    };
    xhr.send(); 
  }

  //feito
  /**
   * Função responsável por exibir o gráfico de consumo na interface do utilizador.
   * Utiliza os dados de consumo armazenados no array 'consumo'.
   * Configura um gráfico de linha para exibir a média de consumo mensal ao longo do tempo.
   */
  chartConsumo = () => {
    var consumos = this.consumo;

    // Configuração do gráfico de atividade
    const ctx1 = document.getElementById("consumo-chart").getContext("2d");
    const activityChart = new Chart(ctx1, {
      type: "line",
      data: {
        labels: consumos.map(consumo => `${consumo.mes}/${consumo.ano}`), // Labels serão preenchidos com os meses e anos
        datasets: [{
            label: "Media do Consumo Mensal (MM/AAAA)",
            data: consumos.map(consumo => consumo.media_consumo), // Os dados serão preenchidos com as médias de consumo
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 2,
            pointRadius: 4,
        }],
      },
      options: {
        scales: {
          y: {
              beginAtZero: true,
          },
        },
      },
    });
  }

  /**
 * Função para verificar os pagamentos associados a um utilizador.
 * Exibe a interface de busca do utilizador.
 * Obtém o ID do utilizador a partir do campo de entrada no formulário.
 * Envia um pedido GET ao servidor para obter os pagamentos associados ao utilizador com o ID fornecido.
 * Ao receber a resposta, atualiza o array de pagamentos com os novos itens e chama a função showPagamentos() para exibir os pagamentos na interface.
 */
  verificarPagamentos = () => {
    var pagamentos = this.pagamento;
    document.getElementById('buscaruser').style.display = "block";

    var idUser = document.getElementById('idUserPag').value;

    var xhr = new XMLHttpRequest();        
    xhr.open("GET", "/user/" + idUser + "/pagamento/", true);
    xhr.onreadystatechange = function () {
      if ((this.readyState === 4) && (this.status === 200)) {
        var response = JSON.parse(xhr.responseText);
        if (response.data && Array.isArray(response.data)) {
          pagamentos.length = 0;
          // Adiciona os novos itens ao array
          response.data.forEach(function (current) {
            pagamentos.push(current);
          });
          // Exibe os pagamentos na interface
          console.log(pagamentos);
          info.showPagamentos();
        }        
      }
    };
    xhr.send(); 
  }

  /**
   * Função para exibir os pagamentos na interface do utilizador.
   * Oculta a interface de busca do utilizador e exibe as tabelas de pagamentos e os dados do pagamento.
   * Limpa o conteúdo existente da tabela de pagamentos.
   * Para cada pagamento no array de pagamentos, cria uma nova linha na tabela de pagamentos com os detalhes do pagamento.
   * Calcula o valor a ser pago com base no pacote associado ao pagamento e atualiza o total a pagar.
   */
  showPagamentos = () => {
    var pagamentos = this.pagamento;

    const h3 = document.getElementById('totalPagar');
    document.getElementById('buscaruser').style.display = "none";
    document.getElementById('divtabelapagamentos').style.display = "block";
    document.getElementById('divdadospagar').style.display = "block";
    // Referência à tabela de pagamentos
    const table = document.getElementById('tabelaPagamento');

    table.innerHTML = '';  // Limpa o conteúdo existente

    let totalPagar = 0; // Inicializa o total a pagar como zero

    if (pagamentos.length > 0) {
        pagamentos.forEach(function (p) {
          // Cria uma nova linha na tabela de pagamentos com os detalhes do pagamento
          var tr = document.createElement('tr');
          tr.innerHTML = `
            <td>${p.start_date}</td>
            <td>${p.tempo_uso_tempo}</td>
            <td>${p.statusPagamento}</td>`;

            // Calcula o valor com base no idPacote
            let valorCalculado = 0;
            if (p.idPacote === 2) {
                valorCalculado = calcularValorPacote2(p.tempo_uso_tempo);
            } else if (p.idPacote === 3) {
                valorCalculado = calcularValorPacote3(pagamentos);
            } else if (p.idPacote === 4) {
                valorCalculado = 45.00;
            }

          table.appendChild(tr);  
          // Atualiza o total a pagar
          totalPagar += valorCalculado;
      });
    }
    // Atualiza o conteúdo do elemento HTML para exibir o total a pagar
    h3.textContent = `Total a Pagar: ${totalPagar.toFixed(2)}`;
  }

  /**
   * Função para simular um pagamento.
   * Obtém o ID do pagamento e o valor a ser simulado a partir dos elementos HTML.
   * Envia uma solicitação PUT para o servidor com os dados do pagamento a serem atualizados.
   * Exibe uma mensagem de confirmação se o pagamento for realizado com sucesso.
   */
  simularPagamento = () => {
    var idPagamento = document.getElementById('idPagamento').value;
    var valor = document.getElementById('valorP').value;

    var dados = {valor: valor};

    var xhr = new XMLHttpRequest();        
    
    // Configura a solicitação com o método PUT e o endpoint correspondente ao ID do pagamento
    xhr.open("PUT", "/pagamento/" + idPagamento, true);
    xhr.onreadystatechange = () => {
      if (xhr.readyState !== XMLHttpRequest.DONE) { return; }  
      if (xhr.status === 200) { 
        alert("PAGAMENTO REALIZADO"); 
      } else {
          console.error("Erro: O servidor retornou um status inesperado - " + xhr.status);
          alert("Erro: O servidor retornou um status inesperado - " + xhr.status);
      }
    };
    xhr.responseType="json";
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(dados));
  }

  /**
   * Função para preparar a interface para registrar um novo pagamento.
   * Exibe o formulário de busca de utilizador e oculta a tabela de pagamentos e os dados de pagamento.
   */
  novoPagamento = () => {
    document.getElementById('buscaruser').style.display = "block";
    document.getElementById('divtabelapagamentos').style.display = "none";
    document.getElementById('divdadospagar').style.display = "none";
  }

}

// Instância da classe Information
const info = new Information();

// Evento onload é acionado quando a página é completamente carregada
window.onload = function ()  {
  window.info = info; 
  document.getElementById('username').textContent = localStorage.getItem('nomeuser');

  if (window.location.pathname === '/index.html') {
    info.getTempoCarga();
    info.getCountDiarias();
    info.getCountFeedbacks();
    info.getCountConsumo();
    info.getDadosDashboard();    
  }

  if (window.location.pathname === '/solar-scoot-user.html') {
    info.getUsers();
  }

  if (window.location.pathname === '/solar-scoot-feedbacks.html') {
    info.getFeedbacks();
    info.getCountFeedbacks();
  }  

};

/**
* Evento para o botao buttonlogout
* @param {string} element - Elemento HTML
**/
const logoutOnClick = () =>
{
  userToBlank();
  // Remover dados de sessão
  localStorage.removeItem('idUser');
  // Redirecionar para a página de login (ou outra página)
  window.location.href = 'login.html';	
}

/**
 * Função responsável por apagar o conteúdo do objeto de informações do utilizador.
 */
const userToBlank = () =>
{
	info.user = [];
}

/**
 * Função que verifica se o utilizador está autenticado com base no armazenamento local.
 * @returns {boolean} Retorna verdadeiro se o utilizador estiver autenticado, caso contrário, retorna falso.
 */
function isAuthenticated() {
  return localStorage.getItem('idUser') !== null;
}

/**
 * Função que ativa os campos de edição de pacote.
 */
function ativar() {
  document.getElementById('nomePacoteE').disabled = false;
	document.getElementById('valorPacoteE').disabled = false;
	document.getElementById('descPacoteE').disabled = false;
}


/**
 * Função responsável por calcular o valor do Pacote 2 com base no tempo de utilização.
 * @param {string} tempo - O tempo de utilização no formato "hh:mm:ss".
 * @returns {number} O valor calculado do Pacote 2.
 */
function calcularValorPacote2(tempo) {
  // Converte o tempo para segundos
  let tempoSegundos = calcularTempoSegundos(tempo);
  // Converte segundos para horas
  let tempoHoras = tempoSegundos / 3600; // 1 hora = 3600 segundos
  // Calcula o valor multiplicando o tempo em horas por 2.50
  return tempoHoras * 2.50;

}

/**
 * Função responsável por calcular o valor médio a ser pago por cliente para o Pacote 3.
 * @param {Array} pagamentos - Um array contendo objetos de pagamento com a propriedade start_date representando a data de início.
 * @returns {number} O valor médio a ser pago por cliente para o Pacote 3.
 */
function calcularValorPacote3(pagamentos) {
  // Crie um conjunto (Set) para armazenar datas únicas
  let datasUnicas = new Set();
  
  // Itere sobre os pagamentos e adicione as datas ao conjunto
  pagamentos.forEach(function(p) {
      // Extraia a data da string start_date (formato "DD/MM/AAAA")
      let data = p.start_date.split(' ')[0];
      // Adicione a data ao conjunto
      datasUnicas.add(data);
  });
  
   // Calcule o valor total a ser pago
   let valorTotal = datasUnicas.size * 13.00;
  
   // Divida o valor total pelo número total de pagamentos
   return valorTotal / pagamentos.length;
}

/**
 * Função responsável por calcular o tempo total em segundos com base em uma string de tempo no formato "HH:MM:SS".
 * @param {string} tempo - Uma string representando o tempo no formato "HH:MM:SS".
 * @returns {number} O tempo total em segundos.
 */
function calcularTempoSegundos(tempo) {
  let partes = tempo.split(':');
  let horas = parseInt(partes[0]);
  let minutos = parseInt(partes[1]);
  let segundos = parseInt(partes[2]);

  return horas * 3600 + minutos * 60 + segundos;
}