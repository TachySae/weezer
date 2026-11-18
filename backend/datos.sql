DROP DATABASE IF EXISTS `lemans`;
CREATE DATABASE  IF NOT EXISTS `lemans`;
USE `lemans`;

CREATE TABLE `categoria` (
  `Categoria_ID` int NOT NULL AUTO_INCREMENT,
  `Nombre` varchar(50) NOT NULL,
  PRIMARY KEY (`Categoria_ID`)
);
INSERT INTO `categoria` (`Categoria_ID`,`Nombre`) values
(1,'Hypercar'),
(2,'LMP2'),
(3,'LMP3'),
(4,'GT3'),
(5,'GT4'),
(6,'Legends Cars');

CREATE TABLE `circuito` (
  `Circuito_ID` int NOT NULL AUTO_INCREMENT,
  `Nombre_circuito` varchar(50) NOT NULL,
  `Pais` varchar(50) NOT NULL,
  `Longitud` varchar(50) NOT NULL,
  PRIMARY KEY (`Circuito_ID`)
);
INSERT INTO `circuito` (`Nombre_circuito`, `Pais`, `Longitud`) VALUES
('Spa-Francorchamps', 'Bélgica', '7.004 km'),
('Circuit de la Sarthe', 'Francia', '13.626 km'),
('Sebring', 'Estados Unidos', '6.019 km'),
('Monza', 'Italia', '5.793 km'),
('Fuji Speedway', 'Japón', '4.563 km'),
('Nürburgring Nordschleife', 'Alemania', '20.832 km'),
('Bahrain International Circuit', 'Bahrein', '5.412 km'),
('Portimão', 'Portugal', '4.653 km'),
('COTA', 'Estados Unidos', '5.513 km'),
('Interlagos', 'Brasil', '4.309 km');

CREATE TABLE `clima` (
  `Clima_ID` int NOT NULL AUTO_INCREMENT,
  `Tipo_clima` varchar(50) NOT NULL,
  `Temperatura` varchar(50) NOT NULL,
  `Humedad` varchar(50) NOT NULL,
  PRIMARY KEY (`Clima_ID`)
);
INSERT INTO `clima` (`Tipo_clima`, `Temperatura`, `Humedad`) VALUES

('Despejado', '24°C', '40%'),
('Lluvia', '15°C', '95%'),
('Nublado', '19°C', '65%'),
('Tormenta', '12°C', '100%'),
('Niebla', '10°C', '85%'),
('Calor Extremo', '35°C', '30%'),
('Llovizna', '17°C', '80%');


CREATE TABLE `equipo` (
  `Equipo_ID` int NOT NULL AUTO_INCREMENT,
  `Nombre` varchar(50) NOT NULL,
  `Nacionalidad` varchar(50) NOT NULL,
  PRIMARY KEY (`Equipo_ID`)
);
INSERT INTO `equipo` (`Nombre`, `Nacionalidad`) VALUES
('Toyota Gazoo Racing', 'Japón'),
('Porsche Penske Motorsport', 'Estados Unidos'),
('Ferrari AF Corse', 'Italia'),
('Peugeot TotalEnergies', 'Francia'),
('Cadillac Racing', 'Estados Unidos'),
('Hertz Team JOTA', 'Reino Unido'),
('BMW M Team WRT', 'Bélgica'),
('Alpine Elf Endurance Team', 'Francia'),
('Lamborghini Iron Lynx', 'Italia'),
('Proton Competition', 'Alemania'),
('Manthey PureRxcing', 'Lituania'),
('Manthey EMA', 'Australia'),
('Team WRT', 'Bélgica'),
('Vista AF Corse', 'Italia'),
('Iron Dames', 'Italia'),
('Heart of Racing Team', 'Estados Unidos'),
('D`station Racing', 'Japón'),
('TF Sport', 'Reino Unido'),
('Akkodis ASP Team', 'Francia'),
('Proton Competition GT', 'Alemania');


