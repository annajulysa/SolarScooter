"use strict";

/* Imports */
const mysql = require("../node_modules/mysql");
const options = require("./connectionOptions.json").database;

/**
 * Função para efetuar o login de um utilizador.
 * @param {Object} req Pedido do cliente contendo os parâmetros de email e password
 * @param {Object} res Resposta do servidor
*/
const userLogin = (req, res) => {
    var connection = mysql.createConnection(options);
   
    var email = req.query.email;
    var password = req.query.password;

    const sqlQuery = mysql.format("SELECT * FROM user WHERE email=? and password=?", [email, password]);
    connection.query(sqlQuery, (err, rows) => {
        
        connection.end(); // Fecha a conexão após a execução da consulta

        if (err) {
            console.error('Erro durante a consulta:', err.message);
            res.sendStatus(500); // Internal Server Error
        } else {
            if (rows.length > 0) {
                res.status(200).json({"message": "OK", "data": rows }); // Retorna os dados do utilizador
                console.log(rows);
            } else {
                res.sendStatus(401); // Não autorizado (utilizador não encontrado)
            }
        }
    });
};

/**
 * Função para validar o login de um utilizador com base no email e senha fornecidos.
 * @param {Object} req O pedido do cliente contendo os dados de login no corpo da requisição.
 * @param {Object} res A resposta do servidor.
 */
const validaLogin = (req, res) => {
    var email = req.body.email;
    var password = req.body.password;

    const query = mysql.format("SELECT * FROM User WHERE email=? and password=?", [email, password]);
    var connection = mysql.createConnection(options);
       
    connection.query(query, (err, rows) => {
        connection.end(); // Fecha a conexão após a execução da consulta

        if (err) {
            console.error('Erro durante a consulta:', err.message);
            res.sendStatus(500); // Internal Server Error
        } else {
            if (rows.length > 0) {
                console.log(JSON.stringify(rows));
                res.status(200).json(rows); // Retorna os dados do utilizador
            } else {
                res.sendStatus(401); // Não autorizado (utilizador não encontrado)
            }
        }
    });
}

/**
 * Função para criar um novo utilizador no base de dados.
 * @param {Object} req O pedido do cliente contendo os dados do novo utilizador no corpo da requisição.
 * @param {Object} res A resposta do servidor.
 */
const userCreate = (req, res) => {
    var connection = mysql.createConnection(options);
   
    var nome = req.body.nome;
    var email = req.body.email;
    var password = req.body.password;
    let pacote = req.body.pacote;

    let user_type = req.body.user_type || '2'; // Se user_type não estiver presente, assume o valor padrão 2

    if(user_type === '1'){
        pacote = null;
    }

    const sqlQuery = mysql.format("INSERT INTO user(nome, email, password, user_type, idPacote, data_criacao) VALUES (?,?,?,?,?, NOW())", [nome, email, password, user_type, pacote]); 
    connection.query(sqlQuery,function (err, rows, fields) 
    {
        if (err) {
            res.sendStatus(404);
        } else {
            res.send(rows);
        }
    });
    connection.end();  

}

/**
 * Função para editar o tipo de pacote de um utilizador no base de dados.
 * @param {Object} req O pedido do cliente contendo o ID do utilizador a ser editado nos parâmetros da requisição e os novos dados do utilizador no corpo da requisição.
 * @param {Object} res A resposta do servidor.
 */
const userEdit = (req, res) => {
    var connection = mysql.createConnection(options);
   
    var idUser = req.params.id;
    let idPacote = req.body.pacote;
    let user_type = req.body.user_type || '2'; 

    if(user_type === '1'){
        idPacote = null;
    }

    const sqlQuery = mysql.format("UPDATE User SET idPacote=? WHERE id=?;", [idPacote, idUser]); 
    connection.query(sqlQuery,function (err, rows, fields) 
    {
        if (err) {
            res.sendStatus(404);
        } else {
            res.send(rows);
        }
    });
    connection.end();  

}

