/*
//
// Created by Killian Zhou on 14/04/2024.
//

#include "homeassistant.h"
#include <ArduinoWebsockets.h>
#include <WiFi.h>
#include "ArduinoJson.h"
#include "secrets.h"
#include "constants.h"

int number_of_entities = 0;
Entity* home_assistant_entities;

bool is_authed = false;
bool are_entities_retrieved = false;
bool are_entities_loaded = false;

void setup_home_assistant(websockets::WebsocketsClient* client){
    WiFi.begin(ssid, password);
    Serial.print("Connecting to Wifi : ");
    Serial.println(ssid);
    for(int i = 0; i < 10 && WiFi.status() != WL_CONNECTED; i++) {
        Serial.print(".");
        delay(1000);
    }
    if(WiFi.status() != WL_CONNECTED) {
        Serial.println("No Wifi!");
        return;
    }

    Serial.print("\nConnected to Wifi, Connecting to server : ");
    Serial.print(home_assistant_ip);
    Serial.print(":");
    Serial.print(home_assistant_port);
    Serial.println(home_assistant_path);

    bool connected = client->connect(home_assistant_ip, home_assistant_port, home_assistant_path);
    if(!connected) {
        Serial.println("Not Connected!");
        return;
    }

    Serial.println("Connected to home assistant!");

    client->onMessage([&client](websockets::WebsocketsMessage message) {
        Serial.print("Got Message: ");
        Serial.println(message.data());

        JsonDocument doc;
        DeserializationError error = deserializeJson(doc, message.data());

        if(error) {
            Serial.print(F("deserializeJson() failed: "));
            Serial.println(error.f_str());
            return;
        }

        handle_message(doc);
    });

    auth_home_assistant(client);

    get_entities_names(client);

    setup_entities_subscriptions(client);
}

void auth_home_assistant(websockets::WebsocketsClient* client){
    String auth_message = "{\"type\": \"auth\", \"access_token\": \"" + String(long_term_token) + "\"}";
    client->send(auth_message);
    Serial.print("sent: ");
    Serial.println(auth_message);
    int counter = 0;
    while (!is_authed) {
        counter++;
        delay(100*counter);
        client->poll();
    }
}
void handle_home_assistant_auth(const JsonDocument& doc){
    is_authed = true;
    Serial.println("Authenticated with Home Assistant");
}

void get_entities_names(websockets::WebsocketsClient* client){
    String entities_message = R"({"id": 1, "type": "get_states"})";
    client->send(entities_message);
    Serial.print("sent: ");
    Serial.println(entities_message);
    int counter = 0;
    while (!are_entities_retrieved) {
        counter++;
        delay(100*counter);
        client->poll();
    }
}
void init_entities(const JsonDocument& doc){

    if (doc["success"] == false) {
        Serial.println("Failed to get entities");
        return;
    }
    number_of_entities = doc["result"].size();
    Serial.print("Number of entities: ");
    Serial.println(number_of_entities);

    home_assistant_entities = new Entity[number_of_entities];
    String raw_blacklist = "";

    for(int i = 0; i < number_of_entities; i++) {
        home_assistant_entities[i].entity_id = doc["result"][i]["entity_id"].as<String>();
        home_assistant_entities[i].state = doc["result"][i]["state"].as<String>();
        home_assistant_entities[i].old_state = doc["result"][i]["state"].as<String>();
        home_assistant_entities[i].unit = doc["result"][i]["attributes"]["unit_of_measurement"].as<String>() == "null" ? "" : doc["result"][i]["attributes"]["unit_of_measurement"].as<String>();
        home_assistant_entities[i].device_class = doc["result"][i]["attributes"]["device_class"].as<String>();
        home_assistant_entities[i].friendly_name = doc["result"][i]["attributes"]["friendly_name"].as<String>();
    }

    are_entities_retrieved = true;
    are_entities_loaded = true;
}

String* get_entities_names(){
    String* entities_names = new String[number_of_entities];
    for(int i = 0; i < number_of_entities; i++){
        entities_names[i] = home_assistant_entities[i].friendly_name;
    }
    return entities_names;
}

void handle_message(const JsonDocument& doc){
    if (doc["type"] == "auth_ok") {
        handle_home_assistant_auth(doc);
        return;
    }
    if (doc["id"] == 1) {
        init_entities(doc);
        return;
    }
    if (doc["type"] == "event") {
        handle_state_changed(doc);
        return;
    }
}

void handle_state_changed(const JsonDocument& doc){
    const String entity_id = doc["event"]["variables"]["trigger"]["entity_id"].as<String>();
    const String state = doc["event"]["variables"]["trigger"]["to_state"]["state"].as<String>();
    const String unit = doc["event"]["variables"]["trigger"]["to_state"]["attributes"]["unit_of_measurement"].as<String>();
    const String device_class = doc["attributes"]["device_class"].as<String>(); // TODO : Check if this is correct

    for(int i = 0; i < number_of_entities; i++){
        if (home_assistant_entities[i].entity_id == entity_id){
            home_assistant_entities[i].old_state = home_assistant_entities[i].state;
            home_assistant_entities[i].state = state;
            if (unit != "null") home_assistant_entities[i].unit = unit;
            return;
        }
    }
}

void print_entities(){
    for(int i = 0; i < number_of_entities; i++){
        Serial.print("Entity ID: ");
        Serial.println(home_assistant_entities[i].entity_id);
        Serial.print("State: ");
        Serial.println(home_assistant_entities[i].state);
        Serial.print("Old State: ");
        Serial.println(home_assistant_entities[i].old_state);
        Serial.print("Unit: ");
        Serial.println(home_assistant_entities[i].unit);
        Serial.print("State Class: ");
        Serial.println(home_assistant_entities[i].device_class);
        Serial.print("Friendly Name: ");
        Serial.println(home_assistant_entities[i].friendly_name);
        Serial.println("--------------------");
    }
}

void setup_entities_subscriptions(websockets::WebsocketsClient* client){
    for(int i = 0; i < number_of_entities; i++){
        String subscribe_message = R"({"id": )" + String(i+2) + R"(, "type": "subscribe_trigger", "trigger": {"platform": "state", "entity_id": ")" + home_assistant_entities[i].entity_id + R"(", "to": null}})";
        Serial.println(subscribe_message);
        client->send(subscribe_message);
    }
}

struct Entity {
    String entity_id;
    String state;
    String old_state;
    String unit;
    String device_class;
    String friendly_name;
};
*/

