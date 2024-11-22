#ifdef ARDUINO_ARCH_ESP32
#include <WiFi.h>
#include <HTTPClient.h>
#else
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#endif
#include <Espalexa.h>

#define ESPALEXA_DEBUG

String SERVERPATH = "http://192.168.137.1:3000";

const char * ssid = "alexaamilton";
const char * password = "87654321";

Espalexa Alexa;

void SendToServer(char * device, uint8_t state)
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

void LuzPequena(uint8_t State)
{
    digitalWrite(2, State & 1);
    SendToServer("Luz Pequena", State);
}

void LuzGrande(uint8_t State)
{
    digitalWrite(23, (~State) & 1);
}

void Motor(uint8_t State)
{
    digitalWrite(4, (~State) & 1);
}

void setup()
{
    Serial.begin(9600);

    pinMode(2, OUTPUT);
    pinMode(4, OUTPUT);
    digitalWrite(4, HIGH);
    pinMode(23, OUTPUT);
    digitalWrite(23, HIGH);

    WiFi.hostname("Gol Quadrado Turbo com Escada");
    WiFi.begin(ssid, password);
    while(WiFi.status() != WL_CONNECTED)
    {
        delay(500);
        Serial.print(".");
    }
    
    Serial.println("\nWiFi Connected");
    Serial.println(WiFi.localIP());

    Alexa.addDevice("Luz Pequena", LuzPequena);
    Alexa.addDevice("Luz Grande", LuzGrande);
    Alexa.addDevice("Motor", Motor);
    Alexa.begin();
}

void loop()
{
    Alexa.loop();
    delay(1);
}