/*INSERTS*/
INSERT INTO user_type(descricao) VALUES ('Administrador');
INSERT INTO user_type(descricao) VALUES ('Regular');

INSERT INTO pacote(nome, descricao, valor) VALUES ('Aluguer do Cacifo', 'Utilize o cacifo sem carregamento pagando por hora', 1.50);
INSERT INTO pacote(nome, descricao, valor) VALUES ('Pacote Básico', 'Utilize o cacifo e o serviço de carregamento da trotinete pagando por hora', 2.50);
INSERT INTO pacote(nome, descricao, valor) VALUES ('Pacote Premium', 'Utilize o cacifo e o serviço de carregamento da trotinete de forma ilimitada /valor por dia', 13.00);
INSERT INTO pacote(nome, descricao, valor) VALUES ('Assinatura Mensal', 'Pagamento mensal com uso ilimitado', 45.00);

INSERT INTO Cacifo_status(descricao) VALUES ('Ocupado');
INSERT INTO Cacifo_status(descricao) VALUES ('Livre');
INSERT INTO Cacifo_status(descricao) VALUES ('Manutenção');
INSERT INTO Cacifo_status(descricao) VALUES ('Inativo');

INSERT INTO Cacifo(status) VALUES (2);
INSERT INTO Cacifo(status) VALUES (2);
INSERT INTO Cacifo(status) VALUES (2);
INSERT INTO Cacifo(status) VALUES (2);

INSERT INTO Avaliacao_type(descricao) VALUES ('Mau');
INSERT INTO Avaliacao_type(descricao) VALUES ('Satisfatorio');
INSERT INTO Avaliacao_type(descricao) VALUES ('Excelente');

INSERT INTO user(nome, email, password, rfidUser, user_type, idPacote, data_criacao) VALUES ('Anna Almada', 'anna@email.com', '123', '00000000000000', 1, null, NOW());
INSERT INTO user(nome, email, password, rfidUser, user_type, idPacote, data_criacao) VALUES ('Miguel Silva', 'miguel@email.com', 'senha123', 'C622CE2B000000', 2, 1, NOW());
INSERT INTO user(nome, email, password, rfidUser, user_type, idPacote, data_criacao) VALUES ('Sofia Pereira', 'sofia@email.com', 'senha456', 'A761B85F000000', 2, 1, NOW());
INSERT INTO user(nome, email, password, rfidUser, user_type, idPacote, data_criacao) VALUES ('Mariana Costa', 'mariana@email.com', 'senhastu', '00000000000000', 2, 2, NOW());
INSERT INTO user(nome, email, password, rfidUser, user_type, idPacote, data_criacao) VALUES ('João Santos', 'joao@email.com', 'senha789', '00000000000000', 2, 2, NOW());
INSERT INTO user(nome, email, password, rfidUser, user_type, idPacote, data_criacao) VALUES ('Inês Oliveira', 'ines@email.com', 'senhaabc', '00000000000000', 2, 3, NOW());
INSERT INTO user(nome, email, password, rfidUser, user_type, idPacote, data_criacao) VALUES ('Diogo Costa', 'diogo@email.com', 'senhadef', '00000000000000', 2, 3, NOW());
INSERT INTO user(nome, email, password, rfidUser, user_type, idPacote, data_criacao) VALUES ('Catarina Martins', 'catarina@email.com', 'senhaghi', '00000000000000', 2, 4, NOW());
INSERT INTO user(nome, email, password, rfidUser, user_type, idPacote, data_criacao) VALUES ('Rui Mendes', 'rui@email.com', 'senhapqr', '00000000000000', 2, 4, NOW());
INSERT INTO user(nome, email, password, rfidUser, user_type, idPacote, data_criacao) VALUES ('António Ferreira', 'antonio@email.com', 'senhajkl', '00000000000000', 2, 4, NOW());
INSERT INTO user(nome, email, password, rfidUser, user_type, idPacote, data_criacao) VALUES ('Beatriz Sousa', 'beatriz@email.com', 'senhamno', '00000000000000', 2, 4, NOW());

INSERT INTO User_Cacifo (idUser, idCacifo, start_date, end_date, consumo) VALUES
(1, 1, '2023-01-15 08:00:00', '2023-01-15 18:00:00', 50),
(2, 2, '2023-01-15 09:00:00', '2023-01-15 17:00:00', 60),
(3, 1, '2023-02-10 08:30:00', '2023-02-10 17:30:00', 70),
(4, 2, '2023-02-10 09:30:00', '2023-02-10 16:30:00', 80),
(5, 1, '2023-03-20 08:45:00', '2023-03-20 17:45:00', 90),
(6, 2, '2023-03-20 10:00:00', '2023-03-20 16:00:00', 100);

INSERT INTO Pagamento(idUserCacifo) VALUES (1);

insert into Avaliacao (idUser, avaliacao, comentario, data_criacao) values
(2, 1, 'Comentário sobre avaliação mau', '2024-01-29 12:00:00'),
(4, 2, 'Comentário sobre avaliação satisfatória', '2024-01-29 13:30:00'),
(7, 3, 'Comentário sobre avaliação excelente', '2024-01-29 15:45:00');

INSERT INTO Tempo_Carga(capacidade, tempo) VALUES (7650,6);
INSERT INTO Tempo_Carga(capacidade, tempo) VALUES (13200,5);
INSERT INTO Tempo_Carga(capacidade, tempo) VALUES (18000,6);
INSERT INTO Tempo_Carga(capacidade, tempo) VALUES (23000,7.5);
INSERT INTO Tempo_Carga(capacidade, tempo) VALUES (40000,7.5);
INSERT INTO Tempo_Carga(capacidade, tempo) VALUES (45000,7.5);
INSERT INTO Tempo_Carga(capacidade, tempo) VALUES (7800,5.5);
INSERT INTO Tempo_Carga(capacidade, tempo) VALUES (5100,3.5);
INSERT INTO Tempo_Carga(capacidade, tempo) VALUES (4300,3.25);
INSERT INTO Tempo_Carga(capacidade, tempo) VALUES (5200,4.5);
INSERT INTO Tempo_Carga(capacidade, tempo) VALUES (10000,3.5);
INSERT INTO Tempo_Carga(capacidade, tempo) VALUES (15000,6);
INSERT INTO Tempo_Carga(capacidade, tempo) VALUES (26000,8.5);
INSERT INTO Tempo_Carga(capacidade, tempo) VALUES (7850,5);
INSERT INTO Tempo_Carga(capacidade, tempo) VALUES (8400,4.5);
INSERT INTO Tempo_Carga(capacidade, tempo) VALUES (7400,3.5);
