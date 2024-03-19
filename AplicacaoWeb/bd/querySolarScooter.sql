/*QUERIES*/

SELECT * FROM user_type;
SELECT * FROM pacote;
SELECT * FROM User_Cacifo where idUser=1;
SELECT * FROM USER;
SELECT * FROM Cacifo_status;
SELECT * FROM cacifo;
SELECT * FROM Tempo_Carga;
SELECT * from avaliacao;
SELECT * from pagamento;

DELETE FROM User WHERE id=2;

SELECT u.nome, u.email, p.descricao as 'Pacote Adicionado' 
from user u 
inner join pacote p on u.idPacote = p.id;

/*LISTA DE USER*/
SELECT u.id, u.nome, u.email, ut.descricao AS 'user_type', IFNULL(p.nome, '*') AS 'pacote', DATE_FORMAT(u.data_criacao, '%d/%m/%Y') AS 'data_criacao' 
FROM user u 
LEFT JOIN pacote p ON u.idPacote = p.id 
INNER JOIN user_type ut ON u.user_type = ut.id;

/*GRAFICO*/
SELECT DAYOFWEEK(start_date) as dia_semana, COUNT(*) as quantidade_de_uso
FROM user_cacifo
WHERE idUser = 2 AND DAYOFWEEK(start_date) BETWEEN 2 AND 6
GROUP BY dia_semana;

/*AVALIAÇÃO*/   
select U.nome as nomeUtilizador, AT.descricao as tipoAvaliacao, A.comentario, DATE_FORMAT(A.data_criacao, '%d/%m/%Y') as data_criacao 
from Avaliacao A 
join User U on A.idUser = U.id 
join Avaliacao_type AT on A.avaliacao = AT.id;

/*GRAFICO APP*/
SELECT U.id AS id_user, U.nome AS nome_user, UC.idCacifo AS id_cacifo, COUNT(*) AS total_utilizacoes, DAYOFWEEK(UC.start_date) AS dia_da_semana, P.nome AS nome_pacote 
FROM User U 
JOIN User_Cacifo UC ON U.id = UC.idUser 
JOIN Pacote P ON U.idPacote = P.id 
WHERE U.id = 2 
GROUP BY id_user, nome_user, id_cacifo, dia_da_semana, nome_pacote 
ORDER BY id_user, dia_da_semana;

/*TEMPO DE USO*/
SELECT start_date AS data_inicio, end_date AS data_fim, TIMEDIFF(end_date, start_date) AS tempo_de_uso 
FROM User_Cacifo 
where idUser=2;
    
/*GRAFICO QUANTIDADE A CADA DIA*/    
SELECT DAYOFWEEK(start_date) AS dia_semana, COUNT(*) AS total_utilizacoes 
FROM User_Cacifo 
WHERE start_date IS NOT NULL 
GROUP BY dia_semana ORDER BY dia_semana;

/*COUNT AVALIAÇÕES*/
SELECT AT.descricao AS tipo_avaliacao, COUNT(*) AS total_avaliacoes
FROM Avaliacao A
JOIN Avaliacao_type AT ON A.avaliacao = AT.id
GROUP BY AT.descricao;

/*LISTA CACIFO E MEDIA CONSUMO*/
SELECT C.id AS id_cacifo,CS.descricao AS status, AVG(UC.consumo) AS media_consumo
FROM Cacifo C JOIN Cacifo_status CS ON C.status = CS.id 
LEFT JOIN  User_Cacifo UC ON C.id = UC.idCacifo 
GROUP BY  C.id, CS.descricao 
ORDER BY C.id;

/*MEDIA CONSUMO CACIFO*/
SELECT AVG(consumo) AS media_consumo
FROM User_Cacifo
WHERE idCacifo = 1;

/*GRAFICO MEDIA CONSUMO*/
SELECT YEAR(start_date) AS ano, MONTH(start_date) AS mes, AVG(consumo) AS media_consumo
FROM User_Cacifo
GROUP BY YEAR(start_date), MONTH(start_date)
ORDER BY ano, mes;


/*INSERIR USER-CACIFO  INICIO DE UTILIZAÇÃO*/
INSERT INTO User_Cacifo (idUser, idCacifo, start_date) VALUES (7, 1, NOW()); 


/*ATUALIZAR USER-CACIFO    FIM DE UTILIZAÇÃO*/
UPDATE User_Cacifo SET end_date = NOW(), consumo = 3 WHERE idUser = 7 AND end_date IS NULL;
INSERT INTO Pagamento(idUserCacifo) VALUES (1);


UPDATE User_Cacifo AS uc1
INNER JOIN (
    SELECT MAX(id) AS max_id
    FROM User_Cacifo
    WHERE idUser = 3
) AS uc2 ON uc1.id = uc2.max_id
SET uc1.end_date = NOW(), uc1.consumo = 41000;

Set @Maxid=(select Max(id) from User_Cacifo where iduser=3);
Update User_Cacifo set end_date=Now(),consumo=1000 where id=@Maxid and end_date is null;

/*DADOS DE UTILIZAÇÃO DA TROTINETE*/
SELECT idCacifo,start_date  FROM User_Cacifo WHERE idUser = 4 ORDER BY start_date DESC LIMIT 1;

select * from User_Cacifo where idUser=7;
SELECT * FROM PAGAMENTO where id=1;

/*CALCULAR PAGAMENTOS      preciso apresentar id*/
Select DISTINCT
DATE_FORMAT(user_c.start_date, '%d/%m/%Y %H:%i:%s') AS start_date,
TimeDiff(end_date,start_date) 'tempo_uso_tempo',
pago.statusPagamento,
p.id as 'idPacote'
from Pagamento pago
    LEFT JOIN User_Cacifo user_c ON pago.idUserCacifo=user_c.idCacifo
    LEFT JOIN Cacifo c ON user_c.idCacifo=c.id
	LEFT JOIN User u ON u.id = user_c.idUser   
    LEFT JOIN Pacote p ON p.id = u.idPacote
Where u.id=7 AND user_c.end_date IS NOT NULL;

SELECT DISTINCT 
    pago.id,
    DATE_FORMAT(user_c.start_date, '%d/%m/%Y %H:%i:%s') AS start_date,
	TimeDiff(end_date,start_date) AS tempo_uso_tempo,
    pago.statusPagamento,
    p.id AS idPacote
FROM 
	Pagamento pago
    LEFT JOIN User_Cacifo user_c ON pago.idUserCacifo=user_c.idCacifo
    LEFT JOIN Cacifo c ON user_c.idCacifo=c.id
	LEFT JOIN User u ON u.id = user_c.idUser   
    LEFT JOIN Pacote p ON p.id = u.idPacote
WHERE 
    u.id = 7 AND user_c.end_date IS NOT NULL;


/*FAZER PAGAMENTO*/
UPDATE Pagamento
SET valor = 50.00,
    dataPagamento = NOW(),
    statusPagamento = 'pago'
WHERE id = 5;


/*INFORMAÇÃO DEASHBOARD*/
SELECT
    (SELECT COUNT(*) FROM Avaliacao) AS total_avaliacoes,
    (SELECT COUNT(*) FROM Cacifo) AS total_cacifos,
    (SELECT COUNT(*) FROM Pagamento WHERE statusPagamento = 'pendente') AS pagamentos_pendentes,
    (SELECT COUNT(*) FROM User_Cacifo WHERE end_date IS NULL) AS cacifos_em_uso;