/**
 * Função para excluir um utilizador do base de dados.
 * @param {Object} req O pedido do cliente contendo o ID do utilizador a ser excluído nos parâmetros da requisição.
 * @param {Object} res A resposta do servidor.
 */
const userDelete = (req, res) => {
    var idUser = req.params.id;

    var connection = mysql.createConnection(options);
    
    var query = mysql.format("DELETE FROM User WHERE id=?;", idUser);
    connection.query(query, function (err, rows) {
        if (err) {
            res.json({"message": "Erro" });
        } else {
            res.json({"message": "OK", "data": rows });
        }
    }); 
    connection.end(); 
}

/**
 * Função para obter os dados de utilização de um utilizador específico do base de dados.
 * @param {Object} req O pedido do cliente contendo o ID do utilizador nos parâmetros da requisição.
 * @param {Object} res A resposta do servidor.
 */
const userData = (req, res) => {
    var connection = mysql.createConnection(options);
   
    var idUser = req.params.id;

    const sqlQuery = mysql.format("SELECT U.id AS id_user, U.nome AS nome_user, UC.idCacifo AS id_cacifo, COUNT(*) AS total_utilizacoes, DAYOFWEEK(UC.start_date) AS dia_da_semana, P.nome AS nome_pacote FROM User U JOIN User_Cacifo UC ON U.id = UC.idUser JOIN Pacote P ON U.idPacote = P.id WHERE U.id=? GROUP BY id_user, nome_user, id_cacifo, dia_da_semana, nome_pacote ORDER BY id_user, dia_da_semana;", [idUser]);
    connection.query(sqlQuery, function (err, rows) {
        connection.end(); // Fecha a conexão após a execução da consulta

        if (err) {
            res.json({"message": "Erro" });
        } else {
            res.json({"message": "OK", "data": rows });
        }
    }); 
}

/**
 * Função para listar os pagamentos pendentes de um utilizador específico no base de dados.
 * @param {Object} req O pedido do cliente contendo o ID do utilizador nos parâmetros da requisição.
 * @param {Object} res A resposta do servidor.
 */
const userPagamentosList = (req, res) => {
    var connection = mysql.createConnection(options);
   
    var idUser = req.params.id;

    const sqlQuery = mysql.format("Select DISTINCT DATE_FORMAT(user_c.start_date, '%d/%m/%Y %H:%i:%s') AS start_date, TimeDiff(end_date,start_date) 'tempo_uso_tempo', pago.statusPagamento, p.id as 'idPacote' from Cacifo c Left join User_Cacifo user_c On c.id=user_c.idCacifo Left join User u on u.id=user_c.idUser Left join Pacote p on p.id=u.idPacote Left join Pagamento pago on pago.idUserCacifo=1 Where u.id=? AND pago.dataPagamento IS NULL AND user_c.end_date IS NOT NULL;", [idUser]);
    connection.query(sqlQuery, function (err, rows) {
        connection.end(); // Fecha a conexão após a execução da consulta

        if (err) {
            res.json({"message": "Erro" });
        } else {
            res.json({"message": "OK", "data": rows });
        }
    }); 
}

/**
 * Função para registrar o feedback de um utilizador no base de dados.
 * @param {Object} req O pedido do cliente contendo o ID do utilizador nos parâmetros da requisição,
 *      o tipo de avaliação (mau, suficiente, etc.) e o comentário no corpo da requisição.
 * @param {Object} res A resposta do servidor.
 */
const feedbackUser = (req, res) => {
    var connection = mysql.createConnection(options);
   
    var idUser = req.params.id;
    var tipo = req.body.tipo; //mau, suficiente..
    var comentario = req.body.comentario;

    const sqlQuery = mysql.format("INSERT INTO avaliacao(idUser, avaliavao, comentario, data_criacao) VALUES (?,?,?,now())", [idUser, tipo, comentario]); 
    connection.query(sqlQuery,function (err, rows, fields) 
    {
        connection.end();  
        if (err) {
            res.sendStatus(404);
        } else {
            res.send(rows);
        }
    });
    
}

