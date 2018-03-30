create database ndbc;

use ndbc;
CREATE TABLE `observations` (
  `json_data` JSON COLLATE utf8_bin DEFAULT NULL,
  `memsql_insert_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `station_id` as TRIM(BOTH "\"" FROM json_data::stn) PERSISTED varchar(24) CHARACTER SET utf8 COLLATE utf8_general_ci,
  `year` as json_data::year PERSISTED int(11),
  `month` as json_data::month PERSISTED int(11),
  `day` as json_data::day PERSISTED int(11),
  `hour` as json_data::hour PERSISTED int(11),
  `minute` as json_data::minute PERSISTED int(11),
  `lat` as json_data::lat PERSISTED float,
  `lon` as json_data::lon PERSISTED float,
  `wind_dir` as json_data::wind_dir PERSISTED int(11),
  `wind_speed` as json_data::wind_speed PERSISTED float,
  `gust` as json_data::gust PERSISTED float,
  `wave_height` as json_data::wave_height PERSISTED float,
  `mwd` as json_data::mwd PERSISTED int(11),
  `pressure` as json_data::pressure PERSISTED float,
  `ptdy` as json_data::ptdy PERSISTED float,
  `air_temp` as json_data::air_temp PERSISTED float,
  `water_temp` as json_data::water_temp PERSISTED float,
  `dewpoint` as json_data::dewpoint PERSISTED float,
  `tide` as json_data::tide PERSISTED float,
  `vis` as json_data::vis PERSISTED float,
  `dpd` as json_data::dpd PERSISTED int(11),
  `apd` as json_data::apd PERSISTED float,
  `obs_time` as TIMESTAMP(TRIM(BOTH "\"" FROM json_data::obs_time)) PERSISTED datetime,
  KEY `memsql_insert_time` (`memsql_insert_time`)
  /*!90618 , SHARD KEY () */
);