type Entity = {
    entity_id: string,
    state: string,
    old_state: string,
    unit: string,
    device_class: string,
    friendly_name: string
}

export class HomeAssistant {
    private URL: string;
    private TOKEN: string | undefined;
    private _ws: WebSocket;
    private _entities: Entity[] = [];
    private _isAuthed: boolean = false;
    private _areEntitiesRetrieved: boolean = false;
    public areEntitiesLoaded: boolean = false;
    
    private additionalHandleMessage: ((message: MessageEvent) => void)[] = [];

    constructor() {
        this.URL = "ws://192.168.1.76:8123/api/websocket";
        this.TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiI0NDRhYzc2ZGIzZmI0MDVlYWQyYTMwNmRhYzZiYTMyZSIsImlhdCI6MTcxMzExNDk1MiwiZXhwIjoyMDI4NDc0OTUyfQ.sZbOSVtcRJRkyIpmYzOkCubyI2kQ32Zm4UuEfohKNsM";
        
        console.log({
            URL: this.URL,
            TOKEN: this.TOKEN
        })
        
        this._ws = new WebSocket(this.URL);
        this._ws.onmessage = this.handleMessage;
        this._ws.onopen = this.setupHomeAssistant;
    }

    private authHomeAssistant = () => {
        if (this.TOKEN) {
            this._ws.send(JSON.stringify({ type: "auth", access_token: this.TOKEN }));
        }
    }

    private handleHomeAssistantAuth = (doc: any) => {
        this._isAuthed = true;
    }

    private getEntitiesNames = () => {
        this._ws.send(JSON.stringify({ id: 1, type: "get_states" }));
    }

    private initEntities = (doc: any) => {
        if (doc.success === false) {
            console.log("Failed to get entities");
            return;
        }
        const entities = doc.result;
        this._entities = entities.map((entity: any) => {
            this._ws.send(JSON.stringify({ id: entities.indexOf(entity) + 2, type: "subscribe_trigger", trigger: { platform: "state", entity_id: entity.entity_id, to: null } }));
            return {
                entity_id: entity.entity_id,
                state: entity.state,
                old_state: entity.state,
                unit: entity.attributes.unit_of_measurement === "null" ? "" : entity.attributes.unit_of_measurement,
                device_class: entity.attributes.device_class,
                friendly_name: entity.attributes.friendly_name
            };
        });
        this._areEntitiesRetrieved = true;
        this.areEntitiesLoaded = true;
        console.log("Entities Loaded!")
    }

    private handleStateChanged = (doc: any) => {
        const entity_id = doc?.event?.variables?.trigger?.entity_id;
        const state = doc?.event?.variables?.trigger?.to_state?.state;
        const unit = doc?.event?.variables?.trigger?.to_state?.attributes?.unit_of_measurement;
        const device_class = doc?.attributes?.device_class;

        this._entities.forEach((entity: Entity) => {
            if (entity.entity_id === entity_id) {
                entity.old_state = entity.state;
                entity.state = state;
                if (unit !== "null") entity.unit = unit;
            }
        });
    }

    private handleMessage = (message: MessageEvent) => {
        console.log("Got Message: ", message.data);
        const doc = JSON.parse(message.data);
        if (doc.type === "auth_ok") {
            this.handleHomeAssistantAuth(doc);
            return;
        }
        if (doc.id === 1) {
            this.initEntities(doc);
            return;
        }
        if (doc.type === "event") {
            this.handleStateChanged(doc);
        }
        this.additionalHandleMessage.forEach((handler) => handler(message));
    }

    public setupHomeAssistant = () => {
        this.authHomeAssistant();
        this.getEntitiesNames();
    }

    public printEntities = () => {
        this._entities.forEach((entity: Entity) => {
            console.log("Entity ID: ", entity.entity_id);
            console.log("State: ", entity.state);
            console.log("Old State: ", entity.old_state);
            console.log("Unit: ", entity.unit);
            console.log("State Class: ", entity.device_class);
            console.log("Friendly Name: ", entity.friendly_name);
            console.log("--------------------");
        });
    }

    public get_entity_by_id = (entity_id: string) => {
        console.log({
            entity_id,
            entities: this._entities.find((entity: Entity) => entity.entity_id === entity_id)
        })
        return this._entities.find((entity: Entity) => entity.entity_id === entity_id);
    }
    
    public addMessageHandler = (handler: (message: MessageEvent) => void) => {
        this.additionalHandleMessage.push(handler);
    }
}