/**
 * Função para simular o pagamento de uma transação no base de dados.
 * @param {Object} req O pedido do cliente contendo o ID do pagamento nos parâmetros da requisição
 *                      e o valor do pagamento no corpo da requisição.
 * @param {Object} res A resposta do servidor.
 */
const simularPagamento = (req, res) => {
    var connection = mysql.createConnection(options);
   
    var idPagamento = req.params.id;
    var valor = req.body.valor;

    const sqlQuery = mysql.format("UPDATE Pagamento SET valor=?, dataPagamento = NOW(), statusPagamento = 'pago' WHERE id=?;", [valor, idPagamento]); 
    connection.query(sqlQuery,function (err, rows, fields) 
    {
        connection.end();  
        if (err) {
            res.sendStatus(404);
        } else {
            res.send(rows);
        }
    });
}

/**
 * Função para obter o último cacifo utilizado por um utilizador.
 * @param {Object} req O pedido do cliente contendo o ID do utilizador nos parâmetros da requisição.
 * @param {Object} res A resposta do servidor.
 */
const userCacifo = (req, res) => {
    var connection = mysql.createConnection(options);
   
    var idUser = req.params.id;

    const sqlQuery = mysql.format("SELECT idCacifo FROM User_Cacifo WHERE idUser=? ORDER BY start_date DESC LIMIT 1;", [idUser]);
    connection.query(sqlQuery, function (err, rows) {
        connection.end(); // Fecha a conexão após a execução da consulta

        if (err) {
            res.json({"message": "Erro" });
        } else {
            res.json({"message": "OK", "data": rows });
        }
    }); 
}

/**
 * Função para criar um registo na tabela "User_Cacifo"
 * @param {string} rfidkey Codigo rfid atribuido a cada utilizador para controlar o cacifo
 * @returns {void}
 */
const userCacifoCreate = (rfidkey) =>
{
    var query;
    var conn = mysql.createConnection(options);

    /* Atualiza a tabela "Cacifo"
    para definir o status como 1 (ocupado) */
    query = mysql.format(
        `
            UPDATE Cacifo
            SET status = 1
            WHERE id = 1
        `
    );
    conn.query(query, (err, rows, fields) =>
    {
        if (err)
        {
            console.error('Erro ao atualizar a tabela "Cacifo":', err);
        }
        else
        {
            console.log('Tabela "Cacifo" atualizada com sucesso.');
        }
    });

    /* Criar dados na tabela "Pagamentos"*/
    query = mysql.format(
        `
            INSERT INTO Pagamento(idUserCacifo)
            VALUES (1);
        `
    );
    conn.query(query, (err, rows, fields) =>
    {
        if (err)
        {
            console.error('Erro ao atualizar a tabela "Cacifo":', err);
        }
        else
        {
            console.log('Tabela "Pagamento" atualizada com sucesso.');
        }
    });

    /* Encontrar o id do
    utilizador com base no codigo rfid */
    query = mysql.format(
        `
            SELECT id
            FROM User
            WHERE rfidUser = ?
        `,[
            rfidkey
    ]);
    conn.query(query, (err, rows, fields) =>
    {
        if (err)
        {
            console.error(`Erro ao consultar o base de dados: ${err}`);
            return;
        }
        if (rows.length == 0)
        {
            /* Verifica se encontrou um utilizador com o codigo rfid especificado */
            console.log(`Nenhum utilizador encontrado com o codigo rfid: ${rfidkey}.`);
            return;
        }
        /* Insere um novo registo
        na tabela "User_Cacifo" */
        let subquery = mysql.format(
            `
                INSERT INTO User_Cacifo (idUser, idCacifo, start_date)
                VALUES (?, 1, NOW())
            `,[
                rows[0].id
        ]);
        conn.query(subquery, (err, rows, fields) =>
        {
            if (err)
            {
                console.error(`Erro ao inserir registo na tabela "User_Cacifo": ${err}`);
            }
            else
            {
                console.log(`Novo registo inserido na tabela "User_Cacifo".`);
            }
        });
    });

    ///conn.end();
}

