# NDBC latest
This is a simple nodejs script to pull data from the [National Data Buoy Center (NDBC)](http://www.ndbc.noaa.gov/), part of the National Oceanic Atmospheric Agency (NOAA).  NDBC collects sensor data from buoys around the globe and publishes it in a range of formats to support navigation and other efforts.

This script runs periodically (every 5 minutes) to pull the [latest observations](http://www.ndbc.noaa.gov/data/latest_obs/latest_obs.txt) collection from NDBC, downloading the text file over HTTP.  The file contains 2 header lines and usually a few hundred data lines.  The data lines are fixed-width delimited text.

    #STN     LAT      LON  YYYY MM DD hh mm WDIR WSPD   GST WVHT  DPD APD MWD   PRES  PTDY  ATMP  WTMP  DEWP  VIS   TIDE
    #text    deg      deg   yr mo day hr mn degT  m/s   m/s   m   sec sec degT   hPa   hPa  degC  degC  degC  nmi     ft
    13010   0.01     0.00  2016 06 29 19 00 190   5.1    MM   MM  MM   MM  MM     MM    MM  25.9  27.3    MM   MM     MM
    21598  30.26   136.45  2016 06 29 18 00  MM    MM    MM   MM  MM   MM  MM 1015.4    MM    MM  25.5    MM   MM     MM
    22101  37.24   126.02  2016 06 29 19 00 170   3.0    MM   MM  MM   MM  MM 1010.1    MM  19.8  18.2    MM   MM     MM

Each data line is parsed into a JSON object and a unified date string field is created based on the individual date/time fields.  The data is then sent to a kafka topic (ndbc_latest_obs) for further processing.

Data points are submitted to Zoomdata via the Upload API or stored in a specified MySQL database (or MemSQL, which is MySQL compatible).

# Set Up
To set up, first create the target storage location(s), using either Zoomdata Upload API or a MySQL database.  Then, create the connection settings to persist your choices for storage.  

## Upload API
The data source must exist in Zoomdata.  Use the following sample to create the Upload source:

  ```json
  [{
    "station_id":"PKYF1",
    "lat":24.918,
    "lon":-80.747,
    "year":2018,
    "month":4,
    "day":2,
    "hour":14,
    "minute":0,
    "wind_dir":140,
    "wind_speed":4.0,
    "gust":6.0,
    "wave_height":0.6,
    "dpd":7,
    "apd":5.1,
    "mwd":132,
    "pressure":1017.8,
    "ptdy":1.2,
    "air_temp":30.2,
    "water_temp":24.3,
    "dewpoint":10.0,
    "vis":2.3,
    "tide":1.47,
    "obs_time":"2018-04-02 14:00:00",
    "lat_attr":"24.918",
    "lon_attr":"-80.747"
  }]
  ```

  Update the connection variables in the renderer.js source file with the URL and key for the upload source.  Update the sourceId in each of the data sources (e.g. NdbcData.js).

## Database Direct Storage
A connection could target a MySQL or MemSQL (any MySQL compatible database) table.  The target table must be created.

## Create Settings
