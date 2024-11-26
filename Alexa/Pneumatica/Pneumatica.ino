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

void SendToServer(const char * device, const char * state)
{
    WiFiClient Client;
    HTTPClient Http;

    String Path = SERVERPATH + "/save";

    Http.begin(Client, Path.c_str());
    Http.addHeader("Content-Type", "application/json");
    char Json[100];

    sprintf(Json, "{\"device\":\"%s\", \"state\":\"%s\"}", device, state);
    Http.POST(Json);
    Http.end();
}

void Pistao(uint8_t State)
{
    digitalWrite(0, (~State) & 1);
    SendToServer("Pistao", State ? "ON" : "OFF");
}

void setup()
{
    Serial.begin(9600);

    pinMode(0, OUTPUT);
    digitalWrite(0, HIGH);

    WiFi.hostname("Esp Pneumática");
    WiFi.begin(ssid, password);
    while(WiFi.status() != WL_CONNECTED)
    {
        delay(500);
        Serial.print(".");
    }
    
    Serial.println("\nWiFi Connected");
    Serial.println(WiFi.localIP());

    Alexa.addDevice("Pistao", Pistao);
    Alexa.begin();
}

void loop()
{
    Alexa.loop();
    delay(1);
}