/**
 * Função para atualizar um registo existente na tabela "User_Cacifo"
 * @param {string} rfidkey Codigo rfid atribuido a cada utilizador para controlar o cacifo
 * @param {float} consumo Total consumido (mAh) durante a sessão deste utilizador
 * @returns {void}
 */
const userCacifoUpdate = (rfidkey, consumo) =>
{
    var query;
    var conn = mysql.createConnection(options);

    /* Atualiza a tabela Cacifo
    para definir o status como 2 (livre) */
    query = mysql.format(
        `
            UPDATE Cacifo
            SET status = 2
            WHERE id = 1
        `
    );
    conn.query(query, (err, rows, fields) =>
    {
        if (err)
        {
            console.error(`Erro ao atualizar a tabela "Cacifo": ${err}`);
        }
        else
        {
            console.log(`Tabela Cacifo atualizada com sucesso.`);
        }
    });

    /* encontrar o id do
    utilizador com base num codigo rfid */
    query = mysql.format(
        `
            SELECT id
            FROM User
            WHERE rfidUser = ?
        `,[
            rfidkey
    ]);
    conn.query(query, (err, rows, fields) =>
    {
        if (err)
        {
            console.error(`Erro ao consultar a base de dados: ${err}`);
            conn.end();
            return;
        }
        if (rows.length == 0)
        {
            /* Verifica se encontrou um utilizador com o codigo rfid especificado */
            console.log(`Nenhum utilizador encontrado com o codigo rfid: ${rfidkey}.`);
            conn.end();
            return;
        }

        /* Atualiza o registo na tabela "User_Cacifo" com o "idUser" correspondente.
        Atualizar o registo onde "end_date" ainda não foi definido ou seja.. ainda estava em uso */
        let subquery = mysql.format(
            `
                UPDATE User_Cacifo
                SET end_date = NOW(), consumo = ?
                WHERE idUser = ?
                AND end_date IS NULL
            `,[
                consumo,
                rows[0].id
            ]
        )
        conn.query(subquery, (err, rows, fields) =>
        {
            if (err)
            {
                console.error(`Erro ao atualizar registo na tabela "User_Cacifo": ${err}`);
                conn.end();
            }
            else
            {
                console.log(`Registo atualizado na tabela "User_Cacifo".`);
                conn.end();
            }
        });
    });
};

/**
 * Desbloqueia o cacifo atribuido ao utilizador devolvido.
 * @param {Express.Request} req Espera receber o id do utilizador
 * @param {Express.Response} res Resposta ao pedido
 * @param {mqtt.client} mqtt Instancia da conecção ao mqtt broker
 * @returns {void}
 */
const detravarCacifo = (req, res, mqtt) =>
{
    const conn = mysql.createConnection(options);
    const query = mysql.format(
        `
            SELECT rfidUser
            FROM User
            WHERE id = ?
        `,[
            req.params.id
    ]);

    conn.query(query, (err, rows, fields) =>
    {
        if (err)
        {
            console.error('Erro ao utilizar a base de dados:', err);
            res.status(500).json({error: 'Erro interno do servidor'});
            conn.end();
            return;
        }
        if (rows.length === 0)
        {
            console.error('Utilizador não encontrado.');
            res.status(404).json({error: 'utilizador não encontrado'});
            conn.end();
            return;
        }
        /* Todo bem, mandar desbloquear cacifo */
        console.log(rows[0].rfidUser)
        mqtt.doPublish('UNLOCK', rows[0].rfidUser);
        res.status(200).json({message: 'Solicitação de destravamento enviada com sucesso'});
        conn.end();
    });
}

