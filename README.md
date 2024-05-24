# ICE Room Clock

A little room clock to have time and interactions in the lowcaltech. Works alongside a home assistant requiring an
entity for the time, the temperature and the announcements.

## Home Assistant Entity
- "sensor.time" : A _time entity_ from the _Date & Time_ integration 
- "input_text.test_temp" : A ESP32 with a DHT22 sensor sending the temperature
- "input_text.announcement" : A _text entity_ to display the announcements

## Run

```bash
npm run dev
```
