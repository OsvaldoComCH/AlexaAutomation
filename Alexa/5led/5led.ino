#ifdef ARDUINO_ARCH_ESP32
#include <WiFi.h>
#include <HTTPClient.h>
#else
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#endif
#include <Espalexa.h>

String SERVERPATH = "http://192.168.137.1:3000";

const char * ssid = "alexaamilton";
const char * password = "87654321";

Espalexa Alexa;

void SendToServer(const char * device, uint8_t state)
{
    WiFiClient Client;
    HTTPClient Http;

    String Path = SERVERPATH + "/save";

    Http.begin(Client, Path.c_str());
    Http.addHeader("Content-Type", "application/json");
    char Json[100];

    sprintf(Json, "{\"device\":\"%s\", \"state\":%i}", device, state);
    Http.POST(Json);
    Http.end();
}

void SendToArduino(uint8_t data)
{
    uint8_t percent = Alexa.toPercent(data);
    Serial.println(percent);
    SendToServer("Barra", percent);
}

void setup()
{
    Serial.begin(9600);

    WiFi.hostname("esp 5led");
    WiFi.begin(ssid, password);
    while(WiFi.status() != WL_CONNECTED)
    {
        delay(500);
    }
    //WiFi.localIP()

    Alexa.addDevice("Barra", SendToArduino);
    Alexa.begin();
}

void loop()
{
    Alexa.loop();
    delay(1);
}