/**
 * Função para obter os dados do dashboard.
 * Retorna o total de avaliações, o total de cacifos, o número de pagamentos pendentes e o número de cacifos em uso.
 * @param {Object} req O pedido do cliente.
 * @param {Object} res A resposta do servidor.
 */
const dadosDashboard = (req, res) => {
    var connection = mysql.createConnection(options);
    
    var query = mysql.format("SELECT (SELECT COUNT(*) FROM Avaliacao) AS total_avaliacoes, (SELECT COUNT(*) FROM Cacifo) AS total_cacifos, (SELECT COUNT(*) FROM Pagamento WHERE statusPagamento = 'pendente') AS pagamentos_pendentes,(SELECT COUNT(*) FROM User_Cacifo WHERE end_date IS NULL) AS cacifos_em_uso;");
    connection.query(query, function (err, rows) {
        connection.end(); 
        
        if (err) {
            res.json({"message": "Erro" });
        } else {
            res.json({"message": "OK", "data": rows });
        }
    });
} 

/**
 * Função para obter a lista de cacifos com seus status e média de consumo.
 * @param {Object} req O pedido do cliente.
 * @param {Object} res A resposta do servidor.
 */
const cacifosList = (req, res) => {
    var connection = mysql.createConnection(options);
    
    var query = mysql.format("SELECT C.id AS id_cacifo,CS.descricao AS status, AVG(UC.consumo) AS media_consumo FROM Cacifo C JOIN Cacifo_status CS ON C.status = CS.id LEFT JOIN  User_Cacifo UC ON C.id = UC.idCacifo GROUP BY  C.id, CS.descricao ORDER BY C.id;");
    connection.query(query, function (err, rows) {
        connection.end(); 
        
        if (err) {
            res.json({"message": "Erro" });
        } else {
            res.json({"message": "OK", "data": rows });
        }
    });
}

/**
 * Função para criar um novo cacifo com o status fornecido.
 * @param {Object} req O pedido do cliente contendo o status do cacifo.
 * @param {Object} res A resposta do servidor.
 */
const cacifoCreate = (req, res) => {
    var status = req.body.status;
  
    var connection = mysql.createConnection(options);
  
    var query = mysql.format("INSERT INTO Cacifo(status) VALUES (?);", [status]);
    connection.query(query, function (err, rows) {
      connection.end();
  
      if (err) {
        res.json({ "message": "Erro" });
      } else {
        res.json({ "message": "OK", "data": rows });
      }
    });
};

/**
 * Função para editar o status de um cacifo específico.
 * @param {Object} req O pedido do cliente contendo o ID do cacifo e o novo status.
 * @param {Object} res A resposta do servidor.
 */
const cacifoEdit = (req, res) => {
    var connection = mysql.createConnection(options);

    var idCacifo = req.params.id;
    var status = req.body.status;

    var query = mysql.format("UPDATE cacifo SET status=? WHERE id=?;", [status, idCacifo]);    
    connection.query(query, function (err, rows) {
        connection.end();

        if (err) {
            console.error(err);
            return res.status(500).json({ "message": "Erro ao executar a consulta." });
        } else {
            console.log(JSON.stringify(rows));
            res.json({ "message": "OK", "data": rows });
            console.log(rows);
        }
    });

}

/**
 * Função para excluir um cacifo específico do base de dados.
 * @param {Object} req O pedido do cliente contendo o ID do cacifo a ser excluído.
 * @param {Object} res A resposta do servidor.
 */
const cacifoDelete = (req, res) => {
    var idPacote = req.params.id;

    var connection = mysql.createConnection(options);
    
    var query = mysql.format("DELETE FROM Cacifo WHERE id=?;", idPacote);
    connection.query(query, function (err, rows) {
        if (err) {
            res.json({"message": "Erro" });
        } else {
            res.json({"message": "OK", "data": rows });
        }
    }); 
    connection.end(); 
}

/**
 * Função para listar todos os utilizadores registados no sistema.
 * 
 * @param {Object} req O pedido do cliente.
 * @param {Object} res A resposta do servidor.
 */