CREATE TABLE `neumatico` (
  `ID_neumatico` int NOT NULL,
  `Marca` varchar(50) DEFAULT NULL,
  `Tipo` varchar(50) DEFAULT NULL,
  `Durabilidad` varchar(50) DEFAULT NULL,
  `Agarre` int DEFAULT NULL,
  PRIMARY KEY (`ID_neumatico`)
);
INSERT INTO `neumatico` (`ID_neumatico`, `Marca`, `Tipo`, `Durabilidad`, `Agarre`) VALUES
(1, 'Michelin', 'Slick Blando (Soft)', 'Baja', 10),
(2, 'Michelin', 'Slick Medio (Medium)', 'Media', 8),
(3, 'Michelin', 'Slick Duro (Hard)', 'Alta', 6),
(4, 'Goodyear', 'Slick Blando (Soft)', 'Baja', 9),
(5, 'Goodyear', 'Slick Medio (Medium)', 'Media', 7),
(6, 'Michelin', 'Lluvia Ligera (Drying Wet)', 'Media', 7),
(7, 'Michelin', 'Lluvia Intensa (Full Wet)', 'Baja', 9),
(8, 'Goodyear', 'Lluvia (Wet)', 'Media', 8);

CREATE TABLE `categoria_neumatico` (
  `FK_Categoria_ID` int NOT NULL,
  `FK_ID_Neumatico` int NOT NULL,
  PRIMARY KEY (`FK_Categoria_ID`,`FK_ID_Neumatico`),
  KEY `FK_ID_Neumatico` (`FK_ID_Neumatico`),
  CONSTRAINT `categoria_neumatico_ibfk_1` FOREIGN KEY (`FK_Categoria_ID`) REFERENCES `categoria` (`Categoria_ID`),
  CONSTRAINT `categoria_neumatico_ibfk_2` FOREIGN KEY (`FK_ID_Neumatico`) REFERENCES `neumatico` (`ID_neumatico`)
);
insert into `categoria_neumatico` (`FK_Categoria_ID`,`FK_ID_Neumatico`) Values
(1,1),
(1,2),
(1,4);

CREATE TABLE `carrera` (
  `Carrera_ID` int NOT NULL AUTO_INCREMENT,
  `Circuito_ID` int NOT NULL,
  `Clima_ID` int NOT NULL,
  `Nombre` varchar(50) NOT NULL,
  `Fecha` date NOT NULL,
  `Duracion` time NOT NULL,
  `Estado` varchar(50) NOT NULL,
  PRIMARY KEY (`Carrera_ID`),
  KEY `fk_Carrera_Circuito_ID_Circuito` (`Circuito_ID`),
  KEY `fk_Carrera_Clima_ID_Clima` (`Clima_ID`),
  CONSTRAINT `fk_Carrera_Circuito_ID_Circuito` FOREIGN KEY (`Circuito_ID`) REFERENCES `circuito` (`Circuito_ID`),
  CONSTRAINT `fk_Carrera_Clima_ID_Clima` FOREIGN KEY (`Clima_ID`) REFERENCES `clima` (`Clima_ID`)
);
INSERT INTO `carrera` (`Circuito_ID`, `Clima_ID`, `Nombre`, `Fecha`, `Duracion`, `Estado`) VALUES
(1, 1, 'Sprint de Spa', '2026-05-02', '01:00:00', 'Terminada'),
(2, 2, '24 Horas de Nürburgring', '2026-05-23', '24:00:00', 'Terminada'),
(3, 1, 'Trackday Nordschleife', '2026-06-15', '00:30:00', 'Terminada'),
(4, 3, '6 Horas de Le Mans de tarde', '2026-06-14', '06:00:00', 'Terminada'),
(5, 1, '8 Horas de Bahrain', '2026-11-07', '08:00:00', 'No corrida'),
(6, 1, 'Hotlap Challenge Sebring', '2026-03-12', '00:20:00', 'Terminada'),
(7, 1, 'Monza Hypercar Showdown', '2026-07-04', '03:00:00', 'No corrida'),
(8, 2, '6 Horas de Fuji', '2026-09-13', '06:00:00', 'No corrida'),
(9, 1, '6 Horas de Portimão', '2026-04-19', '06:00:00', 'Terminada'),
(10, 3, 'Lone Star Le Mans COTA', '2026-08-30', '06:00:00', 'No corrida');

