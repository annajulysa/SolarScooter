DROP DATABASE IF EXISTS solarscooter_bd;
CREATE DATABASE IF NOT EXISTS solarscooter_bd;
USE solarscooter_bd;

create table User_type(
id int not null auto_increment primary key,
descricao varchar(150) not null
);

create table Pacote(
id int not null auto_increment primary key,
nome varchar(20) not null,
descricao varchar(150) not null,
valor decimal(10,2) not null
);

create table User(
id int not null auto_increment primary key,
nome varchar(150) not null,
email varchar(250) not null,
password varchar(100) not null,
rfidUser varchar(14),
user_type int not null,
idPacote int,
data_criacao datetime,
Constraint FK_user_type foreign key (user_type) references User_type(id),
Constraint FK_user_plano foreign key (idPacote) references Pacote(id)
);




create table Cacifo_status(
id int not null auto_increment primary key,
descricao varchar(50) not null
);

create table Cacifo(
id int not null auto_increment primary key,
status int not null,
Constraint FK_cacifo_status foreign key (status) 
	references Cacifo_status(id)
);

CREATE TABLE User_Cacifo (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    idUser INT NOT NULL,
    idCacifo INT NOT NULL,
    start_date DATETIME,
    end_date DATETIME,
    consumo FLOAT,
    CONSTRAINT FK_usercacifo_user FOREIGN KEY (idUser) REFERENCES User(id) ON DELETE CASCADE,
    CONSTRAINT FK_usercacifo_cacifo FOREIGN KEY (idCacifo) REFERENCES Cacifo(id)
);

CREATE TABLE Pagamento (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    idUserCacifo int,
    referencia int,
    valor DECIMAL(10,2),
    dataPagamento DATETIME,
    statusPagamento ENUM('pago', 'pendente') NOT NULL DEFAULT 'pendente',
    CONSTRAINT FK_pagamento_usercacifo FOREIGN KEY (idUserCacifo) REFERENCES User_Cacifo(idCacifo) ON DELETE CASCADE
);


create table Avaliacao_type(
id int not null auto_increment primary key,
descricao varchar(50) not null
);

create table Avaliacao(
id int not null auto_increment primary key,
idUser int not null,
avaliacao int not null,
comentario varchar(250),
data_criacao datetime,
Constraint FK_avaliacao_user foreign key (idUser) references User(id) ON DELETE CASCADE,
Constraint FK_avaliacao_avaliacao foreign key (avaliacao) references Avaliacao_type(id)
);

create table Tempo_Carga (
	id int not null auto_increment primary key,
	capacidade int not null,
	tempo decimal(10,2) not null
);