const usersList = (req, res) => {
    var connection = mysql.createConnection(options);
    
    var query = mysql.format("SELECT u.id, u.nome, u.email, ut.descricao AS 'user_type', IFNULL(p.nome, '*') AS 'pacote', DATE_FORMAT(u.data_criacao, '%d/%m/%Y') AS 'data_criacao' FROM user u LEFT JOIN pacote p ON u.idPacote = p.id INNER JOIN user_type ut ON u.user_type = ut.id;");
    connection.query(query, function (err, rows) {
        connection.end(); // Fecha a conexão após a execução da consulta

        if (err) {
            res.json({"message": "Erro" });
        } else {
            res.json({"message": "OK", "data": rows });
        }
    }); 
};

/**
 * Função para listar todos os feedbacks registados no sistema.
 * 
 * @param {Object} req O pedido do cliente.
 * @param {Object} res A resposta do servidor.
 */
const feedbackList = (req, res) => {
    var connection = mysql.createConnection(options);
    
    var query = mysql.format("select U.nome as nomeUtilizador, AT.descricao as tipoAvaliacao, A.comentario, DATE_FORMAT(A.data_criacao, '%d/%m/%Y') as 'data_criacao' from Avaliacao A join User U on A.idUser = U.id join Avaliacao_type AT on A.avaliacao = AT.id;");
    connection.query(query, function (err, rows) {
        connection.end(); 

        if (err) {
            res.json({"message": "Erro" });
        } else {
            res.json({"message": "OK", "data": rows });
        }
    });    
}

/**
 * Função para contar o número de feedbacks agrupados por tipo de avaliação.
 * 
 * @param {Object} req O pedido do cliente.
 * @param {Object} res A resposta do servidor.
 */
const countFeedback = (req, res) => {
    var connection = mysql.createConnection(options);
    
    var query = mysql.format("SELECT AT.descricao AS tipo_avaliacao, COUNT(*) AS total_avaliacoes FROM Avaliacao A JOIN Avaliacao_type AT ON A.avaliacao = AT.id GROUP BY AT.descricao;");
    connection.query(query, function (err, rows) {
        connection.end(); 

        if (err) {
            res.json({"message": "Erro" });
        } else {
            res.json({"message": "OK", "data": rows });
        }
    });    
}

/**
 * Função para listar todos os pacotes disponíveis.
 * 
 * @param {Object} req O pedido do cliente.
 * @param {Object} res A resposta do servidor.
 */
const pacoteList = (req, res) => {
    var connection = mysql.createConnection(options);
    
    var query = mysql.format("SELECT * FROM Pacote");
    connection.query(query, function (err, rows) {
        connection.end(); 
        
        if (err) {
            res.json({"message": "Erro" });
        } else {
            res.json({"message": "OK", "data": rows });
        }
    }); 
}

/**
 * Função para criar um novo pacote.
 * 
 * @param {Object} req O pedido do cliente contendo as informações do novo pacote.
 * @param {Object} res A resposta do servidor.
 */
const pacoteCreate = (req, res) => {
    var nome = req.body.nome;
    var valor = req.body.valor;
    var descricao = req.body.descricao;
    var connection = mysql.createConnection(options);
    
    var query = mysql.format("INSERT INTO pacote(nome, descricao, valor) VALUES (?,?,?);", [nome, descricao, valor]);
    connection.query(query, function (err, rows) {
        if (err) {
            res.json({"message": "Erro" });
        } else {
            res.json({"message": "OK", "data": rows });
        }
    }); 
    connection.end(); 
}

/**
 * Função para editar um pacote existente.
 * 
 * @param {Object} req O pedido do cliente contendo as informações atualizadas do pacote.
 * @param {Object} res A resposta do servidor.
 */