CREATE TABLE `piloto` (
  `Piloto_ID` int NOT NULL,
  `Equipo_ID` int DEFAULT NULL,
  `Nombre` varchar(100) DEFAULT NULL,
  `Nivel` varchar(50) DEFAULT NULL,
  `Nacionalidad` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`Piloto_ID`),
  KEY `Equipo_ID` (`Equipo_ID`),
  CONSTRAINT `piloto_ID` FOREIGN KEY (`Equipo_ID`) REFERENCES `equipo` (`Equipo_ID`)
);
INSERT INTO `piloto` (`Piloto_ID`, `Equipo_ID`, `Nombre`, `Nivel`, `Nacionalidad`) VALUES
(1, 1, 'Sébastien Buemi', 'Platinum', 'Suiza'),
(2, 1, 'Brendon Hartley', 'Platinum', 'Nueva Zelanda'),
(3, 1, 'Ryo Hirakawa', 'Platinum', 'Japón'),
(4, 1, 'Kamui Kobayashi', 'Platinum', 'Japón'),
(5, 1, 'Mike Conway', 'Platinum', 'Reino Unido'),
(6, 1, 'Nyck de Vries', 'Platinum', 'Países Bajos'),
(7, 2, 'Kévin Estre', 'Platinum', 'Francia'),
(8, 2, 'André Lotterer', 'Platinum', 'Alemania'),
(9, 2, 'Laurens Vanthoor', 'Platinum', 'Bélgica'),
(10, 2, 'Matt Campbell', 'Platinum', 'Australia'),
(11, 2, 'Michael Christensen', 'Platinum', 'Dinamarca'),
(12, 2, 'Frédéric Makowiecki', 'Platinum', 'Francia'),
(13, 3, 'Antonio Fuoco', 'Platinum', 'Italia'),
(14, 3, 'Miguel Molina', 'Platinum', 'España'),
(15, 3, 'Nicklas Nielsen', 'Platinum', 'Dinamarca'),
(16, 3, 'Alessandro Pier Guidi', 'Platinum', 'Italia'),
(17, 3, 'James Calado', 'Platinum', 'Reino Unido'),
(18, 3, 'Antonio Giovinazzi', 'Platinum', 'Italia'),
(19, 4, 'Jean-Éric Vergne', 'Platinum', 'Francia'),
(20, 4, 'Mikkel Jensen', 'Platinum', 'Dinamarca'),
(21, 4, 'Nico Müller', 'Platinum', 'Suiza'),
(22, 4, 'Loïc Duval', 'Platinum', 'Francia'),
(23, 4, 'Paul di Resta', 'Platinum', 'Reino Unido'),
(24, 4, 'Stoffel Vandoorne', 'Platinum', 'Bélgica'),
(25, 5, 'Earl Bamber', 'Platinum', 'Nueva Zelanda'),
(26, 5, 'Alex Lynn', 'Platinum', 'Reino Unido'),
(27, 5, 'Sébastien Bourdais', 'Platinum', 'Francia'),
(28, 6, 'Will Stevens', 'Gold', 'Reino Unido'),
(29, 6, 'Callum Ilott', 'Gold', 'Reino Unido'),
(30, 6, 'Norman Nato', 'Gold', 'Francia'),
(31, 6, 'Jenson Button', 'Platinum', 'Reino Unido'),
(32, 6, 'Phil Hanson', 'Gold', 'Reino Unido'),
(33, 6, 'Oliver Rasmussen', 'Gold', 'Dinamarca'),
(34, 7, 'Dries Vanthoor', 'Platinum', 'Bélgica'),
(35, 7, 'Raffaele Marciello', 'Platinum', 'Suiza'),
(36, 7, 'Marco Wittmann', 'Platinum', 'Alemania'),
(37, 7, 'Sheldon van der Linde', 'Platinum', 'Sudáfrica'),
(38, 7, 'Robin Frijns', 'Platinum', 'Países Bajos'),
(39, 7, 'René Rast', 'Platinum', 'Alemania'),
(40, 8, 'Nicolas Lapierre', 'Platinum', 'Francia'),
(41, 8, 'Matthieu Vaxiviere', 'Gold', 'Francia'),
(42, 8, 'Mick Schumacher', 'Platinum', 'Alemania'),
(43, 8, 'Charles Milesi', 'Gold', 'Francia'),
(44, 8, 'Ferdinand Habsburg', 'Gold', 'Austria'),
(45, 8, 'Paul-Loup Chatin', 'Gold', 'Francia'),
(46, 11, 'Alex Malykhin', 'Bronze', 'Reino Unido'),
(47, 11, 'Joel Sturm', 'Silver', 'Alemania'),
(48, 11, 'Klaus Bachler', 'Gold', 'Austria'),
(49, 12, 'Yasser Shahin', 'Bronze', 'Australia'),
(50, 12, 'Morris Schuring', 'Silver', 'Países Bajos');



