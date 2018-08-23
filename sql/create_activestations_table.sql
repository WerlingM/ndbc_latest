CREATE TABLE `ndbc_activestations` (
  `id` varchar(24) CHARACTER SET utf8 DEFAULT NULL,
  `lat` float DEFAULT NULL,
  `lon` float DEFAULT NULL,
  `name` varchar(64) CHARACTER SET utf8 DEFAULT NULL,
  `owner` varchar(64) CHARACTER SET utf8 DEFAULT NULL,
  `pgm` varchar(64) CHARACTER SET utf8 DEFAULT NULL,
  `type` varchar(64) CHARACTER SET utf8 DEFAULT NULL,
  `met` tinyint(1) DEFAULT NULL,
  `currents` tinyint(1) DEFAULT NULL,
  `waterquality` tinyint(1) DEFAULT NULL,
  `dart` tinyint(1) DEFAULT NULL,
  `db_id` BIGINT AUTO_INCREMENT PRIMARY KEY
) DEFAULT CHARSET=utf8;