const pacoteEdit = (req, res) => {
    var idPacote = req.params.id;
    var nome = req.body.nome;
    var valor = req.body.valor;
    var descricao = req.body.descricao;

    var connection = mysql.createConnection(options);
    
    var query = mysql.format("UPDATE pacote SET nome=?, valor=?, descricao=? WHERE id=?;", [nome, valor, descricao, idPacote]);
    connection.query(query, function (err, rows) {
        connection.end();
        if (err) {
            res.json({"message": "Erro" });
        } else {
            res.json({"message": "OK", "data": rows });
            console.log(rows);
        }
    });      
}

/**
 * Função para excluir um pacote existente.
 * 
 * @param {Object} req O pedido do cliente contendo o ID do pacote a ser excluído.
 * @param {Object} res A resposta do servidor.
 */
const pacoteDelete = (req, res) => {
    var idPacote = req.params.id;

    var connection = mysql.createConnection(options);
    
    var query = mysql.format("DELETE FROM Pacote WHERE id=?;", idPacote);
    connection.query(query, function (err, rows) {
        if (err) {
            res.json({"message": "Erro" });
        } else {
            res.json({"message": "OK", "data": rows });
        }
    }); 
    connection.end(); 
}

/**
 * Função para contar o número de utilizações por dia da semana.
 * 
 * @param {Object} req O pedido do cliente.
 * @param {Object} res A resposta do servidor.
 */
const countDiarias = (req, res) => {
    var connection = mysql.createConnection(options);
    
    var query = mysql.format("SELECT DAYOFWEEK(start_date) AS dia_semana, COUNT(*) AS total_utilizacoes FROM User_Cacifo WHERE start_date IS NOT NULL GROUP BY dia_semana ORDER BY dia_semana;");
    connection.query(query, function (err, rows) {
        connection.end(); 

        if (err) {
            res.json({"message": "Erro" });
        } else {
            res.json({"message": "OK", "data": rows });
        }
    }); 

}

/**
 * Função para obter a média mensal de consumo.
 * 
 * @param {Object} req O pedido do cliente.
 * @param {Object} res A resposta do servidor.
 */
const consumoMensal = (req, res) => {
    var connection = mysql.createConnection(options);
    
    var query = mysql.format("SELECT YEAR(start_date) AS ano, MONTH(start_date) AS mes, AVG(consumo) AS media_consumo FROM User_Cacifo GROUP BY YEAR(start_date), MONTH(start_date) ORDER BY ano, mes;");
    connection.query(query, function (err, rows) {
        connection.end(); 

        if (err) {
            res.json({"message": "Erro" });
        } else {
            res.json({"message": "OK", "data": rows });
        }
    }); 

}

/**
 * Função para obter os dados sobre o tempo de carga das baterias.
 * 
 * @param {Object} req O pedido do cliente.
 * @param {Object} res A resposta do servidor.
 */
const tempoCarga = (req, res) => {
    var connection = mysql.createConnection(options);
    
    var query = mysql.format("SELECT * FROM Tempo_Carga");
    connection.query(query, function (err, rows) {
        connection.end(); 

        if (err) {
            res.json({"message": "Erro" });
        } else {
            res.json({"message": "OK", "data": rows });
        }
    }); 

}

module.exports = {
    // Funções relacionadas ao utilizador
    validaLogin,
    userLogin,
    userCreate,
    userEdit,
    userDelete,
    userData,
    usersList,
    userPagamentosList,
    feedbackUser,
    simularPagamento,
    // Funções relacionadas ao cacifo - utilizador
    userCacifo,
    userCacifoCreate,
    userCacifoUpdate,
    detravarCacifo,
    // Funções relacionadas aos cacifos
    cacifosList,
    cacifoCreate,
    cacifoEdit,
    cacifoDelete,
    // Funções relacionadas aos feedbacks
    feedbackList,
    countFeedback,
    // Funções relacionadas aos pacotes
    pacoteList,
    pacoteCreate,
    pacoteEdit,
    pacoteDelete,
    // Funções para análises estatísticas
    countDiarias,
    consumoMensal,
    tempoCarga,
    dadosDashboard
};