CREATE TABLE `vehiculo` (
  `Vehiculo_ID` int NOT NULL,
  `Equipo_ID` int DEFAULT NULL,
  `Nombre` varchar(100) DEFAULT NULL,
  `Marca` varchar(50) DEFAULT NULL,
  `Modelo` varchar(50) DEFAULT NULL,
  `Motor` varchar(50) DEFAULT NULL,
  `Potencia` varchar(20) DEFAULT NULL,
  `Categoria_ID` int DEFAULT NULL,
  PRIMARY KEY (`Vehiculo_ID`),
  KEY `Categoria_ID` (`Categoria_ID`),
  KEY `Equipo_ID` (`Equipo_ID`),
  CONSTRAINT `vehiculo_ibfk_1` FOREIGN KEY (`Categoria_ID`) REFERENCES `categoria` (`Categoria_ID`),
  CONSTRAINT `vehiculo_ibfk_2` FOREIGN KEY (`Equipo_ID`) REFERENCES `equipo` (`Equipo_ID`)
);
INSERT INTO `vehiculo` (`Vehiculo_ID`, `Equipo_ID`, `Nombre`, `Marca`, `Modelo`, `Motor`, `Potencia`, `Categoria_ID`) VALUES
(1, 1, 'Toyota GR010 Hybrid', 'Toyota', 'GR010', '3.5L V6 Twin-Turbo Hybrid', '680 CV', 1),
(2, 2, 'Porsche 963 LMDh', 'Porsche', '963', '4.6L V8 Twin-Turbo Hybrid', '680 CV', 1),
(3, 3, 'Ferrari 499P', 'Ferrari', '499P', '3.0L V6 Twin-Turbo Hybrid', '680 CV', 1),
(4, 4, 'Peugeot 9X8', 'Peugeot', '9X8', '2.6L V6 Twin-Turbo Hybrid', '680 CV', 1),
(5, 5, 'Cadillac V-Series.R', 'Cadillac', 'V-Series.R', '5.5L V8 aspirado Hybrid', '680 CV', 1),
(6, 6, 'Porsche 963 Privateer', 'Porsche', '963', '4.6L V8 Twin-Turbo Hybrid', '680 CV', 1),
(7, 7, 'BMW M Hybrid V8', 'BMW', 'M Hybrid V8', '4.0L V8 Twin-Turbo Hybrid', '680 CV', 1),
(8, 8, 'Alpine A424', 'Alpine', 'A424', '3.4L V6 Single-Turbo Hybrid', '680 CV', 1),
(9, 9, 'Lamborghini SC63', 'Lamborghini', 'SC63', '3.8L V8 Twin-Turbo Hybrid', '680 CV', 1),
(10, NULL, 'Oreca 07 Gibson', 'Oreca', '07', 'Gibson GK428 4.2L V8', '600 CV', 2),
(11, NULL, 'Ligier JS P217', 'Ligier', 'JS P217', 'Gibson GK428 4.2L V8', '600 CV', 2),
(12, 6, 'Hertz Team JOTA LMP2', 'Oreca', '07', 'Gibson GK428 4.2L V8', '600 CV', 2),
(13, NULL, 'Ligier JS P320', 'Ligier', 'JS P320', 'Nissan VK56 5.6L V8', '455 CV', 3),
(14, NULL, 'Duqueine D08', 'Duqueine', 'D08', 'Nissan VK56 5.6L V8', '455 CV', 3),
(15, 10, 'Ligier Proton Racing', 'Ligier', 'JS P320', 'Nissan VK56 5.6L V8', '455 CV', 3),
(16, 11, 'Porsche 911 GT3 R (992)', 'Porsche', '911 GT3 R', '4.2L Boxer 6 colas', '565 CV', 4),
(17, 7, 'BMW M4 GT3 Evo', 'BMW', 'M4 GT3', '3.0L Inline-6 Twin-Turbo', '590 CV', 4),
(18, 14, 'Ferrari 296 GT3', 'Ferrari', '296 GT3', '3.0L V6 Twin-Turbo', '600 CV', 4),
(19, 16, 'Aston Martin Vantage AMR GT3', 'Aston Martin', 'Vantage AMR', '4.0L V8 Twin-Turbo', '535 CV', 4),
(20, 18, 'Chevrolet Corvette Z06 GT3.R', 'Chevrolet', 'Corvette Z06', '5.5L V8 aspirado', '500 CV', 4),
(21, NULL, 'Porsche 718 Cayman GT4 RS', 'Porsche', '718 Cayman GT4', '4.0L Boxer 6 colas', '500 CV', 5),
(22, NULL, 'BMW M4 GT4 G82', 'BMW', 'M4 GT4', '3.0L Inline-6 Twin-Turbo', '470 CV', 5),
(23, NULL, 'Mercedes-AMG GT4', 'Mercedes-AMG', 'GT4', '4.0L V8 Twin-Turbo', '476 CV', 5),
(24, NULL, 'Audi R8 LMS GT4', 'Audi', 'R8 LMS', '5.2L V10 aspirado', '495 CV', 5),
(25, NULL, 'Toyota GR Supra GT4', 'Toyota', 'GR Supra', '3.0L Inline-6 Twin-Turbo', '430 CV', 5),
(26, NULL, 'Mazda 787B', 'Mazda', '787B', 'R26B 2.6L 4-Rotores Wankel', '700 CV', 6),
(27, NULL, 'BMW M3 GTR E46', 'BMW', 'M3 GTR', 'P60B40 4.0L V8 aspirado', '450 CV', 6),
(28, NULL, 'Porsche 911 GT1 Strassenversion', 'Porsche', '911 GT1', '3.2L Boxer 6 Twin-Turbo', '544 CV', 6),
(29, NULL, 'McLaren F1 GTR Longtail', 'McLaren', 'F1 GTR', 'BMW S70/2 6.1L V12', '600 CV', 6),
(30, NULL, 'Sauber Mercedes C9', 'Sauber Mercedes', 'C9', 'M119 5.0L V8 Twin-Turbo', '720 CV', 6);

