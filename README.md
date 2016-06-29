# NDBC latest
This is a simple nodejs script to pull data from the [National Data Buoy Center (NDBC)](http://www.ndbc.noaa.gov/), part of the National Oceanic Atmospheric Agency (NOAA).  NDBC collects sensor data from buoys around the globe and publishes it in a range of formats to support navigation and other efforts.

This script runs periodically (every 5 minutes) to pull the [latest observations](http://www.ndbc.noaa.gov/data/latest_obs/latest_obs.txt) collection from NDBC, downloading the text file over HTTP.  The file contains 2 header lines and usually a few hundred data lines.  The data lines are fixed-width delimited text.

    #STN     LAT      LON  YYYY MM DD hh mm WDIR WSPD   GST WVHT  DPD APD MWD   PRES  PTDY  ATMP  WTMP  DEWP  VIS   TIDE
    #text    deg      deg   yr mo day hr mn degT  m/s   m/s   m   sec sec degT   hPa   hPa  degC  degC  degC  nmi     ft
    13010   0.01     0.00  2016 06 29 19 00 190   5.1    MM   MM  MM   MM  MM     MM    MM  25.9  27.3    MM   MM     MM
    21598  30.26   136.45  2016 06 29 18 00  MM    MM    MM   MM  MM   MM  MM 1015.4    MM    MM  25.5    MM   MM     MM
    22101  37.24   126.02  2016 06 29 19 00 170   3.0    MM   MM  MM   MM  MM 1010.1    MM  19.8  18.2    MM   MM     MM

Each data line is parsed into a JSON object and a unified date string field is created based on the individual date/time fields.  The data is then sent to a kafka topic (ndbc_latest_obs) for further processing.

For this experiment I used Memsql Streamliner to read from the kafka topic and input the data into a Memsql table as a JSON field.  The table is configured to automatically parse the JSON field and persist the values as individual fields in the row.