CREATE TABLE `participacion` (
  `Participacion_ID` int NOT NULL AUTO_INCREMENT,
  `Piloto_ID` int NOT NULL,
  `Carrera_ID` int NOT NULL,
  `Vehiculo_ID` int NOT NULL,
  `Equipo_ID` int NOT NULL,
  `Tiempo_total` varchar(100) NOT NULL,
  `Posicion_final` varchar(100) NOT NULL,
  `Vueltas` varchar(100) NOT NULL,
  `Penalizacion` varchar(100) NOT NULL,
  `Combustible_restante` varchar(100) NOT NULL,
  PRIMARY KEY (`Participacion_ID`),
  KEY `fk_Participacion_Piloto_ID` (`Piloto_ID`),
  KEY `fk_Participacion_Carrera_ID` (`Carrera_ID`),
  KEY `fk_Participacion_Vehiculo_ID` (`Vehiculo_ID`),
  KEY `fk_Participacion_Equipo_ID` (`Equipo_ID`),
  CONSTRAINT `fk_Participacion_Piloto` FOREIGN KEY (`Piloto_ID`) REFERENCES `piloto` (`Piloto_ID`),
  CONSTRAINT `fk_Participacion_Carrera` FOREIGN KEY (`Carrera_ID`) REFERENCES `carrera` (`Carrera_ID`),
  CONSTRAINT `fk_Participacion_Vehiculo` FOREIGN KEY (`Vehiculo_ID`) REFERENCES `vehiculo` (`Vehiculo_ID`),
  CONSTRAINT `fk_Participacion_Equipo` FOREIGN KEY (`Equipo_ID`) REFERENCES `equipo` (`Equipo_ID`)
);
INSERT INTO `participacion` (`Piloto_ID`, `Carrera_ID`, `Vehiculo_ID`, `Equipo_ID`, `Tiempo_total`, `Posicion_final`, `Vueltas`, `Penalizacion`, `Combustible_restante`) VALUES
(1, 1, 1, 1, '24:00:15.123', '1°', '360 vueltas', 'Ninguna', '12 Litros'),
(2, 1, 1, 1, '24:00:32.456', '1°', '360 vueltas', 'Ninguna', '12 Litros'),
(3, 1, 1, 1, '24:01:05.789', '1°', '360 vueltas', 'Ninguna', '12 Litros'),
(7, 1, 2, 2, '24:00:48.210', '2°', '359 vueltas', '10s Stop&Go', '5 Litros'),
(8, 1, 2, 2, '24:01:12.654', '2°', '359 vueltas', 'Ninguna', '5 Litros'),
(13, 1, 3, 3, '24:02:19.432', '3°', '358 vueltas', 'Ninguna', '22 Litros'),
(14, 1, 3, 3, '24:02:44.876', '3°', '358 vueltas', 'Ninguna', '22 Litros'),
(19, 1, 4, 4, '24:05:30.111', '4°', '355 vueltas', 'Drive Through', '8 Litros'),
(25, 1, 5, 5, '24:08:12.999', '5°', '352 vueltas', 'Ninguna', '15 Litros'),
(46, 1, 16, 11, '24:01:45.000', '1° LMGT3', '320 vueltas', 'Ninguna', '4 Litros'),
(4, 2, 1, 1, '24:00:02.555', '1°', '380 vueltas', 'Ninguna', '3 Litros'),
(5, 2, 1, 1, '24:00:18.999', '1°', '380 vueltas', 'Ninguna', '3 Litros'),
(9, 2, 2, 2, '24:00:44.123', '2°', '380 vueltas', 'Ninguna', '18 Litros'),
(10, 2, 2, 2, '24:01:02.456', '2°', '380 vueltas', 'Ninguna', '18 Litros'),
(15, 2, 3, 3, '24:01:55.789', '3°', '379 vueltas', '5s de penalización', '30 Litros'),
(16, 2, 3, 3, '24:02:11.321', '3°', '379 vueltas', 'Ninguna', '30 Litros'),
(26, 2, 5, 5, '24:04:22.000', '4°', '376 vueltas', 'Ninguna', '14 Litros'),
(34, 2, 7, 7, '24:06:15.888', '5°', '375 vueltas', 'Ninguna', '9 Litros'),
(40, 2, 8, 8, '24:12:40.555', '6°', '370 vueltas', 'Drive Through', '2 Litros'),
(47, 2, 16, 11, '24:02:30.000', '1° LMGT3', '335 vueltas', 'Ninguna', '6 Litros'),
(6, 3, 1, 1, '08:00:45.120', '3°', '265 vueltas', 'Ninguna', '25 Litros'),
(11, 3, 2, 2, '07:59:58.321', '1°', '268 vueltas', 'Ninguna', '11 Litros'),
(12, 3, 2, 2, '08:00:12.444', '1°', '268 vueltas', 'Ninguna', '11 Litros'),
(17, 3, 3, 3, '08:00:25.654', '2°', '267 vueltas', 'Ninguna', '19 Litros'),
(18, 3, 3, 3, '08:00:40.987', '2°', '267 vueltas', 'Ninguna', '19 Litros'),
(27, 3, 5, 5, '08:02:14.000', '4°', '262 vueltas', 'Ninguna', '5 Litros'),
(28, 3, 6, 6, '08:03:50.555', '5°', '260 vueltas', 'Ninguna', '32 Litros'),
(35, 3, 7, 7, '08:04:11.222', '6°', '260 vueltas', 'Ninguna', '8 Litros'),
(41, 3, 8, 8, '08:05:33.111', '7°', '258 vueltas', '10s Stop&Go', '14 Litros'),
(48, 3, 16, 11, '08:01:05.000', '2° LMGT3', '230 vueltas', 'Ninguna', '7 Litros'),
(20, 4, 4, 4, '06:00:32.145', '2°', '195 vueltas', 'Ninguna', '40 Litros'),
(21, 4, 4, 4, '06:00:55.789', '2°', '195 vueltas', 'Ninguna', '40 Litros'),
(29, 4, 6, 6, '05:59:45.000', '1°', '197 vueltas', 'Ninguna', '15 Litros'),
(30, 4, 6, 6, '06:00:10.222', '1°', '197 vueltas', 'Ninguna', '15 Litros'),
(36, 4, 7, 7, '06:01:22.456', '3°', '194 vueltas', 'Ninguna', '22 Litros'),
(37, 4, 7, 7, '06:01:50.321', '3°', '194 vueltas', 'Ninguna', '22 Litros'),
(42, 4, 8, 8, '06:02:44.000', '4°', '192 vueltas', 'Drive Through', '5 Litros'),
(43, 4, 8, 8, '06:03:05.111', '4°', '192 vueltas', 'Ninguna', '5 Litros'),
(49, 4, 16, 12, '06:01:12.000', '1° LMGT3', '175 vueltas', 'Ninguna', '12 Litros'),
(50, 4, 16, 12, '06:01:38.000', '1° LMGT3', '175 vueltas', 'Ninguna', '12 Litros'),
(31, 5, 6, 6, '00:45:12.555', '1°', '22 vueltas', 'Ninguna', '55 Litros'),
(32, 5, 6, 6, '00:45:25.888', '2°', '22 vueltas', 'Ninguna', '53 Litros'),
(33, 5, 6, 6, '00:45:40.111', '3°', '22 vueltas', 'Ninguna', '54 Litros'),
(38, 5, 7, 7, '00:45:55.333', '4°', '22 vueltas', 'Ninguna', '48 Litros'),
(39, 5, 7, 7, '00:46:10.222', '5°', '22 vueltas', 'Ninguna', '49 Litros'),
(44, 5, 8, 8, '00:46:32.444', '6°', '21 vueltas', 'Ninguna', '60 Litros'),
(45, 5, 8, 8, '00:46:50.999', '7°', '21 vueltas', 'Ninguna', '58 Litros'),
(22, 5, 4, 4, '00:47:15.000', '8°', '20 vueltas', 'Ninguna', '62 Litros'),
(23, 5, 4, 4, '00:47:38.123', '9°', '20 vueltas', 'Aviso Límites', '61 Litros'),
(24, 5, 4, 4, '00:48:02.456', '10°', '19 vueltas', 'Ninguna', '65 Litros');

SELECT 
    p.Nombre AS Piloto, 
    e.Nombre AS Equipo, 
    v.Modelo AS Auto
FROM piloto p
JOIN equipo e ON p.Equipo_ID = e.Equipo_ID
JOIN vehiculo v ON e.Equipo_ID = v.Equipo_ID
WHERE v.Marca = 'Porsche' AND (v.Categoria_ID = 1 OR v.Categoria_ID = 4);

SELECT 
    c.Nombre AS Carrera, 
    p.Nombre AS Piloto, 
    e.Nombre AS Equipo, 
    v.Modelo AS Auto, 
    pa.Posicion_final AS Posicion, 
    pa.Tiempo_total AS Tiempo
FROM participacion pa
JOIN carrera c ON pa.Carrera_ID = c.Carrera_ID
JOIN piloto p ON pa.Piloto_ID = p.Piloto_ID
JOIN equipo e ON pa.Equipo_ID = e.Equipo_ID
JOIN vehiculo v ON pa.Vehiculo_ID = v.Vehiculo_ID
WHERE pa.Posicion_final LIKE '%°%' AND pa.Penalizacion = 'Ninguna'
ORDER BY c.Nombre, pa.Posicion_final;

SELECT 
    e.Nombre AS Equipo,
    SUM(CASE 
        WHEN pa.Posicion_final = '1°' THEN 25 
        WHEN pa.Posicion_final = '2°' THEN 18 
        ELSE 0 
    END) AS Puntos
FROM participacion pa
JOIN equipo e ON pa.Equipo_ID = e.Equipo_ID
WHERE pa.Vueltas IS NOT NULL AND e.Nombre != 'Privado'
GROUP BY e.Nombre
ORDER BY Puntos DESC;

SELECT 
    e.Nombre AS Equipo,
    COUNT(*) AS Total_Podios
FROM participacion pa
JOIN equipo e ON pa.Equipo_ID = e.Equipo_ID
WHERE pa.Posicion_final = '1°' OR pa.Posicion_final = '2°' OR pa.Posicion_final = '3°'
GROUP BY e.Nombre
ORDER BY Total_Podios DESC;


INSERT INTO `piloto` (`Piloto_ID`, `Nombre`, `Equipo_ID`) 
VALUES (51, 'Martin Flores', 7);


INSERT INTO `carrera` (`Carrera_ID`, `Nombre`, `Circuito_ID`, `Clima_ID`, `Duracion`, `Fecha`, `Estado`) 
VALUES (23	, 'Sebring Sprint', 3, 1, '2:00:00', '2026-06-20', 'Programada');

UPDATE carrera SET Nombre = '24 Horas de Spa', Duracion = '24:00:00' WHERE Carrera_ID = 1;
UPDATE carrera SET Circuito_ID = 6 WHERE Carrera_ID = 2;
UPDATE carrera SET Circuito_ID = 6, Nombre = '8 Horas de Nordschleife', Duracion = '08:00:00' WHERE Carrera_ID = 3;
UPDATE carrera SET Circuito_ID = 2 WHERE Carrera_ID = 4;
UPDATE carrera SET Circuito_ID = 7, Nombre = 'Sprint de Bahrain', Duracion = '00:45:00', Estado = 'Terminada' WHERE Carrera_ID = 5;
UPDATE carrera SET Circuito_ID = 3 WHERE Carrera_ID = 6;
UPDATE carrera SET Circuito_ID = 4 WHERE Carrera_ID = 7;
UPDATE carrera SET Circuito_ID = 5 WHERE Carrera_ID = 8;
UPDATE carrera SET Circuito_ID = 8 WHERE Carrera_ID = 9;
UPDATE carrera SET Circuito_ID = 9 WHERE Carrera_ID = 10;
INSERT INTO categoria_neumatico (FK_Categoria_ID, FK_ID_Neumatico) VALUES
(1,6),(1,7),
(2,2),(2,3),(2,6),(2,7),
(3,3),(3,5),(3,8),
(4,2),(4,3),(4,8),
(5,3),(5,5),(5,8),
(6,1),(6,2),(6,7);